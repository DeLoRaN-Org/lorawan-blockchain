/*
  SPDX-License-Identifier: Apache-2.0
*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Object as ObjDecorator, Property } from 'fabric-contract-api';
import crypto from 'crypto';
export var Region;
(function (Region) {
    Region["EU863_870"] = "EU863_870";
    Region["EU443"] = "EU443";
    Region["US902_928"] = "US902_928";
    Region["CN779_787"] = "CN779_787";
    Region["AU915_928"] = "AU915_928";
    Region["CN470_510"] = "CN470_510";
    Region["AS923"] = "AS923";
    Region["KR920_923"] = "KR920_923";
    Region["INDIA865_867"] = "INDIA865_867";
})(Region || (Region = {}));
export var ActivationMode;
(function (ActivationMode) {
    ActivationMode["ABP"] = "ABP";
    ActivationMode["OTAA"] = "OTAA";
})(ActivationMode || (ActivationMode = {}));
export var DeviceClass;
(function (DeviceClass) {
    DeviceClass["A"] = "A";
    DeviceClass["B"] = "B";
    DeviceClass["C"] = "C";
})(DeviceClass || (DeviceClass = {}));
export var LoRaWANVersion;
(function (LoRaWANVersion) {
    LoRaWANVersion["V1_0"] = "V1_0";
    LoRaWANVersion["V1_0_1"] = "V1_0_1";
    LoRaWANVersion["V1_0_2"] = "V1_0_2";
    LoRaWANVersion["V1_0_3"] = "V1_0_3";
    LoRaWANVersion["V1_0_4"] = "V1_0_4";
    LoRaWANVersion["V1_1"] = "V1_1";
})(LoRaWANVersion || (LoRaWANVersion = {}));
export var JoinRequestType;
(function (JoinRequestType) {
    JoinRequestType["JoinRequest"] = "JoinRequest";
    JoinRequestType["RejoinRequest0"] = "RejoinRequest0";
    JoinRequestType["RejoinRequest1"] = "RejoinRequest1";
    JoinRequestType["RejoinRequest2"] = "RejoinRequest2";
})(JoinRequestType || (JoinRequestType = {}));
export var LoRaWANCounterType;
(function (LoRaWANCounterType) {
    LoRaWANCounterType["AF_CNT_DWN"] = "AF_CNT_DWN";
    LoRaWANCounterType["F_CNT_UP"] = "F_CNT_UP";
    LoRaWANCounterType["NF_CNT_DWN"] = "NF_CNT_DWN";
    LoRaWANCounterType["RJ_COUNT0"] = "RJ_COUNT0";
    LoRaWANCounterType["RJ_COUNT1"] = "RJ_COUNT1";
    LoRaWANCounterType["JOIN_NONCE"] = "JOIN_NONCE";
    LoRaWANCounterType["DEV_NONCE"] = "DEV_NONCE";
})(LoRaWANCounterType || (LoRaWANCounterType = {}));
export class DeviceHelper {
    static default() {
        let b = {
            class: DeviceClass.A,
            version: LoRaWANVersion.V1_0,
            region: Region.EU863_870,
            activation_mode: ActivationMode.ABP,
            dev_nonce: 0,
            dev_eui: [0, 0, 0, 0, 0, 0, 0, 0],
            join_eui: [0, 0, 0, 0, 0, 0, 0, 0],
            nwk_key: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            app_key: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            join_context: {
                js_int_key: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                js_enc_key: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                rj_count1: 0,
                join_nonce: 0
            },
            session: undefined,
            last_join_request_received: JoinRequestType.JoinRequest,
            owner: ''
        };
        return b;
    }
    static from(o) {
        let device = this.default();
        Object.assign(device, o);
        return device;
    }
    static from_conf_session(conf, session) {
        let s = undefined;
        if (session) {
            s = {
                application_context: {
                    af_cnt_dwn: session.af_cnt_dwn,
                    app_s_key: session.app_s_key
                },
                network_context: {
                    dev_addr: session.dev_addr,
                    f_cnt_up: session.f_cnt_up,
                    fnwk_s_int_key: session.fnwk_s_int_key,
                    home_net_id: session.home_net_id,
                    nf_cnt_dwn: session.nf_cnt_dwn,
                    nwk_s_enc_key: session.nwk_s_enc_key,
                    rj_count0: session.rj_count0,
                    snwk_s_int_key: session.snwk_s_int_key
                }
            };
        }
        let jsc = {
            js_int_key: conf.js_int_key,
            js_enc_key: conf.js_enc_key,
            rj_count1: conf.rj_count1,
            join_nonce: conf.join_nonce
        };
        return {
            class: conf.class,
            version: conf.version,
            region: conf.region,
            activation_mode: conf.activation_mode,
            dev_nonce: conf.dev_nonce,
            dev_eui: conf.dev_eui,
            join_eui: conf.join_eui,
            nwk_key: conf.nwk_key,
            app_key: conf.app_key,
            join_context: jsc,
            session: s,
            last_join_request_received: conf.last_join_request_received,
            owner: conf.class
        };
    }
    static to_conf_session(d) {
        let s = undefined;
        if (d.session) {
            let nc = d.session.network_context;
            s = {
                dev_eui: d.dev_eui,
                fnwk_s_int_key: nc.fnwk_s_int_key,
                snwk_s_int_key: nc.snwk_s_int_key,
                nwk_s_enc_key: nc.nwk_s_enc_key,
                home_net_id: nc.home_net_id,
                dev_addr: nc.dev_addr,
                f_cnt_up: nc.f_cnt_up,
                nf_cnt_dwn: nc.nf_cnt_dwn,
                rj_count0: nc.rj_count0,
                app_s_key: d.session.application_context.app_s_key,
                af_cnt_dwn: d.session.application_context.af_cnt_dwn,
                owner: d.owner
            };
        }
        let c = {
            class: d.class,
            version: d.version,
            region: d.region,
            activation_mode: d.activation_mode,
            dev_nonce: d.dev_nonce,
            dev_eui: d.dev_eui,
            join_eui: d.join_eui,
            nwk_key: d.nwk_key,
            app_key: d.app_key,
            js_int_key: d.join_context.js_int_key,
            js_enc_key: d.join_context.js_enc_key,
            rj_count1: d.join_context.rj_count1,
            join_nonce: d.join_context.join_nonce,
            last_join_request_received: d.last_join_request_received,
            owner: d.owner,
            //temp_dev_addr: undefined,
            dev_addr: d.session ? d.session.network_context.dev_addr : undefined,
        };
        return {
            sess: s,
            conf: c
        };
    }
    static from_str(s) {
        let device = this.default();
        let j_dev = JSON.parse(s);
        Object.assign(device, j_dev);
        return device;
    }
}
let Device = class Device {
};
Device = __decorate([
    ObjDecorator()
], Device);
export { Device };
let DeviceConfiguration = class DeviceConfiguration {
};
__decorate([
    Property()
], DeviceConfiguration.prototype, "class", void 0);
__decorate([
    Property()
], DeviceConfiguration.prototype, "version", void 0);
__decorate([
    Property()
], DeviceConfiguration.prototype, "region", void 0);
__decorate([
    Property()
], DeviceConfiguration.prototype, "activation_mode", void 0);
__decorate([
    Property()
], DeviceConfiguration.prototype, "dev_nonce", void 0);
__decorate([
    Property("dev_eui", "Array<number>")
], DeviceConfiguration.prototype, "dev_eui", void 0);
__decorate([
    Property("join_eui", "Array<number>")
], DeviceConfiguration.prototype, "join_eui", void 0);
__decorate([
    Property("nwk_key", "Array<number>")
], DeviceConfiguration.prototype, "nwk_key", void 0);
__decorate([
    Property("app_key", "Array<number>")
], DeviceConfiguration.prototype, "app_key", void 0);
__decorate([
    Property("js_int_key", "Array<number>")
], DeviceConfiguration.prototype, "js_int_key", void 0);
__decorate([
    Property("js_enc_key", "Array<number>")
], DeviceConfiguration.prototype, "js_enc_key", void 0);
__decorate([
    Property()
], DeviceConfiguration.prototype, "rj_count1", void 0);
__decorate([
    Property()
], DeviceConfiguration.prototype, "join_nonce", void 0);
__decorate([
    Property()
], DeviceConfiguration.prototype, "last_join_request_received", void 0);
__decorate([
    Property()
], DeviceConfiguration.prototype, "owner", void 0);
__decorate([
    Property("dev_addr", "Array<number>")
], DeviceConfiguration.prototype, "dev_addr", void 0);
DeviceConfiguration = __decorate([
    ObjDecorator()
], DeviceConfiguration);
export { DeviceConfiguration };
let DeviceSession = class DeviceSession {
};
__decorate([
    Property("fnwk_s_int_key", "Array<number>")
], DeviceSession.prototype, "fnwk_s_int_key", void 0);
__decorate([
    Property("snwk_s_int_key", "Array<number>")
], DeviceSession.prototype, "snwk_s_int_key", void 0);
__decorate([
    Property("nwk_s_enc_key", "Array<number>")
], DeviceSession.prototype, "nwk_s_enc_key", void 0);
__decorate([
    Property("home_net_id", "Array<number>")
], DeviceSession.prototype, "home_net_id", void 0);
__decorate([
    Property("dev_addr", "Array<number>")
], DeviceSession.prototype, "dev_addr", void 0);
__decorate([
    Property("dev_eui", "Array<number>")
], DeviceSession.prototype, "dev_eui", void 0);
__decorate([
    Property()
], DeviceSession.prototype, "f_cnt_up", void 0);
__decorate([
    Property()
], DeviceSession.prototype, "nf_cnt_dwn", void 0);
__decorate([
    Property()
], DeviceSession.prototype, "rj_count0", void 0);
__decorate([
    Property("app_s_key", "Array<number>")
], DeviceSession.prototype, "app_s_key", void 0);
__decorate([
    Property()
], DeviceSession.prototype, "af_cnt_dwn", void 0);
__decorate([
    Property()
], DeviceSession.prototype, "owner", void 0);
DeviceSession = __decorate([
    ObjDecorator()
], DeviceSession);
export { DeviceSession };
export class ChainLoRaWANPacketHelper {
    static from(pack, dev_id, sf, timestamp, gws) {
        let hash = crypto.createHash('sha256').update(pack).digest('hex');
        return {
            private_p: {
                hash,
                packet: pack.toString('hex'),
            },
            packet: {
                hash,
                length: pack.length,
                dev_id,
                sf,
                timestamp: timestamp,
                gws
            }
        };
    }
}
let ChainLoRaWANPacketPrivate = class ChainLoRaWANPacketPrivate {
};
__decorate([
    Property()
], ChainLoRaWANPacketPrivate.prototype, "hash", void 0);
__decorate([
    Property()
], ChainLoRaWANPacketPrivate.prototype, "packet", void 0);
ChainLoRaWANPacketPrivate = __decorate([
    ObjDecorator()
], ChainLoRaWANPacketPrivate);
export { ChainLoRaWANPacketPrivate };
let ChainLoRaWANPacket = class ChainLoRaWANPacket {
};
__decorate([
    Property()
], ChainLoRaWANPacket.prototype, "hash", void 0);
__decorate([
    Property()
], ChainLoRaWANPacket.prototype, "timestamp", void 0);
__decorate([
    Property()
], ChainLoRaWANPacket.prototype, "dev_id", void 0);
__decorate([
    Property()
], ChainLoRaWANPacket.prototype, "length", void 0);
__decorate([
    Property()
], ChainLoRaWANPacket.prototype, "sf", void 0);
__decorate([
    Property("gws", "Array<string>")
], ChainLoRaWANPacket.prototype, "gws", void 0);
ChainLoRaWANPacket = __decorate([
    ObjDecorator()
], ChainLoRaWANPacket);
export { ChainLoRaWANPacket };
