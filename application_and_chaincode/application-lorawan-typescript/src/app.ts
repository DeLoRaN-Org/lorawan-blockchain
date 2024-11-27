/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { DeviceConfiguration, DeviceSession } from './asset';

import {
    ContractType,
    getContracts,
    PeerContract
} from './connect';
import path = require('path');
import { createSocket } from 'dgram'
import { ProposalOptions } from '@hyperledger/fabric-gateway';

//let LoRaPacket = require('lora-packet');

const channelName = 'lorawan';
const chaincodeName = 'lorawan';

//const app = express()
const port = Number(process.env.PORT) || 9999;
let contracts: PeerContract = null;


//app.use(express.json())

let colors = {
    RESET: '\x1B[0m',
    RED: '\x1B[0;31m',
    GREEN: '\x1B[0;32m',
    BLUE: '\x1B[0;34m',
    YELLOW: '\x1B[1;33m',
}

/**
 * To see the SDK workings, try setting the logging to show on the console before running
 *        export HFC_LOGGING='{debug:"console"}`
*/
const utf8Decoder = new TextDecoder();

const tls_path = path.resolve(
    '/opt',
    'fabric',
    'crypto',
    'peer',
    'tls',
    'ca.crt'
);

const cert_path = path.resolve(
    '/opt',
    'fabric',
    'crypto',
    'peer',
    'msp',
    'signcerts',
    process.env.CORE_PEER_ID + '-cert.pem'
);

const keystore = path.resolve(
    '/opt',
    'fabric',
    'crypto',
    'peer',
    'msp',
    'keystore'
);

async function send_transaction(contract: ContractType, function_name: string, invoke: boolean, transientData?: Record<string, string | Uint8Array>, args?: (string | Uint8Array)[]): Promise<string> {
    let c = contracts.getContract(contract)
    let ans = null

    let options: ProposalOptions = {}
    if (transientData) options.transientData = transientData
    if (args) options.arguments = args

    
    if (invoke) {
        ans = utf8Decoder.decode(await c.submit(function_name, options))
    } else {
        ans = utf8Decoder.decode(await c.evaluate(function_name, options))
    }
    //console.log(colors.RED, ans, colors.RESET)
    return ans
}


//function get_device_session(dev_addr: string) {
//    let transientData: any = {
//        packet: packet_buffer,
//        n_id: Buffer.from(n_id),
//        date: Buffer.from(date)
//    }
//
//    utf8Decoder.decode(await contracts.getNextPeerContract(1, ContractType.PACKETS).submit('CreatePacket', {
//        transientData
//    }))
//}


async function join_procedure(join_request: Buffer, join_accept: Buffer, nc_id: string, dev_eui: string): Promise<{
    winner: string,
    keys: string[]
}> {
    let transientData: any = {
        join_request: [...join_request],
        join_accept: [...join_accept],
        date: `${new Date().getTime()}`
    }
    
    let time = Date.now()
    await send_transaction(ContractType.PACKETS, 'JoinRequestPreDeduplication', true, transientData)
    let after = Date.now()
    let elapsed = after - time
    //console.log(colors.RED + 'Elapsed time: ' + elapsed + colors.RESET)

    let convergence_time_after_transaction = (3500 - elapsed)
    if(convergence_time_after_transaction > 0) await new Promise(resolve => setTimeout(resolve, convergence_time_after_transaction))
    
    //async sleep function
    //time = Date.now()
    //elapsed = Date.now() - time
    //console.log(colors.YELLOW + 'Elapsed time: ' + elapsed + colors.RESET)
    
    transientData = { dev_eui }
    let ans = JSON.parse(await send_transaction(ContractType.PACKETS, 'JoinRequestDeduplication', false, transientData))
    return ans.content
    //if(ans.content.winner != nc_id) {
    //    //console.log(colors.RED + 'Join Request already processed' + colors.RESET)
    //    return false
    //} 

    //transientData = { 
    //    keys: JSON.stringify(ans.content.keys),
    //    dev_eui
    //}

    //await send_transaction(ContractType.PACKETS, 'JoinRequestSessionGeneration', true, transientData)
    //return true
}

