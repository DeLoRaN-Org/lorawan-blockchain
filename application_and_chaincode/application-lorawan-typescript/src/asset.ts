/*
  SPDX-License-Identifier: Apache-2.0
*/

import LoraPacket from 'lora-packet/out/lib/LoraPacket';

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
    AF_CNT_DWN  = "AF_CNT_DWN",
    F_CNT_UP  = "F_CNT_UP",
    NF_CNT_DWN  = "NF_CNT_DWN",
    RJ_COUNT0  = "RJ_COUNT0",
    RJ_COUNT1  = "RJ_COUNT1",
    JOIN_NONCE  = "JOIN_NONCE",
    DEV_NONCE  = "DEV_NONCE",
}

export class Device {
    public class: DeviceClass
    public version: LoRaWANVersion
    public region: Region
    public activation_mode: ActivationMode
    public dev_nonce: number
    public dev_eui: number[]
    public join_eui: number[]
    public nwk_key: number[]
    public app_key: number[]
    public join_context: JoinSessionContext
    public session: SessionContext | undefined
    public last_join_request_received: JoinRequestType
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
    public fnwk_s_int_key: number[]
    public snwk_s_int_key: number[]
    public nwk_s_enc_key: number[]
    public home_net_id: number[]
    public dev_addr: number[]
    public dev_eui: number[]
    public f_cnt_up: number
    public nf_cnt_dwn: number
    public rj_count0: number
    public app_s_key: number[]
    public af_cnt_dwn: number
    public nc_ids: string[]
    public owner: string
}

export class ChainLoRaWANPacketPrivate {
    public hash: string
    public packet: string
}

export class ChainLoRaWANPacket {
    public hash: string
    public timestamp: string
    public dev_id: string
    public length: number
    public sf: number
    public gws: string[]
}

export class JoinReqProposal {
    join_req: number[]
    join_accept: number[]
    date: number
    nc_id: string
}