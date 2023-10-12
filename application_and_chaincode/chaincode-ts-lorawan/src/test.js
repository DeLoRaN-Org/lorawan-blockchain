let LoRaPacket = require('lora-packet');

var LoRaWANVersion;
(function (LoRaWANVersion) {
    LoRaWANVersion["V1_0"] = "V1_0";
    LoRaWANVersion["V1_0_1"] = "V1_0_1";
    LoRaWANVersion["V1_0_2"] = "V1_0_2";
    LoRaWANVersion["V1_0_3"] = "V1_0_3";
    LoRaWANVersion["V1_0_4"] = "V1_0_4";
    LoRaWANVersion["V1_1"] = "V1_1";
})(LoRaWANVersion || (LoRaWANVersion = {}));

var LoRaWANCounterType;
(function (LoRaWANCounterType) {
    LoRaWANCounterType["AF_CNT_DWN"] = "AF_CNT_DWN";
    LoRaWANCounterType["F_CNT_UP"] = "F_CNT_UP";
    LoRaWANCounterType["NF_CNT_DWN"] = "NF_CNT_DWN";
    LoRaWANCounterType["RJ_COUNT0"] = "RJ_COUNT0";
    LoRaWANCounterType["RJ_COUNT1"] = "RJ_COUNT1";
    LoRaWANCounterType["JOIN_NONCE"] = "JOIN_NONCE";
    LoRaWANCounterType["DEV_NONCE"] = "DEV_NONCE";
})(LoRaWANCounterType || (LoRaWANCounterType = {}));