async function session_generation(dev_eui: string, keys: string[]): Promise<void> {
    let transientData: any = { 
        keys: JSON.stringify(keys), 
        dev_eui
    }
    await send_transaction(ContractType.PACKETS, 'JoinRequestSessionGeneration', true, transientData)
    return
}


async function create_uplink(packet: Buffer, date: string, answer?: Buffer): Promise<void>  {
    let transientData: any = { packet, date };
    if (answer !== undefined) {
        transientData.answer = answer;
    }
    await send_transaction(ContractType.PACKETS, 'CreatePacket', true, transientData)
    return 
}

async function create_device_config(device: DeviceConfiguration): Promise<void>  {
    await send_transaction(ContractType.DEVICES, 'CreateDeviceConfig', true, undefined, [JSON.stringify(device)])
    return 
}

async function get_device_config(dev_eui: string): Promise<DeviceConfiguration>  {
    let args: any = [dev_eui]
    let ans = JSON.parse(await send_transaction(ContractType.DEVICES, 'ReadDeviceConfig', false, undefined, args))
    return JSON.parse(ans.content)
}

async function get_device_session(dev_addr: string): Promise<DeviceSession>  {
    let args: any = [dev_addr]
    let ans = JSON.parse(await send_transaction(ContractType.DEVICES, 'ReadDeviceSession', false, undefined, args))
    return JSON.parse(ans.content)
}

async function main() {

    contracts = await getContracts(tls_path, process.env.CORE_PEER_ADDRESS, process.env.CORE_PEER_ID, cert_path, 'Org' + process.env.ORG_NUM + 'MSP', keystore, channelName, chaincodeName)
    //udp socket listening on port 9999
    const server = createSocket('udp4')

    
    server.on('message', async (msg, rinfo) => {
        //console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        
        let body = null
        try {
            body = JSON.parse(msg.toString());
        } catch (e) {
            console.log(colors.RED + 'Error parsing message' + colors.RESET)
            console.log(e)
            return
        }

        let ans_to_send = null
        try {
            switch (body.type) {
                case 'join_procedure': {
                    let ans = await join_procedure(Buffer.from(body.join_request), Buffer.from(body.join_accept), body.nc_id, body.dev_id)
                    ans_to_send = { ok: true, content: ans }
                    break
                }
                case 'session_generation': {
                    await session_generation(body.dev_eui, body.keys)
                    ans_to_send = { ok: true }
                    break
                }
                case 'create_uplink': {
                    await create_uplink(Buffer.from(body.packet), body.date, body.answer ? Buffer.from(body.answer) : undefined)
                    ans_to_send = { ok: true }
                    break
                }
                case 'create_device_config': {
                    await create_device_config(body.device)
                    ans_to_send = { ok: true }
                    break
                }
                case 'get_device_config': {
                    let config = await get_device_config(body.dev_eui)
                    ans_to_send = { ok: true, content: config }
                    break
                }
                case 'get_device_session': {
                    let session = await get_device_session(body.dev_addr)
                    ans_to_send = { ok: true, content: session }
                    break
                }
            }
        } catch (e) {
            console.log(colors.RED + `Error in ${body.type}` + colors.RESET)
            console.log(e)
            ans_to_send = { ok: false, error_message: e.message }
        }

        //console.log(colors.BLUE + 'Sending answer to' + rinfo.address + rinfo.port + ': ' + JSON.stringify(ans_to_send) + colors.RESET)
        server.send(JSON.stringify(ans_to_send), rinfo.port, rinfo.address)
    });
    
    server.on('error', (err) => {
        console.error(`server error:\n${err.stack}`);
        server.close();
    });
    server.on('listening', () => {
        const address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
    });
    server.bind(port);
}

main();