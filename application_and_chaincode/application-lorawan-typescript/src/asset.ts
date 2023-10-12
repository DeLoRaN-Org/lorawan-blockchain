/*
  SPDX-License-Identifier: Apache-2.0
*/
import * as crypto from 'crypto';

export enum Region {
    EU863_870 = "EU863_870",
    EU443 = "EU443",
    US902_928 = "US902_928",
    CN779_787 = "CN779_787",
    AU915_928 = "AU915_928",
    CN470_510 = "CN470_510",
    AS923 = "AS923",
    KR920_923 = "KR920_923",
    INDIA865_867 = "INDIA865_867",
}

export enum ActivationMode {
    ABP = "ABP",
    OTAA = "OTAA",
}

export enum DeviceClass {
    A = "A",
    B = "B",
    C = "C",
}

export enum LoRaWANVersion {
    V1_0 = "V1_0",
    V1_0_1 = "V1_0_1",
    V1_0_2 = "V1_0_2",
    V1_0_3 = "V1_0_3",
    V1_0_4 = "V1_0_4",
    V1_1 = "V1_1",
}

export enum JoinRequestType {
    JoinRequest = "JoinRequest",
    RejoinRequest0 = "RejoinRequest0",
    RejoinRequest1 = "RejoinRequest1",
    RejoinRequest2 = "RejoinRequest2",
}

export interface SessionContext {
    application_context: ApplicationSessionContext
    network_context: NetworkSessionContext
}

export interface ApplicationSessionContext {
    app_s_key: number[]
    af_cnt_dwn: number
}

export interface NetworkSessionContext {
    fnwk_s_int_key: number[]
    snwk_s_int_key: number[]
    nwk_s_enc_key: number[]

    home_net_id: number[]
    dev_addr: number[]
    f_cnt_up: number
    nf_cnt_dwn: number
    rj_count0: number
}

export interface JoinSessionContext {
    js_int_key: number[],
    js_enc_key: number[],
    rj_count1: number,
    join_nonce: number,
}

export enum LoRaWANCounterType {
    AF_CNT_DWN = "AF_CNT_DWN",
    F_CNT_UP = "F_CNT_UP",
    NF_CNT_DWN = "NF_CNT_DWN",
    RJ_COUNT0 = "RJ_COUNT0",
    RJ_COUNT1 = "RJ_COUNT1",
    JOIN_NONCE = "JOIN_NONCE",
    DEV_NONCE = "DEV_NONCE",
}


export class DeviceHelper {
    private static default(): Device {
        let b: Device = {
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
        }

        return b
    }

    static from(o: any): Device {
        let device: Device = this.default()
        Object.assign(device, o)
        return device
    }

    static from_conf_session(conf: DeviceConfiguration, session: DeviceSession | undefined): Device {
        let s: SessionContext | undefined = undefined

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
            }
        }

        let jsc: JoinSessionContext = {
            js_int_key: conf.js_int_key,
            js_enc_key: conf.js_enc_key,
            rj_count1: conf.rj_count1,
            join_nonce: conf.join_nonce
        }

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
        }

    }

    static to_conf_session(d: Device): { sess?: DeviceSession, conf: DeviceConfiguration } {
        let s: DeviceSession | undefined = undefined;

        if (d.session) {
            let nc = d.session.network_context
            s = {
                //app_key: d.app_key,
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
            dev_addr: d.session ? d.session.network_context.dev_addr : undefined
        }

        return {
            sess: s,
            conf: c
        }
    }

    static from_str(s: string): Device {
        let device: Device = this.default()
        let j_dev = JSON.parse(s)
        Object.assign(device, j_dev)
        return device
    }
}


export class Device {
    //
    public class: DeviceClass

    //
    public version: LoRaWANVersion

    //
    public region: Region

    //
    public activation_mode: ActivationMode

    //
    public dev_nonce: number

    //
    public dev_eui: number[]
    //
    public join_eui: number[]

    //
    public nwk_key: number[]
    //
    public app_key: number[]

    //
    public join_context: JoinSessionContext
    //
    public session: SessionContext | undefined

    //
    public last_join_request_received: JoinRequestType

    //
    public owner: string
}


export class DeviceConfiguration {
    public class: DeviceClass
    public version: LoRaWANVersion
    public region: Region
    public activation_mode: ActivationMode
    public dev_nonce: number
    public dev_eui: number[]
    public join_eui: number[]
    public nwk_key: number[]
    public app_key: number[]
    public js_int_key: number[]
    public js_enc_key: number[]
    public rj_count1: number
    public join_nonce: number
    public last_join_request_received: JoinRequestType
    public owner: string
    public dev_addr: number[] | undefined
}


export class DeviceSession {
    //public app_key: number[]
    public fnwk_s_int_key: number[]
    public snwk_s_int_key: number[]
    public nwk_s_enc_key: number[]
    public home_net_id: number[]
    public dev_addr: number[]
    public f_cnt_up: number
    public nf_cnt_dwn: number
    public rj_count0: number
    public app_s_key: number[]
    public af_cnt_dwn: number
    public owner: string
}


export class ChainLoRaWANPacketHelper {
    static from(pack: Buffer, dev_id: string, sf: number, timestamp: Date, gws: string[]): { private_p: ChainLoRaWANPacketPrivate, packet: ChainLoRaWANPacket} {
        let hash = crypto.createHash('sha256').update(pack).digest('hex')

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
                timestamp: timestamp.getTime(),
                gws
            }
        }
    }
}

export class ChainLoRaWANPacketPrivate {
    public hash: string
    public packet: string
}

export class ChainLoRaWANPacket {
    public hash: string
    public timestamp: number
    public dev_id: string
    public length: number   //
    // to calculate time-on-air of the packet
    public sf: number       //
    public gws: string[]
}