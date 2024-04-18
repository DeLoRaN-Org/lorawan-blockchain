"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var lora_packet_1 = require("lora-packet");
var asset_1 = require("./asset");
var ignoredKeys = [
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
    var is_config = false;
    if (counter_t == asset_1.LoRaWANCounterType.RJ_COUNT1 ||
        counter_t == asset_1.LoRaWANCounterType.JOIN_NONCE ||
        counter_t == asset_1.LoRaWANCounterType.DEV_NONCE) {
        is_config = true;
    }
    var deviceSession;
    var deviceConfig;
    var dev_id;
    if (is_config) {
        deviceConfig = JSON.parse(assetJSON.toString());
        dev_id = Buffer.from(deviceConfig.dev_eui).toString('hex');
    }
    else {
        deviceSession = JSON.parse(assetJSON.toString());
        dev_id = Buffer.from(deviceConfig.dev_addr).toString('hex');
    }
    switch (counter_t) {
        case asset_1.LoRaWANCounterType.AF_CNT_DWN: {
            //if(!device.session) throw new Error(`Device ${dev_id} is not initialized`)
            var old_value = deviceSession.af_cnt_dwn;
            if (old_value >= new_value) {
                throw new Error("Value ".concat(new_value, " invalid, expected > ").concat(old_value, " for device ").concat(dev_id, ".").concat(counter_t));
            }
            deviceSession.af_cnt_dwn = new_value;
            break;
        }
        case asset_1.LoRaWANCounterType.F_CNT_UP: {
            //if(!deviceSession.session) throw new Error(`Device ${dev_id} is not initialized`)
            var old_value = deviceSession.f_cnt_up;
            if (old_value >= new_value) {
                throw new Error("Value ".concat(new_value, " invalid, expected > ").concat(old_value, " for device ").concat(dev_id, ".").concat(counter_t));
            }
            deviceSession.f_cnt_up = new_value;
            break;
        }
        case asset_1.LoRaWANCounterType.NF_CNT_DWN: {
            //if(!deviceSession.session) throw new Error(`Device ${dev_id} is not initialized`)
            var old_value = deviceSession.nf_cnt_dwn;
            if (old_value >= new_value) {
                throw new Error("Value ".concat(new_value, " invalid, expected > ").concat(old_value, " for device ").concat(dev_id, ".").concat(counter_t));
            }
            deviceSession.nf_cnt_dwn = new_value;
            break;
        }
        case asset_1.LoRaWANCounterType.RJ_COUNT0: {
            //if(!deviceSession.session) throw new Error(`Device ${dev_id} is not initialized`)
            var old_value = deviceSession.rj_count0;
            if (old_value >= new_value) {
                throw new Error("Value ".concat(new_value, " invalid, expected > ").concat(old_value, " for device ").concat(dev_id, ".").concat(counter_t));
            }
            deviceSession.rj_count0 = new_value;
            break;
        }
        case asset_1.LoRaWANCounterType.RJ_COUNT1: {
            var old_value = deviceConfig.rj_count1;
            if (old_value >= new_value) {
                throw new Error("Value ".concat(new_value, " invalid, expected > ").concat(old_value, " for device ").concat(dev_id, ".").concat(counter_t));
            }
            deviceConfig.rj_count1 = new_value;
            break;
        }
        case asset_1.LoRaWANCounterType.JOIN_NONCE: {
            var old_value = deviceConfig.join_nonce;
            if (old_value >= new_value) {
                throw new Error("Value ".concat(new_value, " invalid, expected > ").concat(old_value, " for device ").concat(dev_id, ".").concat(counter_t));
            }
            deviceConfig.join_nonce = new_value;
            break;
        }
        case asset_1.LoRaWANCounterType.DEV_NONCE: {
            var old_value = deviceConfig.dev_nonce;
            if (old_value >= new_value) {
                throw new Error("Value ".concat(new_value, " invalid, expected > ").concat(old_value, " for device ").concat(dev_id, ".").concat(counter_t));
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
function HandleJoinRequest(join_req, date, nc_id) {
    var ja = Buffer.from('20300b0f7e6b460cac72b749d8af592bee', 'hex');
    var join_accept = lora_packet_1.default.fromWire(ja);
    var dev_eui = join_req.DevEUI.toString('hex');
    var assetJSON = "{\"activation_mode\":\"OTAA\",\"app_key\":[74,239,119,51,36,170,223,62,36,191,49,203,205,163,119,160],\"class\":\"A\",\"dev_addr\":[78,168,207,155],\"dev_eui\":[229,46,176,41,160,23,108,83],\"dev_nonce\":1,\"join_eui\":[10,212,98,74,55,147,214,94],\"join_nonce\":0,\"js_enc_key\":[209,9,95,201,208,91,155,200,167,110,67,216,63,47,112,199],\"js_int_key\":[100,173,119,201,244,115,111,12,178,205,59,53,148,35,140,168],\"last_join_request_received\":\"JoinRequest\",\"nwk_key\":[74,239,119,51,36,170,223,62,36,191,49,203,205,163,119,160],\"owner\":\"Org1MSP\",\"region\":\"EU863_870\",\"rj_count1\":0,\"version\":\"V1_0_4\"}";
    if (!assetJSON || assetJSON.length === 0) {
        throw new Error("The device ".concat(dev_eui, " does not exist"));
    }
    var updated_config = this.IncreaseDevCounter(assetJSON, asset_1.LoRaWANCounterType.DEV_NONCE, join_req.DevNonce.readUInt16BE(0));
    if (this.isDeviceConfig(updated_config)) {
        var decrypted_join_accept = lora_packet_1.default.fromWire(lora_packet_1.default.decryptJoinAccept(join_accept, Buffer.from(updated_config.nwk_key)));
        console.log(decrypted_join_accept);
        var device_session = undefined;
        if (updated_config.version == asset_1.LoRaWANVersion.V1_1) {
            var _a = lora_packet_1.default.generateSessionKeys11(Buffer.from(updated_config.app_key), Buffer.from(updated_config.nwk_key), decrypted_join_accept.JoinEUI, decrypted_join_accept.AppNonce, join_req.DevNonce), AppSKey = _a.AppSKey, FNwkSIntKey = _a.FNwkSIntKey, NwkSEncKey = _a.NwkSEncKey, SNwkSIntKey = _a.SNwkSIntKey;
            device_session = {
                fnwk_s_int_key: __spreadArray([], FNwkSIntKey, true),
                snwk_s_int_key: __spreadArray([], SNwkSIntKey, true),
                nwk_s_enc_key: __spreadArray([], NwkSEncKey, true),
                home_net_id: __spreadArray([], join_accept.NetID, true),
                dev_addr: __spreadArray([], join_accept.DevAddr, true),
                dev_eui: updated_config.dev_eui,
                f_cnt_up: 0,
                nf_cnt_dwn: 0,
                rj_count0: 0,
                app_s_key: __spreadArray([], AppSKey, true),
                af_cnt_dwn: 0,
                owner: 'wda',
                nc_ids: [nc_id]
            };
        }
        else {
            var _b = lora_packet_1.default.generateSessionKeys10(Buffer.from(updated_config.nwk_key), join_accept.NetID, decrypted_join_accept.AppNonce, join_req.DevNonce), AppSKey = _b.AppSKey, NwkSKey = _b.NwkSKey;
            device_session = {
                fnwk_s_int_key: __spreadArray([], NwkSKey, true),
                snwk_s_int_key: __spreadArray([], NwkSKey, true),
                nwk_s_enc_key: __spreadArray([], NwkSKey, true),
                home_net_id: __spreadArray([], join_accept.NetID, true),
                dev_addr: __spreadArray([], join_accept.DevAddr, true),
                dev_eui: updated_config.dev_eui,
                f_cnt_up: 0,
                nf_cnt_dwn: 0,
                rj_count0: 0,
                app_s_key: __spreadArray([], AppSKey, true),
                af_cnt_dwn: 0,
                owner: 'wda',
                nc_ids: [nc_id]
            };
        }
        var dev_addr = Buffer.from(device_session.dev_addr).toString('hex');
        console.log(device_session);
        updated_config.dev_addr = device_session.dev_addr;
        var _c = asset_1.ChainLoRaWANPacketHelper.from(ja, device_session.owner, 7, date, [nc_id]), private_p = _c.private_p, packet = _c.packet; //TODO owner è sbagliato, bisogna mettere il dev_addr ma bisogna gestire il caso della join accept
    }
}
function checkDataPacket(deviceSession, p) {
    if (!p.isDataMessage() || !p.getDir()) {
        throw new Error("The packet is not a data message");
    }
    var counter = 0;
    if (p.getDir() == 'up') {
        counter = deviceSession.f_cnt_up;
    }
    else {
        counter = deviceSession.af_cnt_dwn;
    }
    var fcntMSBytes_or = Buffer.alloc(4);
    fcntMSBytes_or.writeUInt32BE(counter, 0);
    var fcntMSBytes = fcntMSBytes_or.slice(0, 2);
    var dcmsb = fcntMSBytes.readUInt16BE(0);
    var pcmsb = p.FCnt.readUInt16BE(0);
    //if (dc >= pc) {
    //    throw new Error(`Invalid counter for packet ${p.PHYPayload.toString('hex')}, expected >= ${dc}, got ${pc}`);
    //}
    console.log(fcntMSBytes_or, p.FCnt);
    console.log(p);
    var expected_mic = lora_packet_1.default.calculateMIC(p, Buffer.from(deviceSession.nwk_s_enc_key), Buffer.from(deviceSession.app_s_key), fcntMSBytes);
    var mic_valid = lora_packet_1.default.verifyMIC(p, Buffer.from(deviceSession.nwk_s_enc_key), Buffer.from(deviceSession.app_s_key), fcntMSBytes);
    if (!mic_valid) {
        var dev_id = p.DevEUI || p.DevAddr;
        throw new Error("Invalid MIC for packet ".concat(p.PHYPayload.toString('hex'), " from ").concat(dev_id.toString('hex'), "}, got ").concat(p.MIC.toString('hex'), ", expected ").concat(expected_mic.toString('hex'), ", session ").concat(JSON.stringify(deviceSession)));
    }
}
function CreatePacket() {
    return __awaiter(this, void 0, void 0, function () {
        var b, date, nc_id, p, session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    b = Buffer.from('40177e3f6ba003000111b254f6d4dff961e526a634c213254c8a2cfb0102c5f664a6eb4c6f83d8a11b58444940177e3f6ba0040001acc5d7f2aeac989650642a63ff1cb9dec4c4aa638215884178a04ce7803c92811d8db9', 'hex');
                    date = Buffer.from('31363738313231333633303735', 'hex').toString('utf8');
                    nc_id = Buffer.from('31', 'hex').toString('utf8');
                    p = lora_packet_1.default.fromWire(b);
                    session = {
                        "af_cnt_dwn": 0,
                        "app_s_key": [113, 47, 229, 55, 87, 166, 146, 67, 202, 136, 102, 218, 247, 19, 111, 159],
                        "dev_addr": [107, 63, 126, 23],
                        "dev_eui": [212, 205, 211, 185, 99, 214, 68, 144],
                        "f_cnt_up": 2,
                        "fnwk_s_int_key": [219, 225, 237, 201, 92, 251, 193, 91, 164, 140, 194, 132, 117, 34, 204, 170],
                        "home_net_id": [1, 2, 3],
                        "nf_cnt_dwn": 0,
                        "nwk_s_enc_key": [219, 225, 237, 201, 92, 251, 193, 91, 164, 140, 194, 132, 117, 34, 204, 170],
                        "owner": "Org1MSP",
                        "rj_count0": 0,
                        "snwk_s_int_key": [219, 225, 237, 201, 92, 251, 193, 91, 164, 140, 194, 132, 117, 34, 204, 170],
                        "nc_ids": ["1", "2", "3", "4"]
                    };
                    if (!(p.isJoinRequestMessage() || p.isReJoinRequestMessage())) return [3 /*break*/, 1];
                    return [3 /*break*/, 4];
                case 1:
                    if (!p.isDataMessage()) return [3 /*break*/, 3];
                    return [4 /*yield*/, checkDataPacket(session, p)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3: throw new Error("Unknown packet type, probably unsupported");
                case 4:
                    console.log('*** Result: committed');
                    return [2 /*return*/];
            }
        });
    });
}
CreatePacket();