let ignoredKeys = [
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
];
function IncreaseDevCounter(assetJSON, counter_t, new_value) {
    //console.log('Invoked IncreaseDevCounter')
    let is_config = false;
    if (counter_t == LoRaWANCounterType.RJ_COUNT1 ||
        counter_t == LoRaWANCounterType.JOIN_NONCE ||
        counter_t == LoRaWANCounterType.DEV_NONCE) {
        is_config = true;
    }
    let deviceSession;
    let deviceConfig;
    let dev_id;
    if (is_config) {
        deviceConfig = JSON.parse(assetJSON.toString());
        dev_id = Buffer.from(deviceConfig.dev_eui).toString('hex');
    }
    else {
        deviceSession = JSON.parse(assetJSON.toString());
        dev_id = Buffer.from(deviceConfig.dev_addr).toString('hex');
    }
    switch (counter_t) {
        case LoRaWANCounterType.AF_CNT_DWN: {
            //if(!device.session) throw new Error(`Device ${dev_id} is not initialized`)
            let old_value = deviceSession.af_cnt_dwn;
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`);
            }
            deviceSession.af_cnt_dwn = new_value;
            break;
        }
        case LoRaWANCounterType.F_CNT_UP: {
            //if(!deviceSession.session) throw new Error(`Device ${dev_id} is not initialized`)
            let old_value = deviceSession.f_cnt_up;
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`);
            }
            deviceSession.f_cnt_up = new_value;
            break;
        }
        case LoRaWANCounterType.NF_CNT_DWN: {
            //if(!deviceSession.session) throw new Error(`Device ${dev_id} is not initialized`)
            let old_value = deviceSession.nf_cnt_dwn;
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`);
            }
            deviceSession.nf_cnt_dwn = new_value;
            break;
        }
        case LoRaWANCounterType.RJ_COUNT0: {
            //if(!deviceSession.session) throw new Error(`Device ${dev_id} is not initialized`)
            let old_value = deviceSession.rj_count0;
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`);
            }
            deviceSession.rj_count0 = new_value;
            break;
        }
        case LoRaWANCounterType.RJ_COUNT1: {
            let old_value = deviceConfig.rj_count1;
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`);
            }
            deviceConfig.rj_count1 = new_value;
            break;
        }
        case LoRaWANCounterType.JOIN_NONCE: {
            let old_value = deviceConfig.join_nonce;
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`);
            }
            deviceConfig.join_nonce = new_value;
            break;
        }
        case LoRaWANCounterType.DEV_NONCE: {
            let old_value = deviceConfig.dev_nonce;
            if (old_value >= new_value) {
                throw new Error(`Value ${new_value} invalid, expected > ${old_value} for device ${dev_id}.${counter_t}`);
            }
            deviceConfig.dev_nonce = new_value;
            break;
        }
    }
    if (is_config) {
        //console.log(deviceConfig)
        //await ctx.stub.putState(dev_id, Buffer.from(stringify(sortKeysRecursive(deviceConfig, {ignoreArrayAtKeys: ignoredKeys}))));
        return deviceConfig;
    }
    else {
        //console.log(deviceSession)
        //await ctx.stub.putPrivateData(collectionName, dev_id, Buffer.from(stringify(sortKeysRecursive(deviceSession, {ignoreArrayAtKeys: ignoredKeys}))));
        return deviceSession;
    }
}
function HandleJoinRequest(join_req, date, n_id) {
    let ja = Buffer.from('20300b0f7e6b460cac72b749d8af592bee', 'hex');
    let join_accept = LoRaPacket.fromWire(ja);
    let dev_eui = join_req.DevEUI.toString('hex');
    let assetJSON = "{\"activation_mode\":\"OTAA\",\"app_key\":[74,239,119,51,36,170,223,62,36,191,49,203,205,163,119,160],\"class\":\"A\",\"dev_addr\":[78,168,207,155],\"dev_eui\":[229,46,176,41,160,23,108,83],\"dev_nonce\":1,\"join_eui\":[10,212,98,74,55,147,214,94],\"join_nonce\":0,\"js_enc_key\":[209,9,95,201,208,91,155,200,167,110,67,216,63,47,112,199],\"js_int_key\":[100,173,119,201,244,115,111,12,178,205,59,53,148,35,140,168],\"last_join_request_received\":\"JoinRequest\",\"nwk_key\":[74,239,119,51,36,170,223,62,36,191,49,203,205,163,119,160],\"owner\":\"Org1MSP\",\"region\":\"EU863_870\",\"rj_count1\":0,\"version\":\"V1_0_4\"}";
    if (!assetJSON || assetJSON.length === 0) {
        throw new Error(`The device ${dev_eui} does not exist`);
    }
    let updated_config = IncreaseDevCounter(assetJSON, LoRaWANCounterType.DEV_NONCE, join_req.DevNonce.readUInt16BE(0));
    let decrypted_join_accept = LoRaPacket.fromWire(LoRaPacket.decryptJoinAccept(join_accept, Buffer.from(updated_config.nwk_key)));
    console.log(decrypted_join_accept);
    let device_session = undefined;
    if (updated_config.version == LoRaWANVersion.V1_1) {
        let { AppSKey, FNwkSIntKey, NwkSEncKey, SNwkSIntKey } = LoRaPacket.generateSessionKeys11(Buffer.from(updated_config.app_key), Buffer.from(updated_config.nwk_key), decrypted_join_accept.JoinEUI, decrypted_join_accept.AppNonce, join_req.DevNonce);
        device_session = {
            fnwk_s_int_key: [...FNwkSIntKey],
            snwk_s_int_key: [...SNwkSIntKey],
            nwk_s_enc_key: [...NwkSEncKey],
            home_net_id: [...decrypted_join_accept.NetID],
            dev_addr: [...decrypted_join_accept.DevAddr],
            dev_eui: updated_config.dev_eui,
            f_cnt_up: 0,
            nf_cnt_dwn: 0,
            rj_count0: 0,
            app_s_key: [...AppSKey],
            af_cnt_dwn: 0,
            owner: 'wda'
        };
    }
    else {
        let { AppSKey, NwkSKey } = LoRaPacket.generateSessionKeys10(Buffer.from(updated_config.nwk_key), decrypted_join_accept.NetID, decrypted_join_accept.AppNonce, join_req.DevNonce);
        device_session = {
            fnwk_s_int_key: [...NwkSKey],
            snwk_s_int_key: [...NwkSKey],
            nwk_s_enc_key: [...NwkSKey],
            home_net_id: [...decrypted_join_accept.NetID],
            dev_addr: [...decrypted_join_accept.DevAddr],
            dev_eui: updated_config.dev_eui,
            f_cnt_up: 0,
            nf_cnt_dwn: 0,
            rj_count0: 0,
            app_s_key: [...AppSKey],
            af_cnt_dwn: 0,
            owner: 'wda'
        };
    }
    let dev_addr = Buffer.from(device_session.dev_addr).toString('hex');
    console.log(device_session);
    updated_config.dev_addr = device_session.dev_addr;
}


function CreatePacket() {
    let b = Buffer.from('005ed693374a62d40a536c17a029b02ee50200475694e7', 'hex');
    let date = Buffer.from('31363738313231333633303735', 'hex').toString('utf8');
    let n_id = Buffer.from('31', 'hex').toString('utf8');
    let p = LoRaPacket.fromWire(b);
    if (p.isJoinRequestMessage() || p.isReJoinRequestMessage()) {
        HandleJoinRequest(p, date, n_id);
    }
    else {
        throw new Error(`Unknown packet type, probably unsupported`);
    }
    console.log('*** Result: committed');
}

CreatePacket()