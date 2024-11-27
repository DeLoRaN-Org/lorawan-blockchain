"use strict";
/*
  SPDX-License-Identifier: Apache-2.0
*/
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinReqProposal = exports.ChainLoRaWANPacket = exports.ChainLoRaWANPacketPrivate = exports.ChainLoRaWANPacketHelper = exports.DeviceSession = exports.DeviceConfiguration = exports.Device = exports.DeviceHelper = exports.LoRaWANCounterType = exports.JoinRequestType = exports.LoRaWANVersion = exports.DeviceClass = exports.ActivationMode = exports.Region = void 0;
var fabric_contract_api_1 = require("fabric-contract-api");
var crypto_1 = require("crypto");
var Region;
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
})(Region || (exports.Region = Region = {}));
var ActivationMode;
(function (ActivationMode) {
    ActivationMode["ABP"] = "ABP";
    ActivationMode["OTAA"] = "OTAA";
})(ActivationMode || (exports.ActivationMode = ActivationMode = {}));
var DeviceClass;
(function (DeviceClass) {
    DeviceClass["A"] = "A";
    DeviceClass["B"] = "B";
    DeviceClass["C"] = "C";
})(DeviceClass || (exports.DeviceClass = DeviceClass = {}));
var LoRaWANVersion;
(function (LoRaWANVersion) {
    LoRaWANVersion["V1_0"] = "V1_0";
    LoRaWANVersion["V1_0_1"] = "V1_0_1";
    LoRaWANVersion["V1_0_2"] = "V1_0_2";
    LoRaWANVersion["V1_0_3"] = "V1_0_3";
    LoRaWANVersion["V1_0_4"] = "V1_0_4";
    LoRaWANVersion["V1_1"] = "V1_1";
})(LoRaWANVersion || (exports.LoRaWANVersion = LoRaWANVersion = {}));
var JoinRequestType;
(function (JoinRequestType) {
    JoinRequestType["JoinRequest"] = "JoinRequest";
    JoinRequestType["RejoinRequest0"] = "RejoinRequest0";
    JoinRequestType["RejoinRequest1"] = "RejoinRequest1";
    JoinRequestType["RejoinRequest2"] = "RejoinRequest2";
})(JoinRequestType || (exports.JoinRequestType = JoinRequestType = {}));
var LoRaWANCounterType;
(function (LoRaWANCounterType) {
    LoRaWANCounterType["AF_CNT_DWN"] = "AF_CNT_DWN";
    LoRaWANCounterType["F_CNT_UP"] = "F_CNT_UP";
    LoRaWANCounterType["NF_CNT_DWN"] = "NF_CNT_DWN";
    LoRaWANCounterType["RJ_COUNT0"] = "RJ_COUNT0";
    LoRaWANCounterType["RJ_COUNT1"] = "RJ_COUNT1";
    LoRaWANCounterType["JOIN_NONCE"] = "JOIN_NONCE";
    LoRaWANCounterType["DEV_NONCE"] = "DEV_NONCE";
})(LoRaWANCounterType || (exports.LoRaWANCounterType = LoRaWANCounterType = {}));
var DeviceHelper = /** @class */ (function () {
    function DeviceHelper() {
    }
    DeviceHelper.default = function () {
        var b = {
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
    };
    DeviceHelper.from = function (o) {
        var device = this.default();
        Object.assign(device, o);
        return device;
    };
    DeviceHelper.from_conf_session = function (conf, session) {
        var s = undefined;
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
        var jsc = {
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
    };
    /*
    static to_conf_session(d: Device): {sess?: DeviceSession, conf: DeviceConfiguration} {
        let s: DeviceSession | undefined = undefined;
        
        if (d.session) {
            let nc = d.session.network_context
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
            }
        }

        let c: DeviceConfiguration = {
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
        }
        
        return {
            sess: s,
            conf: c
        }
    }*/
    DeviceHelper.from_str = function (s) {
        var device = this.default();
        var j_dev = JSON.parse(s);
        Object.assign(device, j_dev);
        return device;
    };
    return DeviceHelper;
}());
exports.DeviceHelper = DeviceHelper;
var Device = function () {
    var _classDecorators = [(0, fabric_contract_api_1.Object)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var Device = _classThis = /** @class */ (function () {
        function Device_1() {
        }
        return Device_1;
    }());
    __setFunctionName(_classThis, "Device");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Device = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Device = _classThis;
}();
exports.Device = Device;
var DeviceConfiguration = function () {
    var _classDecorators = [(0, fabric_contract_api_1.Object)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _class_decorators;
    var _class_initializers = [];
    var _version_decorators;
    var _version_initializers = [];
    var _region_decorators;
    var _region_initializers = [];
    var _activation_mode_decorators;
    var _activation_mode_initializers = [];
    var _dev_nonce_decorators;
    var _dev_nonce_initializers = [];
    var _dev_eui_decorators;
    var _dev_eui_initializers = [];
    var _join_eui_decorators;
    var _join_eui_initializers = [];
    var _nwk_key_decorators;
    var _nwk_key_initializers = [];
    var _app_key_decorators;
    var _app_key_initializers = [];
    var _js_int_key_decorators;
    var _js_int_key_initializers = [];
    var _js_enc_key_decorators;
    var _js_enc_key_initializers = [];
    var _rj_count1_decorators;
    var _rj_count1_initializers = [];
    var _join_nonce_decorators;
    var _join_nonce_initializers = [];
    var _last_join_request_received_decorators;
    var _last_join_request_received_initializers = [];
    var _owner_decorators;
    var _owner_initializers = [];
    var _dev_addr_decorators;
    var _dev_addr_initializers = [];
    var DeviceConfiguration = _classThis = /** @class */ (function () {
        function DeviceConfiguration_1() {
            this.class = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _class_initializers, void 0));
            this.version = __runInitializers(this, _version_initializers, void 0);
            this.region = __runInitializers(this, _region_initializers, void 0);
            this.activation_mode = __runInitializers(this, _activation_mode_initializers, void 0);
            this.dev_nonce = __runInitializers(this, _dev_nonce_initializers, void 0);
            this.dev_eui = __runInitializers(this, _dev_eui_initializers, void 0);
            this.join_eui = __runInitializers(this, _join_eui_initializers, void 0);
            this.nwk_key = __runInitializers(this, _nwk_key_initializers, void 0);
            this.app_key = __runInitializers(this, _app_key_initializers, void 0);
            this.js_int_key = __runInitializers(this, _js_int_key_initializers, void 0);
            this.js_enc_key = __runInitializers(this, _js_enc_key_initializers, void 0);
            this.rj_count1 = __runInitializers(this, _rj_count1_initializers, void 0);
            this.join_nonce = __runInitializers(this, _join_nonce_initializers, void 0);
            this.last_join_request_received = __runInitializers(this, _last_join_request_received_initializers, void 0);
            this.owner = __runInitializers(this, _owner_initializers, void 0);
            //@Property("temp_dev_addr", "Array<number>") //TODO later need to implement this double session logic
            //public temp_dev_addr: number[] | undefined
            this.dev_addr = __runInitializers(this, _dev_addr_initializers, void 0);
        }
        return DeviceConfiguration_1;
    }());
    __setFunctionName(_classThis, "DeviceConfiguration");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _class_decorators = [(0, fabric_contract_api_1.Property)()];
        _version_decorators = [(0, fabric_contract_api_1.Property)()];
        _region_decorators = [(0, fabric_contract_api_1.Property)()];
        _activation_mode_decorators = [(0, fabric_contract_api_1.Property)()];
        _dev_nonce_decorators = [(0, fabric_contract_api_1.Property)()];
        _dev_eui_decorators = [(0, fabric_contract_api_1.Property)("dev_eui", "Array<number>")];
        _join_eui_decorators = [(0, fabric_contract_api_1.Property)("join_eui", "Array<number>")];
        _nwk_key_decorators = [(0, fabric_contract_api_1.Property)("nwk_key", "Array<number>")];
        _app_key_decorators = [(0, fabric_contract_api_1.Property)("app_key", "Array<number>")];
        _js_int_key_decorators = [(0, fabric_contract_api_1.Property)("js_int_key", "Array<number>")];
        _js_enc_key_decorators = [(0, fabric_contract_api_1.Property)("js_enc_key", "Array<number>")];
        _rj_count1_decorators = [(0, fabric_contract_api_1.Property)()];
        _join_nonce_decorators = [(0, fabric_contract_api_1.Property)()];
        _last_join_request_received_decorators = [(0, fabric_contract_api_1.Property)()];
        _owner_decorators = [(0, fabric_contract_api_1.Property)()];
        _dev_addr_decorators = [(0, fabric_contract_api_1.Property)("dev_addr", "Array<number>")];
        __esDecorate(null, null, _class_decorators, { kind: "field", name: "class", static: false, private: false, access: { has: function (obj) { return "class" in obj; }, get: function (obj) { return obj.class; }, set: function (obj, value) { obj.class = value; } }, metadata: _metadata }, _class_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _version_decorators, { kind: "field", name: "version", static: false, private: false, access: { has: function (obj) { return "version" in obj; }, get: function (obj) { return obj.version; }, set: function (obj, value) { obj.version = value; } }, metadata: _metadata }, _version_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _region_decorators, { kind: "field", name: "region", static: false, private: false, access: { has: function (obj) { return "region" in obj; }, get: function (obj) { return obj.region; }, set: function (obj, value) { obj.region = value; } }, metadata: _metadata }, _region_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _activation_mode_decorators, { kind: "field", name: "activation_mode", static: false, private: false, access: { has: function (obj) { return "activation_mode" in obj; }, get: function (obj) { return obj.activation_mode; }, set: function (obj, value) { obj.activation_mode = value; } }, metadata: _metadata }, _activation_mode_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _dev_nonce_decorators, { kind: "field", name: "dev_nonce", static: false, private: false, access: { has: function (obj) { return "dev_nonce" in obj; }, get: function (obj) { return obj.dev_nonce; }, set: function (obj, value) { obj.dev_nonce = value; } }, metadata: _metadata }, _dev_nonce_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _dev_eui_decorators, { kind: "field", name: "dev_eui", static: false, private: false, access: { has: function (obj) { return "dev_eui" in obj; }, get: function (obj) { return obj.dev_eui; }, set: function (obj, value) { obj.dev_eui = value; } }, metadata: _metadata }, _dev_eui_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _join_eui_decorators, { kind: "field", name: "join_eui", static: false, private: false, access: { has: function (obj) { return "join_eui" in obj; }, get: function (obj) { return obj.join_eui; }, set: function (obj, value) { obj.join_eui = value; } }, metadata: _metadata }, _join_eui_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _nwk_key_decorators, { kind: "field", name: "nwk_key", static: false, private: false, access: { has: function (obj) { return "nwk_key" in obj; }, get: function (obj) { return obj.nwk_key; }, set: function (obj, value) { obj.nwk_key = value; } }, metadata: _metadata }, _nwk_key_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _app_key_decorators, { kind: "field", name: "app_key", static: false, private: false, access: { has: function (obj) { return "app_key" in obj; }, get: function (obj) { return obj.app_key; }, set: function (obj, value) { obj.app_key = value; } }, metadata: _metadata }, _app_key_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _js_int_key_decorators, { kind: "field", name: "js_int_key", static: false, private: false, access: { has: function (obj) { return "js_int_key" in obj; }, get: function (obj) { return obj.js_int_key; }, set: function (obj, value) { obj.js_int_key = value; } }, metadata: _metadata }, _js_int_key_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _js_enc_key_decorators, { kind: "field", name: "js_enc_key", static: false, private: false, access: { has: function (obj) { return "js_enc_key" in obj; }, get: function (obj) { return obj.js_enc_key; }, set: function (obj, value) { obj.js_enc_key = value; } }, metadata: _metadata }, _js_enc_key_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _rj_count1_decorators, { kind: "field", name: "rj_count1", static: false, private: false, access: { has: function (obj) { return "rj_count1" in obj; }, get: function (obj) { return obj.rj_count1; }, set: function (obj, value) { obj.rj_count1 = value; } }, metadata: _metadata }, _rj_count1_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _join_nonce_decorators, { kind: "field", name: "join_nonce", static: false, private: false, access: { has: function (obj) { return "join_nonce" in obj; }, get: function (obj) { return obj.join_nonce; }, set: function (obj, value) { obj.join_nonce = value; } }, metadata: _metadata }, _join_nonce_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _last_join_request_received_decorators, { kind: "field", name: "last_join_request_received", static: false, private: false, access: { has: function (obj) { return "last_join_request_received" in obj; }, get: function (obj) { return obj.last_join_request_received; }, set: function (obj, value) { obj.last_join_request_received = value; } }, metadata: _metadata }, _last_join_request_received_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _owner_decorators, { kind: "field", name: "owner", static: false, private: false, access: { has: function (obj) { return "owner" in obj; }, get: function (obj) { return obj.owner; }, set: function (obj, value) { obj.owner = value; } }, metadata: _metadata }, _owner_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _dev_addr_decorators, { kind: "field", name: "dev_addr", static: false, private: false, access: { has: function (obj) { return "dev_addr" in obj; }, get: function (obj) { return obj.dev_addr; }, set: function (obj, value) { obj.dev_addr = value; } }, metadata: _metadata }, _dev_addr_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DeviceConfiguration = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DeviceConfiguration = _classThis;
}();
exports.DeviceConfiguration = DeviceConfiguration;
var DeviceSession = function () {
    var _classDecorators = [(0, fabric_contract_api_1.Object)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _fnwk_s_int_key_decorators;
    var _fnwk_s_int_key_initializers = [];
    var _snwk_s_int_key_decorators;
    var _snwk_s_int_key_initializers = [];
    var _nwk_s_enc_key_decorators;
    var _nwk_s_enc_key_initializers = [];
    var _home_net_id_decorators;
    var _home_net_id_initializers = [];
    var _dev_addr_decorators;
    var _dev_addr_initializers = [];
    var _dev_eui_decorators;
    var _dev_eui_initializers = [];
    var _f_cnt_up_decorators;
    var _f_cnt_up_initializers = [];
    var _nf_cnt_dwn_decorators;
    var _nf_cnt_dwn_initializers = [];
    var _rj_count0_decorators;
    var _rj_count0_initializers = [];
    var _app_s_key_decorators;
    var _app_s_key_initializers = [];
    var _af_cnt_dwn_decorators;
    var _af_cnt_dwn_initializers = [];
    var _nc_ids_decorators;
    var _nc_ids_initializers = [];
    var _owner_decorators;
    var _owner_initializers = [];
    var DeviceSession = _classThis = /** @class */ (function () {
        function DeviceSession_1() {
            this.fnwk_s_int_key = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _fnwk_s_int_key_initializers, void 0));
            this.snwk_s_int_key = __runInitializers(this, _snwk_s_int_key_initializers, void 0);
            this.nwk_s_enc_key = __runInitializers(this, _nwk_s_enc_key_initializers, void 0);
            this.home_net_id = __runInitializers(this, _home_net_id_initializers, void 0);
            this.dev_addr = __runInitializers(this, _dev_addr_initializers, void 0);
            this.dev_eui = __runInitializers(this, _dev_eui_initializers, void 0);
            this.f_cnt_up = __runInitializers(this, _f_cnt_up_initializers, void 0);
            this.nf_cnt_dwn = __runInitializers(this, _nf_cnt_dwn_initializers, void 0);
            this.rj_count0 = __runInitializers(this, _rj_count0_initializers, void 0);
            this.app_s_key = __runInitializers(this, _app_s_key_initializers, void 0);
            this.af_cnt_dwn = __runInitializers(this, _af_cnt_dwn_initializers, void 0);
            this.nc_ids = __runInitializers(this, _nc_ids_initializers, void 0);
            this.owner = __runInitializers(this, _owner_initializers, void 0);
        }
        return DeviceSession_1;
    }());
    __setFunctionName(_classThis, "DeviceSession");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _fnwk_s_int_key_decorators = [(0, fabric_contract_api_1.Property)("fnwk_s_int_key", "Array<number>")];
        _snwk_s_int_key_decorators = [(0, fabric_contract_api_1.Property)("snwk_s_int_key", "Array<number>")];
        _nwk_s_enc_key_decorators = [(0, fabric_contract_api_1.Property)("nwk_s_enc_key", "Array<number>")];
        _home_net_id_decorators = [(0, fabric_contract_api_1.Property)("home_net_id", "Array<number>")];
        _dev_addr_decorators = [(0, fabric_contract_api_1.Property)("dev_addr", "Array<number>")];
        _dev_eui_decorators = [(0, fabric_contract_api_1.Property)("dev_eui", "Array<number>")];
        _f_cnt_up_decorators = [(0, fabric_contract_api_1.Property)()];
        _nf_cnt_dwn_decorators = [(0, fabric_contract_api_1.Property)()];
        _rj_count0_decorators = [(0, fabric_contract_api_1.Property)()];
        _app_s_key_decorators = [(0, fabric_contract_api_1.Property)("app_s_key", "Array<number>")];
        _af_cnt_dwn_decorators = [(0, fabric_contract_api_1.Property)()];
        _nc_ids_decorators = [(0, fabric_contract_api_1.Property)("nc_ids", "Array<string>")];
        _owner_decorators = [(0, fabric_contract_api_1.Property)()];
        __esDecorate(null, null, _fnwk_s_int_key_decorators, { kind: "field", name: "fnwk_s_int_key", static: false, private: false, access: { has: function (obj) { return "fnwk_s_int_key" in obj; }, get: function (obj) { return obj.fnwk_s_int_key; }, set: function (obj, value) { obj.fnwk_s_int_key = value; } }, metadata: _metadata }, _fnwk_s_int_key_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _snwk_s_int_key_decorators, { kind: "field", name: "snwk_s_int_key", static: false, private: false, access: { has: function (obj) { return "snwk_s_int_key" in obj; }, get: function (obj) { return obj.snwk_s_int_key; }, set: function (obj, value) { obj.snwk_s_int_key = value; } }, metadata: _metadata }, _snwk_s_int_key_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _nwk_s_enc_key_decorators, { kind: "field", name: "nwk_s_enc_key", static: false, private: false, access: { has: function (obj) { return "nwk_s_enc_key" in obj; }, get: function (obj) { return obj.nwk_s_enc_key; }, set: function (obj, value) { obj.nwk_s_enc_key = value; } }, metadata: _metadata }, _nwk_s_enc_key_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _home_net_id_decorators, { kind: "field", name: "home_net_id", static: false, private: false, access: { has: function (obj) { return "home_net_id" in obj; }, get: function (obj) { return obj.home_net_id; }, set: function (obj, value) { obj.home_net_id = value; } }, metadata: _metadata }, _home_net_id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _dev_addr_decorators, { kind: "field", name: "dev_addr", static: false, private: false, access: { has: function (obj) { return "dev_addr" in obj; }, get: function (obj) { return obj.dev_addr; }, set: function (obj, value) { obj.dev_addr = value; } }, metadata: _metadata }, _dev_addr_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _dev_eui_decorators, { kind: "field", name: "dev_eui", static: false, private: false, access: { has: function (obj) { return "dev_eui" in obj; }, get: function (obj) { return obj.dev_eui; }, set: function (obj, value) { obj.dev_eui = value; } }, metadata: _metadata }, _dev_eui_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _f_cnt_up_decorators, { kind: "field", name: "f_cnt_up", static: false, private: false, access: { has: function (obj) { return "f_cnt_up" in obj; }, get: function (obj) { return obj.f_cnt_up; }, set: function (obj, value) { obj.f_cnt_up = value; } }, metadata: _metadata }, _f_cnt_up_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _nf_cnt_dwn_decorators, { kind: "field", name: "nf_cnt_dwn", static: false, private: false, access: { has: function (obj) { return "nf_cnt_dwn" in obj; }, get: function (obj) { return obj.nf_cnt_dwn; }, set: function (obj, value) { obj.nf_cnt_dwn = value; } }, metadata: _metadata }, _nf_cnt_dwn_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _rj_count0_decorators, { kind: "field", name: "rj_count0", static: false, private: false, access: { has: function (obj) { return "rj_count0" in obj; }, get: function (obj) { return obj.rj_count0; }, set: function (obj, value) { obj.rj_count0 = value; } }, metadata: _metadata }, _rj_count0_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _app_s_key_decorators, { kind: "field", name: "app_s_key", static: false, private: false, access: { has: function (obj) { return "app_s_key" in obj; }, get: function (obj) { return obj.app_s_key; }, set: function (obj, value) { obj.app_s_key = value; } }, metadata: _metadata }, _app_s_key_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _af_cnt_dwn_decorators, { kind: "field", name: "af_cnt_dwn", static: false, private: false, access: { has: function (obj) { return "af_cnt_dwn" in obj; }, get: function (obj) { return obj.af_cnt_dwn; }, set: function (obj, value) { obj.af_cnt_dwn = value; } }, metadata: _metadata }, _af_cnt_dwn_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _nc_ids_decorators, { kind: "field", name: "nc_ids", static: false, private: false, access: { has: function (obj) { return "nc_ids" in obj; }, get: function (obj) { return obj.nc_ids; }, set: function (obj, value) { obj.nc_ids = value; } }, metadata: _metadata }, _nc_ids_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _owner_decorators, { kind: "field", name: "owner", static: false, private: false, access: { has: function (obj) { return "owner" in obj; }, get: function (obj) { return obj.owner; }, set: function (obj, value) { obj.owner = value; } }, metadata: _metadata }, _owner_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        DeviceSession = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return DeviceSession = _classThis;
}();
exports.DeviceSession = DeviceSession;
var ChainLoRaWANPacketHelper = /** @class */ (function () {
    function ChainLoRaWANPacketHelper() {
    }
    ChainLoRaWANPacketHelper.from = function (pack, dev_id, sf, timestamp, gws) {
        var hash = crypto_1.default.createHash('sha256').update(pack).digest('hex');
        return {
            private_p: {
                hash: hash,
                packet: pack.toString('hex'),
            },
            packet: {
                hash: hash,
                length: pack.length,
                dev_id: dev_id,
                sf: sf,
                timestamp: timestamp,
                gws: gws
            }
        };
    };
    return ChainLoRaWANPacketHelper;
}());
exports.ChainLoRaWANPacketHelper = ChainLoRaWANPacketHelper;
var ChainLoRaWANPacketPrivate = function () {
    var _classDecorators = [(0, fabric_contract_api_1.Object)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _hash_decorators;
    var _hash_initializers = [];
    var _packet_decorators;
    var _packet_initializers = [];
    var ChainLoRaWANPacketPrivate = _classThis = /** @class */ (function () {
        function ChainLoRaWANPacketPrivate_1() {
            this.hash = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _hash_initializers, void 0));
            this.packet = __runInitializers(this, _packet_initializers, void 0);
        }
        return ChainLoRaWANPacketPrivate_1;
    }());
    __setFunctionName(_classThis, "ChainLoRaWANPacketPrivate");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _hash_decorators = [(0, fabric_contract_api_1.Property)()];
        _packet_decorators = [(0, fabric_contract_api_1.Property)()];
        __esDecorate(null, null, _hash_decorators, { kind: "field", name: "hash", static: false, private: false, access: { has: function (obj) { return "hash" in obj; }, get: function (obj) { return obj.hash; }, set: function (obj, value) { obj.hash = value; } }, metadata: _metadata }, _hash_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _packet_decorators, { kind: "field", name: "packet", static: false, private: false, access: { has: function (obj) { return "packet" in obj; }, get: function (obj) { return obj.packet; }, set: function (obj, value) { obj.packet = value; } }, metadata: _metadata }, _packet_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ChainLoRaWANPacketPrivate = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ChainLoRaWANPacketPrivate = _classThis;
}();
exports.ChainLoRaWANPacketPrivate = ChainLoRaWANPacketPrivate;
var ChainLoRaWANPacket = function () {
    var _classDecorators = [(0, fabric_contract_api_1.Object)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _hash_decorators;
    var _hash_initializers = [];
    var _timestamp_decorators;
    var _timestamp_initializers = [];
    var _dev_id_decorators;
    var _dev_id_initializers = [];
    var _length_decorators;
    var _length_initializers = [];
    var _sf_decorators;
    var _sf_initializers = [];
    var _gws_decorators;
    var _gws_initializers = [];
    var ChainLoRaWANPacket = _classThis = /** @class */ (function () {
        function ChainLoRaWANPacket_1() {
            this.hash = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _hash_initializers, void 0));
            this.timestamp = __runInitializers(this, _timestamp_initializers, void 0);
            this.dev_id = __runInitializers(this, _dev_id_initializers, void 0);
            this.length = __runInitializers(this, _length_initializers, void 0);
            this.sf = __runInitializers(this, _sf_initializers, void 0);
            this.gws = __runInitializers(this, _gws_initializers, void 0);
        }
        return ChainLoRaWANPacket_1;
    }());
    __setFunctionName(_classThis, "ChainLoRaWANPacket");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _hash_decorators = [(0, fabric_contract_api_1.Property)()];
        _timestamp_decorators = [(0, fabric_contract_api_1.Property)()];
        _dev_id_decorators = [(0, fabric_contract_api_1.Property)()];
        _length_decorators = [(0, fabric_contract_api_1.Property)()];
        _sf_decorators = [(0, fabric_contract_api_1.Property)()];
        _gws_decorators = [(0, fabric_contract_api_1.Property)("gws", "Array<string>")];
        __esDecorate(null, null, _hash_decorators, { kind: "field", name: "hash", static: false, private: false, access: { has: function (obj) { return "hash" in obj; }, get: function (obj) { return obj.hash; }, set: function (obj, value) { obj.hash = value; } }, metadata: _metadata }, _hash_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _timestamp_decorators, { kind: "field", name: "timestamp", static: false, private: false, access: { has: function (obj) { return "timestamp" in obj; }, get: function (obj) { return obj.timestamp; }, set: function (obj, value) { obj.timestamp = value; } }, metadata: _metadata }, _timestamp_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _dev_id_decorators, { kind: "field", name: "dev_id", static: false, private: false, access: { has: function (obj) { return "dev_id" in obj; }, get: function (obj) { return obj.dev_id; }, set: function (obj, value) { obj.dev_id = value; } }, metadata: _metadata }, _dev_id_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _length_decorators, { kind: "field", name: "length", static: false, private: false, access: { has: function (obj) { return "length" in obj; }, get: function (obj) { return obj.length; }, set: function (obj, value) { obj.length = value; } }, metadata: _metadata }, _length_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _sf_decorators, { kind: "field", name: "sf", static: false, private: false, access: { has: function (obj) { return "sf" in obj; }, get: function (obj) { return obj.sf; }, set: function (obj, value) { obj.sf = value; } }, metadata: _metadata }, _sf_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _gws_decorators, { kind: "field", name: "gws", static: false, private: false, access: { has: function (obj) { return "gws" in obj; }, get: function (obj) { return obj.gws; }, set: function (obj, value) { obj.gws = value; } }, metadata: _metadata }, _gws_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        ChainLoRaWANPacket = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return ChainLoRaWANPacket = _classThis;
}();
exports.ChainLoRaWANPacket = ChainLoRaWANPacket;
var JoinReqProposal = function () {
    var _classDecorators = [(0, fabric_contract_api_1.Object)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _join_req_decorators;
    var _join_req_initializers = [];
    var _join_accept_decorators;
    var _join_accept_initializers = [];
    var _date_decorators;
    var _date_initializers = [];
    var _nc_id_decorators;
    var _nc_id_initializers = [];
    var JoinReqProposal = _classThis = /** @class */ (function () {
        function JoinReqProposal_1() {
            this.join_req = (__runInitializers(this, _instanceExtraInitializers), __runInitializers(this, _join_req_initializers, void 0));
            this.join_accept = __runInitializers(this, _join_accept_initializers, void 0);
            this.date = __runInitializers(this, _date_initializers, void 0);
            this.nc_id = __runInitializers(this, _nc_id_initializers, void 0);
        }
        return JoinReqProposal_1;
    }());
    __setFunctionName(_classThis, "JoinReqProposal");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _join_req_decorators = [(0, fabric_contract_api_1.Property)("join_req", "Array<number>")];
        _join_accept_decorators = [(0, fabric_contract_api_1.Property)("join_accept", "Array<number>")];
        _date_decorators = [(0, fabric_contract_api_1.Property)()];
        _nc_id_decorators = [(0, fabric_contract_api_1.Property)()];
        __esDecorate(null, null, _join_req_decorators, { kind: "field", name: "join_req", static: false, private: false, access: { has: function (obj) { return "join_req" in obj; }, get: function (obj) { return obj.join_req; }, set: function (obj, value) { obj.join_req = value; } }, metadata: _metadata }, _join_req_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _join_accept_decorators, { kind: "field", name: "join_accept", static: false, private: false, access: { has: function (obj) { return "join_accept" in obj; }, get: function (obj) { return obj.join_accept; }, set: function (obj, value) { obj.join_accept = value; } }, metadata: _metadata }, _join_accept_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: function (obj) { return "date" in obj; }, get: function (obj) { return obj.date; }, set: function (obj, value) { obj.date = value; } }, metadata: _metadata }, _date_initializers, _instanceExtraInitializers);
        __esDecorate(null, null, _nc_id_decorators, { kind: "field", name: "nc_id", static: false, private: false, access: { has: function (obj) { return "nc_id" in obj; }, get: function (obj) { return obj.nc_id; }, set: function (obj, value) { obj.nc_id = value; } }, metadata: _metadata }, _nc_id_initializers, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        JoinReqProposal = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return JoinReqProposal = _classThis;
}();
exports.JoinReqProposal = JoinReqProposal;
