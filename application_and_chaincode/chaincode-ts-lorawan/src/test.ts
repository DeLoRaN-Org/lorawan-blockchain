/*import { Context } from 'fabric-contract-api';
import LoRaPacket from 'lora-packet'
import LoraPacket from 'lora-packet/out/lib/LoraPacket';
import sortKeysRecursive from 'sort-keys-recursive';
import { LoRaWANCounterType, DeviceSession, LoRaWANVersion, ChainLoRaWANPacketHelper, DeviceConfiguration } from './asset';
import stringify from 'json-stringify-deterministic';

let ignoredKeys: string[] = [
    "dev_eui",
    "join_eui",
    "nwk_key",
    "app_key",
    "js_int_key",
    "js_enc_key",
    "dev_addr",
    "app_key",
    "fnwk_s_int_key",
    "snwk_s_int_key",
    "nwk_s_enc_key",
    "home_net_id",
    "dev_addr",
    "app_s_key"
]

function IncreaseDevCounter(assetJSON: any, counter_t: LoRaWANCounterType, new_value: number): DeviceConfiguration | DeviceSession {
    //console.log('Invoked IncreaseDevCounter')
    let is_config = false
    if (counter_t == LoRaWANCounterType.RJ_COUNT1 ||
        counter_t == LoRaWANCounterType.JOIN_NONCE ||
        counter_t == LoRaWANCounterType.DEV_NONCE) {
            is_config = true
    }
     
    let deviceSession: DeviceSession
    let deviceConfig: DeviceConfiguration
    let dev_id: string

    if(is_config) {
        deviceConfig = JSON.parse(assetJSON.toString())
        dev_id = Buffer.from(deviceConfig.dev_eui).toString('hex')
    } else {
        deviceSession = JSON.parse(assetJSON.toString())
        dev_id = Buffer.from(deviceConfig.dev_addr).toString('hex')
    }

    switch (counter_t) {
        case LoRaWANCounterType.AF_CNT_DWN: {
            //if(!device.session) throw new Error(`Device ${dev_id} is not initialized`)
            let old_value = deviceSession.af_cnt_dwn
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`)
            }
            deviceSession.af_cnt_dwn = new_value
            break
        }
        case LoRaWANCounterType.F_CNT_UP: {
            //if(!deviceSession.session) throw new Error(`Device ${dev_id} is not initialized`)
            let old_value = deviceSession.f_cnt_up
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`)
            }
            deviceSession.f_cnt_up = new_value
            break
        }
        case LoRaWANCounterType.NF_CNT_DWN: {
            //if(!deviceSession.session) throw new Error(`Device ${dev_id} is not initialized`)
            let old_value = deviceSession.nf_cnt_dwn
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`)
            }
            deviceSession.nf_cnt_dwn = new_value
            break
        }
        case LoRaWANCounterType.RJ_COUNT0: {
            //if(!deviceSession.session) throw new Error(`Device ${dev_id} is not initialized`)
            let old_value = deviceSession.rj_count0
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`)
            }
            deviceSession.rj_count0 = new_value
            break
        }
        case LoRaWANCounterType.RJ_COUNT1: {
            let old_value = deviceConfig.rj_count1
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`)
            }
            deviceConfig.rj_count1 = new_value
            break
        }
        case LoRaWANCounterType.JOIN_NONCE: {
            let old_value = deviceConfig.join_nonce
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`)
            }
            deviceConfig.join_nonce = new_value
            break
        }
        case LoRaWANCounterType.DEV_NONCE: {
            let old_value = deviceConfig.dev_nonce
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`)
            }
            deviceConfig.dev_nonce = new_value
            break
        }
    }
    
    if(is_config) {
        //console.log(deviceConfig)
        //await ctx.stub.putState(dev_id, Buffer.from(stringify(sortKeysRecursive(deviceConfig, {ignoreArrayAtKeys: ignoredKeys}))));
        return deviceConfig
    } else {
        //console.log(deviceSession)
        //await ctx.stub.putPrivateData(collectionName, dev_id, Buffer.from(stringify(sortKeysRecursive(deviceSession, {ignoreArrayAtKeys: ignoredKeys}))));
        return deviceSession
    }
}


function HandleJoinRequest(join_req: LoraPacket, date: string, nc_id: string) {
    let ja = Buffer.from('20300b0f7e6b460cac72b749d8af592bee', 'hex');
    let join_accept = LoRaPacket.fromWire(ja)

    let dev_eui = join_req.DevEUI.toString('hex')

    let assetJSON = "{\"activation_mode\":\"OTAA\",\"app_key\":[74,239,119,51,36,170,223,62,36,191,49,203,205,163,119,160],\"class\":\"A\",\"dev_addr\":[78,168,207,155],\"dev_eui\":[229,46,176,41,160,23,108,83],\"dev_nonce\":1,\"join_eui\":[10,212,98,74,55,147,214,94],\"join_nonce\":0,\"js_enc_key\":[209,9,95,201,208,91,155,200,167,110,67,216,63,47,112,199],\"js_int_key\":[100,173,119,201,244,115,111,12,178,205,59,53,148,35,140,168],\"last_join_request_received\":\"JoinRequest\",\"nwk_key\":[74,239,119,51,36,170,223,62,36,191,49,203,205,163,119,160],\"owner\":\"Org1MSP\",\"region\":\"EU863_870\",\"rj_count1\":0,\"version\":\"V1_0_4\"}"
    if (!assetJSON || assetJSON.length === 0) {
        throw new Error(`The device ${dev_eui} does not exist`);
    }
    let updated_config = this.IncreaseDevCounter(assetJSON, LoRaWANCounterType.DEV_NONCE, join_req.DevNonce.readUInt16BE(0))

    if(this.isDeviceConfig(updated_config)) {
        let decrypted_join_accept = LoRaPacket.fromWire(LoRaPacket.decryptJoinAccept(join_accept, Buffer.from(updated_config.nwk_key)))
        console.log(decrypted_join_accept)
        let device_session: DeviceSession = undefined
        if(updated_config.version == LoRaWANVersion.V1_1) {
            let {AppSKey, FNwkSIntKey, NwkSEncKey, SNwkSIntKey} = LoRaPacket.generateSessionKeys11(
                Buffer.from(updated_config.app_key),
                Buffer.from(updated_config.nwk_key),
                decrypted_join_accept.JoinEUI,
                decrypted_join_accept.AppNonce,
                join_req.DevNonce
            ) 

            device_session = {
                fnwk_s_int_key: [...FNwkSIntKey],
                snwk_s_int_key: [...SNwkSIntKey],
                nwk_s_enc_key: [...NwkSEncKey],
                home_net_id: [...join_accept.NetID],
                dev_addr: [...join_accept.DevAddr],
                dev_eui: updated_config.dev_eui,
                f_cnt_up: 0,
                nf_cnt_dwn: 0,
                rj_count0: 0,
                app_s_key: [...AppSKey],
                af_cnt_dwn: 0,
                owner: 'wda',
                nc_ids: [nc_id]
            }
        } else {
            let {AppSKey, NwkSKey} = LoRaPacket.generateSessionKeys10(
                Buffer.from(updated_config.nwk_key),
                join_accept.NetID,
                decrypted_join_accept.AppNonce,
                join_req.DevNonce
            )

            device_session = {
                fnwk_s_int_key: [...NwkSKey],
                snwk_s_int_key: [...NwkSKey],
                nwk_s_enc_key: [...NwkSKey],
                home_net_id: [...join_accept.NetID],
                dev_addr: [...join_accept.DevAddr],
                dev_eui: updated_config.dev_eui,
                f_cnt_up: 0,
                nf_cnt_dwn: 0,
                rj_count0: 0,
                app_s_key: [...AppSKey],
                af_cnt_dwn: 0,
                owner: 'wda',
                nc_ids: [nc_id]
            }
        }

        let dev_addr: string = Buffer.from(device_session.dev_addr).toString('hex')

        console.log(device_session)
        
        updated_config.dev_addr = device_session.dev_addr

        let {private_p, packet} = ChainLoRaWANPacketHelper.from(ja, device_session.owner, 7, date, [nc_id]); //TODO owner è sbagliato, bisogna mettere il dev_addr ma bisogna gestire il caso della join accept
    }
}

function checkDataPacket(deviceSession: DeviceSession, p: LoraPacket) {
    if(!p.isDataMessage() || !p.getDir()) {
        throw new Error(`The packet is not a data message`);
    }

    let counter: number = 0
    if(p.getDir() == 'up') {
        counter = deviceSession.f_cnt_up
    } else {
        counter = deviceSession.af_cnt_dwn
    }



    let fcntMSBytes_or = Buffer.alloc(4)
    fcntMSBytes_or.writeUInt32BE(counter, 0)
    let fcntMSBytes = fcntMSBytes_or.slice(0,2)

    let dcmsb = fcntMSBytes.readUInt16BE(0)
    let pcmsb = p.FCnt.readUInt16BE(0)

    //if (dc >= pc) {
    //    throw new Error(`Invalid counter for packet ${p.PHYPayload.toString('hex')}, expected >= ${dc}, got ${pc}`);
    //}
    
    console.log(fcntMSBytes_or, p.FCnt)
    console.log(p)

    let expected_mic = LoRaPacket.calculateMIC(p, Buffer.from(deviceSession.nwk_s_enc_key), Buffer.from(deviceSession.app_s_key), fcntMSBytes)
    let mic_valid = LoRaPacket.verifyMIC(p, Buffer.from(deviceSession.nwk_s_enc_key), Buffer.from(deviceSession.app_s_key), fcntMSBytes)
    if(!mic_valid) {
        let dev_id = p.DevEUI || p.DevAddr
        throw new Error(`Invalid MIC for packet ${p.PHYPayload.toString('hex')} from ${dev_id.toString('hex')}}, got ${p.MIC.toString('hex')}, expected ${expected_mic.toString('hex')}, session ${JSON.stringify(deviceSession)}`);
    }
}

async function CreatePacket(): Promise<void> {
    //console.log("Invoked CreatePacket")

    let b = Buffer.from('40177e3f6ba003000111b254f6d4dff961e526a634c213254c8a2cfb0102c5f664a6eb4c6f83d8a11b58444940177e3f6ba0040001acc5d7f2aeac989650642a63ff1cb9dec4c4aa638215884178a04ce7803c92811d8db9', 'hex');
    let date = Buffer.from('31363738313231333633303735', 'hex').toString('utf8');
    let nc_id = Buffer.from('31', 'hex').toString('utf8');
    let p: LoraPacket = LoRaPacket.fromWire(b)

    let session = {
    	"af_cnt_dwn":0,
	    "app_s_key":[113,47,229,55,87,166,146,67,202,136,102,218,247,19,111,159],
	    "dev_addr":[107,63,126,23],
	    "dev_eui":[212,205,211,185,99,214,68,144],
	    "f_cnt_up":2,
	    "fnwk_s_int_key":[219,225,237,201,92,251,193,91,164,140,194,132,117,34,204,170],
	    "home_net_id":[1,2,3],
	    "nf_cnt_dwn":0,
	    "nwk_s_enc_key":[219,225,237,201,92,251,193,91,164,140,194,132,117,34,204,170],
	    "owner":"Org1MSP",
	    "rj_count0":0,
	    "snwk_s_int_key":[219,225,237,201,92,251,193,91,164,140,194,132,117,34,204,170],
        "nc_ids": ["1", "2", "3", "4"]

    }

    if(p.isJoinRequestMessage() || p.isReJoinRequestMessage()) {
        //await checkJoinRejoinPacket(p)
        //await HandleJoinRequest(p, b, date, nc_id)
    } else if(p.isDataMessage()) {
        await checkDataPacket(session, p)
    } else {
        throw new Error(`Unknown packet type, probably unsupported`)
    }
    console.log('*** Result: committed')
}

//CreatePacket()
*/

const x509Certificate = "x509::/C=US/ST=California/L=San Francisco/OU=peer/CN=peer2.org1.dlwan.phd::/C=US/ST=California/L=San Francisco/O=org1.dlwan.phd/CN=ca.org1.dlwan.phd";

function extractCN(x509String: string): string | null {
    const cnRegex = /CN=([^\/]+)::/; // Regex to match CN followed by any characters except '/'
    const match = x509String.match(cnRegex);
    if (match && match[1]) {
        return match[1]; // Return the matched CN value directly
    }
    return null;
}

const commonName = extractCN(x509Certificate);
console.log(commonName); // Output: "peer2.org1.dlwan.phd"
