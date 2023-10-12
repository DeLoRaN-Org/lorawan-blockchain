/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Device, DeviceHelper, DeviceSession } from './asset';
import * as express from 'express';
import LoraPacket from 'lora-packet/out/lib/LoraPacket';

import {
    ContractType,
    get16peer2orgsContracts,
    get2peer2orgsContracts,
    get8peer2orgsContracts
} from './connect';
import { EventsOptions } from '@hyperledger/fabric-gateway';

let LoRaPacket = require('lora-packet');

const channelName = 'lorawan';
const chaincodeName = 'lorawan-chaincode';

const app = express()
const port = process.env.PORT || 3000;
app.use(express.json())

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

const mspIdOrg1 = 'Org1MSP';
const mspIdOrg2 = 'Org2MSP';

const utf8Decoder = new TextDecoder();


let committed = 0
let not_committed = 0

let last_block_hash: string = null



async function main() {
    try {
        let contracts = await get16peer2orgsContracts()
        //let contracts = await get8peer2orgsContracts()
        //let contracts = await get2peer2orgsContracts()

        console.log('Got all contracts')
        
        app.get('/getPublicBlockchainState', async (req, res) => {
            try {
                console.log('\n--> Evaluate Transaction: GetPublicBlockchainState, function returns every packet');
                let result = utf8Decoder.decode(await contracts.getNextPeerContract(1, ContractType.PACKETS).evaluateTransaction('GetPublicBlockchainState'));
                let output = JSON.parse(result);
                //console.log(`*** Result:`, output);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send(JSON.stringify(output));
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))
            }
        })

        app.get('/hash', async (req, res) => {
            try {
                console.log('\n--> Evaluate Transaction: GetChainHash, function returns hash of the public state');
                let result = utf8Decoder.decode( await contracts.getNextPeerContract(1, ContractType.DEVICES).evaluateTransaction('GetChainHash'));
                console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send(result.toString())
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))
            }
        })
        
        app.get('/getPacket/:hash', async (req, res) => {
            try {
                let hash: string = req.params.hash
                //console.log(hash)
                console.log('\n--> Evaluate Transaction: ReadPacket, function returns an packet with a given hash');
                let result = utf8Decoder.decode(await contracts.getNextPeerContract(1, ContractType.PACKETS).evaluateTransaction('ReadPacket', hash));
                console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send(result.toString())
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))
            }
        })
        
        app.get('/getPacket2/:hash', async (req, res) => {
            try {
                let hash: string = req.params.hash
                //console.log(hash)
                console.log('\n--> Evaluate Transaction: ReadPacket, function returns an packet with a given hash');
                let result = utf8Decoder.decode(await contracts.getNextPeerContract(2, ContractType.PACKETS).evaluateTransaction('ReadPacket', hash));
                console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send(result.toString())
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))
            }
        })

        app.get('/getPrivatePacket/:hash', async (req, res) => {
            try {
                let hash: string = req.params.hash
                //console.log(hash)
                console.log('\n--> Evaluate Transaction: ReadPacket, function returns an packet with a given hash');
                let result = utf8Decoder.decode( await contracts.getNextPeerContract(1, ContractType.PACKETS).evaluateTransaction('ReadPrivatePacket', hash));
                //console.log(`*** Result: ${result.toString()}`);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send(result.toString())
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))
            }
        })
        
        app.get('/getPrivatePacket2/:hash', async (req, res) => {
            try {
                let hash: string = req.params.hash
                //console.log(hash)
                console.log('\n--> Evaluate Transaction: ReadPacket, function returns an packet with a given hash');
                let result = utf8Decoder.decode( await contracts.getNextPeerContract(2, ContractType.PACKETS).evaluateTransaction('ReadPrivatePacket', hash));
                //console.log(`*** Result: ${result.toString()}`);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send(result.toString())
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))
            }
        })

        //PRIVATE
        app.post('/uploadPacket', async (req, res) => {
            console.log(req.body)
            let packet: string = req.body.packet
            let n_id: string = req.body.n_id
            let date: string = req.body.date
            let answer: string = req.body.answer
            let join_accept: string = req.body.join_accept

            console.log('\n--> Submit Transaction: CreatePacket, creates new packet with its bytes and network controller ID');
            let packet_buffer = Buffer.from(packet, 'hex')
            let p: LoraPacket = LoRaPacket.fromWire(packet_buffer) 
            let dev_id = (p.DevAddr || p.DevEUI).toString('hex') //does not work for join accepts

            let transientData: any = {
                packet: packet_buffer,
                n_id: Buffer.from(n_id),
                date: Buffer.from(date)
            }

            if(answer) {
                transientData.answer = Buffer.from(answer, 'hex')
            }
            if(join_accept) {
                transientData.join_accept = Buffer.from(join_accept, 'hex')
            }

            //console.log(transientData)

            try {
                utf8Decoder.decode(await contracts.getNextPeerContract(1, ContractType.PACKETS).submit('CreatePacket', {
                    transientData
                }))
                console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send()
            } catch (err) {
                console.error(err)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(err))
            }
        })

        //partially PRIVATE
        app.post('/createDevice', async (req, res) => {
            let device: Device = req.body.device
            //console.log(device)

            let split = DeviceHelper.to_conf_session(device)
            try {
                console.log('\n--> Submit Transaction: CreateDeviceConfig');
                //console.log(split.conf)
                await contracts.getNextPeerContract(1, ContractType.DEVICES).submitTransaction('CreateDeviceConfig', JSON.stringify(split.conf));
                console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                if(split.sess) {
                    console.log('\n--> Submit Transaction: CreateDeviceSession');
                    //console.log(split.sess)

                    await contracts.getNextPeerContract(1, ContractType.DEVICES).submit('CreateDeviceSession', {
                        transientData: {
                            session: Buffer.from(JSON.stringify(split.sess)),
                            dev_eui: Buffer.from(device.dev_eui)
                        }
                    })

                    console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                }
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send()
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))      
            }
        })
        
        //PRIVATE
        app.post('/createDeviceSession', async (req, res) => {
            let device_session: DeviceSession = req.body.device_session
            let dev_eui: string = req.body.dev_eui
            //console.log(device_session)
            try {
                console.log('\n--> Submit Transaction: CreateDeviceSession');
                await contracts.getNextPeerContract(1, ContractType.DEVICES).submit('CreateDeviceSession', {
                    transientData: {
                        device_session: Buffer.from(JSON.stringify(device_session)),
                        dev_eui: Buffer.from(dev_eui,'hex')
                    }
                })
                console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send()
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))      
            }
        })

        app.delete('/device/:info/:dev_eui_or_addr', async (req, res) => {
            try {
                let info: string = req.params.info
                if(info === "config") {
                    let dev_eui: string = req.params.dev_eui_or_addr
                    //console.log(dev_eui)
                    console.log(`\n--> Submit Transaction: DeleteDevice, delete device ${dev_eui}`);
                    await contracts.getNextPeerContract(1, ContractType.DEVICES).submitTransaction('DeleteDevice', dev_eui);
                    console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                    committed += 1
                    if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                    res.status(200).send()
                } else if (info === 'session') {
                    let dev_addr: string = req.params.dev_eui_or_addr
                    //console.log(dev_addr)
                    console.log(`\n--> Submit Transaction: DeleteDeviceSession, delete session for ${dev_addr}`);
                    await contracts.getNextPeerContract(1, ContractType.DEVICES).submitTransaction('DeleteDeviceSession', dev_addr);
                    console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                    committed += 1
                    if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                    res.status(200).send()
                } else {
                    res.status(404).send()
                }
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))
            }
        })

        app.get('/device/:dev_eui', async (req, res) => {
            try {
                let dev_eui: string = req.params.dev_eui
                //console.log(dev_eui)
                console.log('\n--> Evaluate Transaction: ReadDevice, function returns device config');
                let result = utf8Decoder.decode(await contracts.getNextPeerContract(1, ContractType.DEVICES).evaluateTransaction('ReadDevice', dev_eui));
                console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                //console.log(`*** Result: ${result.toString()}`);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send(result.toString())
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))
            }
        })

        app.get('/device/:info/:dev_id', async (req, res) => {
            if(req.params.info === 'session') {
                try {
                    let dev_addr: string = req.params.dev_id
                    //console.log(dev_addr)
                    console.log('\n--> Evaluate Transaction: ReadDeviceSession, function returns a device session by dev_addr: ' + dev_addr);
                    let result = utf8Decoder.decode(await contracts.getNextPeerContract(1, ContractType.DEVICES).evaluateTransaction('ReadDeviceSession', dev_addr));
                    console.log(`*** Result: ${result.toString()}`);
                    committed += 1
                    if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                    res.status(200).send(result.toString())
                } catch (error) {
                    console.error(error)
                    console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                    not_committed += 1
                    res.status(500).send(JSON.stringify(error))
                }
            } else if (req.params.info === 'config') {
                try {
                    let dev_eui: string = req.params.dev_id
                    //console.log(dev_eui)
                    console.log('\n--> Evaluate Transaction: ReadDeviceConfig, function returns an device config by dev_eui: ' + dev_eui);
                    let result = utf8Decoder.decode( await contracts.getNextPeerContract(1, ContractType.DEVICES).evaluateTransaction('ReadDeviceConfig', dev_eui));
                    console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                    committed += 1
                    if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                    res.status(200).send(result.toString())
                } catch (error) {
                    console.error(error)
                    console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                    not_committed += 1
                    res.status(500).send(JSON.stringify(error))
                }
            } else {
                res.status(404).send()
            }

        })

        //app.get('/entryExists/:dev_id', async (req, res) => {
        //    try {
        //        let dev_id: string = req.params.dev_id
        //        //console.log(dev_id)
        //        console.log('\n--> Evaluate Transaction: EntryExists, function returns "true" if an device with given deviceID exist');
        //        //let result = JSON.parse((await contracts.getNextPeerContract(1, ContractType.DEVICES).evaluateTransaction('EntryExists', dev_id)).toString());
        //        console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
        //        committed += 1
        //        if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
        //        res.status(200).send()
        //    } catch (error) {
        //        console.error(error)
        //        console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
        //        not_committed += 1
        //        res.status(500).send(JSON.stringify(error))
        //    }
        //})

        //maybe PRIVATE(?)
        //app.post('/increaseDevCounter', async (req, res) => {
        //    try {
        //        let new_value = req.body.new_value
        //        let dev_id = req.body.dev_id
        //        let counter_type = req.body.counter_type
        //        //console.log(req.body)
        //        console.log(`\n--> Submit Transaction: IncreaseDevCounter ${dev_id}, change ${counter_type} to ${new_value}`);
        //        //TODO cambiare la transaction a private in base al tipo di counter da incrementare (tutto tranne join_nonce)
        //        await contracts.getNextPeerContract(1, ContractType.DEVICES).submitTransaction('IncreaseDevCounter', dev_id, counter_type, new_value.toString());
        //        console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
        //        committed += 1
        //        if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
        //        res.status(200).send()
        //    } catch (error) {
        //        console.error(error)
        //        console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
        //        not_committed += 1
        //        res.status(500).send(JSON.stringify(error))
        //    }
        //})

        app.get('/allDevices', async (req, res) => {
            // Let's try a query type operation (function).
            // This will be sent to just one peer and the results will be shown.
            try {
                console.log('\n--> Evaluate Transaction: GetAllDevices, function returns all the current devicess on the ledger');
                let result = utf8Decoder.decode( await contracts.getNextPeerContract(1, ContractType.DEVICES).evaluateTransaction('GetAllDevices'));
                console.log(`${colors.GREEN}*** Result: committed${colors.RESET}`);
                committed += 1
                if(committed % 25 == 0) console.log(`${colors.YELLOW}Committed: ${committed}, Not Committed: ${not_committed}${colors.RESET}`)
                res.status(200).send(result.toString())
            } catch (error) {
                console.error(error)
                console.error(`${colors.RED}*** Result: NOT COMMITTED${colors.RESET}`);
                not_committed += 1
                res.status(500).send(JSON.stringify(error))
            }
        })

        app.listen(port, () => {
            console.log('Blockchain_API listening on port', port)
        })
        //let events = ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException']
        //for(let e of events) {
        //    process.on(e, () => {
        //        server.closeAllConnections()
        //        console.log(`Received signal ${e}`)
        //        server.close()
        //    })
        //}
        // Disconnect from the gateway when the application is closing
        // This will close all connections to the network
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

main();