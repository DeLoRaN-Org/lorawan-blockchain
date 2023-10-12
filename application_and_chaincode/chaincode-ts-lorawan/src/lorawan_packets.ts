import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import { ChainLoRaWANPacket, ChainLoRaWANPacketHelper, Device, DeviceConfiguration, DeviceSession, LoRaWANCounterType, LoRaWANVersion } from './asset';
import LoRaPacket from 'lora-packet'
import LoraPacket from 'lora-packet/out/lib/LoraPacket';
import { BlockchainAns } from './lorawan_devices';

let ignoredKeys: string[] = [
    "dev_eui",
    "join_eui",
    "nwk_key",
    "app_key",
    "js_int_key",
    "js_enc_key",
    "app_key",
    "fnwk_s_int_key",
    "snwk_s_int_key",
    "nwk_s_enc_key",
    "home_net_id",
    "dev_addr",
    "app_s_key"
]

@Info({ title: 'LoRaWANPackets', description: 'Smart contract for storing packets history' })
export class LoRaWANPackets extends Contract {
    private packetCollectionBaseName = "packetsCollection";
    private sessionCollectionBaseName = "sessionCollection"

    private verifyClientOrgMatchesPeerOrg(ctx: Context): boolean {
        let clientMSPID = ctx.clientIdentity.getMSPID();
        let peerMSPID = ctx.stub.getMspID();

        //console.log(`clientMSPID: ${clientMSPID}, peerMSPID: ${peerMSPID}`);
        
        if (peerMSPID !== clientMSPID) {
            console.error(`Client from org ${clientMSPID} is not authorized to read or write private data from an org ${peerMSPID} peer`);
            throw Error(`Client from org ${clientMSPID} is not authorized to read or write private data from an org ${peerMSPID} peer`);
        }
        return true
    }
    
    private verifyClientOrgMatchesOwnerOrg(ctx: Context, dc: DeviceConfiguration | DeviceSession): boolean {
        //console.log(dc)
        //console.log(`clientMSPID: ${ctx.clientIdentity.getMSPID()}, owner: ${dc.owner}, peerMSPID ${ctx.stub.getMspID()}`);
        if (ctx.clientIdentity.getMSPID() !== dc.owner) {
            console.error(`Client from org ${ctx.clientIdentity.getMSPID()} is not authorized to read or write private data of ${dc.owner}`);
            throw Error(`Client from org ${ctx.clientIdentity.getMSPID()} is not authorized to read or write private data of ${dc.owner}`);
        }
        return true
    }

    checkDataPacket(ctx: Context, deviceSession: DeviceSession, p: LoraPacket) {
        if(!p.isDataMessage() || !p.getDir()) {
            throw new Error(`The packet is not a data message`);
        }

        let counter: number = 0
        if(p.getDir() == 'up') {
            counter = deviceSession.f_cnt_up
        } else {
            counter = deviceSession.af_cnt_dwn
        }

        let fcntMSBytes = Buffer.alloc(4)
        fcntMSBytes.writeUInt32BE(counter, 0)
        fcntMSBytes = fcntMSBytes.slice(0,2)

        //let expected_mic = LoRaPacket.calculateMIC(p, Buffer.from(deviceSession.nwk_s_enc_key), Buffer.from(deviceSession.app_s_key), fcntMSBytes)
        let mic_valid = LoRaPacket.verifyMIC(p, Buffer.from(deviceSession.nwk_s_enc_key), Buffer.from(deviceSession.app_s_key), fcntMSBytes)
        if(!mic_valid) {
            let dev_id = p.DevEUI || p.DevAddr
            throw new Error(`Invalid MIC for packet ${p.PHYPayload.toString('hex')} from ${dev_id.toString('hex')}, got ${p.MIC.toString('hex')}, session ${JSON.stringify(deviceSession)}`);
        }
    }
    
    async checkJoinAcceptPacket(ctx: Context, ja: LoraPacket, jr: LoraPacket): Promise<void> {
        if(!ja.isJoinAcceptMessage()) {
            throw new Error(`The packet is not a join accept`);
        }

        //FIXME non ho il dev_eui nella join accept ma ho il dev_address, peccato che il join nonce sia nella configurazione
        //TODO testare che la funzione funzioni lol

        //let device_config: DeviceConfiguration = JSON.parse((await ctx.stub.getState(jr.DevEUI.toString('hex'))).toString())
        //let join_nonce = p.JoinNonce.readUInt16BE(0)
        //if(join_nonce <= device_config.join_nonce) throw new Error(`Invalid DevNonce: ${device_config.join_nonce}`);
        //let expected_mic = LoRaPacket.calculateMIC(p, Buffer.from(device_config.js_enc_key), Buffer.from(device_config.nwk_key),Buffer.from([0,0])) 
        //if(!LoRaPacket.verifyMIC(p, Buffer.from(device_config.js_enc_key), Buffer.from(device_config.nwk_key),Buffer.from([0,0]))) {
        //    throw new Error(`Invalid MIC for packet ${p.toString()}}, expected ${expected_mic}, got ${p.MIC}`);
        //}
    }

    async checkJoinRejoinPacket(ctx: Context, p: LoraPacket): Promise<void> {
        if(!p.isJoinRequestMessage() && !p.isReJoinRequestMessage()) {
            throw new Error(`The packet is not a join or rejoin request message`);
        }
        
        let mic_valid = false;
        let expected_mic = undefined;
        if((p.isJoinRequestMessage())) {
            let config = (await ctx.stub.getState(p.DevEUI.toString('hex'))).toString()
            //console.log(`Config: ${config}, dev_eui: ${p.DevEUI.toString('hex')}`)
            let device_config: DeviceConfiguration = JSON.parse(config)
            let dev_nonce = p.DevNonce.readUInt16BE(0)
            if(dev_nonce <= device_config.dev_nonce) throw new Error(`Invalid DevNonce: ${device_config.dev_nonce}`);
            expected_mic = LoRaPacket.calculateMIC(p, Buffer.from(device_config.nwk_key), Buffer.from(device_config.app_key),Buffer.from([0,0]))
            mic_valid = LoRaPacket.verifyMIC(p, Buffer.from(device_config.nwk_key), Buffer.from(device_config.app_key),Buffer.from([0,0]))
        }
        else if(p.isReJoinRequestMessage()) {
            if(p.RejoinType[0] == 0 || p.RejoinType[0] == 2) {
                throw new Error(`Not supported, maybe later`)
                //let device_config: DeviceSession = JSON.parse((await ctx.stub.getState(Buffer.from(/*we need dev_addr to get the session*/).toString('hex'))).toString())
                //device_config.rj_count1
                //mic_valid = LoRaPacket.verifyMIC(p, Buffer.from(device_config.nwk_key), Buffer.from(device_config.app_key),Buffer.from([0,0]))

            } else if(p.RejoinType[0] == 1) {
                let config = (await ctx.stub.getState(Buffer.from(p.DevEUI).toString('hex'))).toString()
                //console.log(`Config: ${config}, dev_eui: ${p.DevEUI.toString('hex')}`)
                let device_config: DeviceConfiguration = JSON.parse(config)
                let dev_nonce = p.DevNonce.readUInt16BE(0)
                if(dev_nonce <= device_config.rj_count1) throw new Error(`Invalid DevNonce: ${device_config.dev_nonce}`);
                expected_mic = LoRaPacket.calculateMIC(p, Buffer.from(device_config.nwk_key), Buffer.from(device_config.js_int_key),Buffer.from([0,0]))
                mic_valid = LoRaPacket.verifyMIC(p, Buffer.from(device_config.nwk_key), Buffer.from(device_config.js_int_key),Buffer.from([0,0]))
            }
        }
        
        if(!mic_valid) {
            throw new Error(`Invalid MIC for packet ${p.toString()}}, expected ${expected_mic}, got ${p.MIC}`);
        }
    }

    IncreaseDevCounter(ctx: Context, dev: DeviceConfiguration | DeviceSession, counter_t: LoRaWANCounterType, new_value: number): DeviceConfiguration | DeviceSession {
        //console.log('Invoked IncreaseDevCounter')
        let is_config = false
        if (counter_t == LoRaWANCounterType.RJ_COUNT1 ||
            counter_t == LoRaWANCounterType.JOIN_NONCE ||
            counter_t == LoRaWANCounterType.DEV_NONCE) {
                is_config = true
        }
         
        if((this.isDeviceConfig(dev) && !is_config) || (!this.isDeviceConfig(dev) && is_config)) {
            throw new Error("Mismatch between counter type and device passed")
        }

        let deviceSession: DeviceSession
        let deviceConfig: DeviceConfiguration
        let dev_id: string

        if(this.isDeviceConfig(dev)) {
            deviceConfig = dev
            dev_id = Buffer.from(deviceConfig.dev_eui).toString('hex')
            if (!this.verifyClientOrgMatchesOwnerOrg(ctx, deviceConfig)) return
            
        } else {
            deviceSession = dev
            dev_id = Buffer.from(deviceSession.dev_addr).toString('hex')
            if (!this.verifyClientOrgMatchesOwnerOrg(ctx, deviceSession)) return

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

    private isDeviceConfig(v: DeviceConfiguration | DeviceSession): v is DeviceConfiguration  {
        if((<DeviceConfiguration>v).version && (<DeviceConfiguration>v).region) return true
        else return false
    }

    async sessionExists(ctx: Context, dev_id: string): Promise<boolean> {
        //console.log('Invoked sessionExists')
        const assetJSON = await ctx.stub.getPrivateData(`${this.sessionCollectionBaseName}_${ctx.clientIdentity.getMSPID()}`, dev_id);
        return assetJSON && assetJSON.length > 0;
    }
    

    async HandleJoinRequest(ctx: Context, join_req: LoraPacket, join_req_buff: Buffer, date: string, n_id: string): Promise<void> {
        let tx_map = ctx.stub.getTransient()
        if(!tx_map.has("answer")) {
            throw new Error("Missing join_accept")
        }
        let ja = Buffer.from(tx_map.get('answer'));
        let join_accept = LoRaPacket.fromWire(ja)

        await this.checkJoinAcceptPacket(ctx, join_accept, join_req)

        let dev_eui = join_req.DevEUI.toString('hex')

        let assetJSON = await ctx.stub.getState(dev_eui);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The device ${dev_eui} does not exist`);
        }

        let config: DeviceConfiguration = JSON.parse(assetJSON.toString())

        let updated_config = this.IncreaseDevCounter(ctx, config, LoRaWANCounterType.DEV_NONCE, join_req.DevNonce.readUInt16BE(0))

        if(this.isDeviceConfig(updated_config)) {
            let decrypted_join_accept = LoRaPacket.fromWire(LoRaPacket.decryptJoinAccept(join_accept, Buffer.from(updated_config.nwk_key)))
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
                    home_net_id: [...decrypted_join_accept.NetID],
                    dev_addr: [...decrypted_join_accept.DevAddr],
                    dev_eui: updated_config.dev_eui,
                    f_cnt_up: 0,
                    nf_cnt_dwn: 0,
                    rj_count0: 0,
                    app_s_key: [...AppSKey],
                    af_cnt_dwn: 0,
                    owner: ctx.clientIdentity.getMSPID()
                }
            } else {
                let {AppSKey, NwkSKey} = LoRaPacket.generateSessionKeys10(
                    Buffer.from(updated_config.nwk_key),
                    decrypted_join_accept.NetID,
                    decrypted_join_accept.AppNonce,
                    join_req.DevNonce
                )

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
                    owner: ctx.clientIdentity.getMSPID()
                }
            }

            let dev_addr: string = Buffer.from(device_session.dev_addr).toString('hex') //TODO CHECK PRIMA DELLA GENERAZIONE DELLE SESSIONI
            const exists = await this.sessionExists(ctx, dev_addr);
            if (exists) {
                throw new Error(`The device session for ${dev_addr} already exists`);
            }

            updated_config.dev_addr = device_session.dev_addr
            
            let sessionCollectionName = `${this.sessionCollectionBaseName}_${ctx.clientIdentity.getMSPID()}`
            let packetCollectionName = `${this.packetCollectionBaseName}_${ctx.clientIdentity.getMSPID()}`

            let join_accept_s = ChainLoRaWANPacketHelper.from(ja, device_session.owner, 7, date, [n_id]); //TODO owner è sbagliato, bisogna mettere il dev_addr ma bisogna gestire il caso della join accept
            let join_req_s = ChainLoRaWANPacketHelper.from(join_req_buff, device_session.owner, 7, date, [n_id]); //TODO owner è sbagliato, bisogna mettere il dev_addr ma bisogna gestire il caso della join accept

            await Promise.all([
                ctx.stub.putState(dev_eui, Buffer.from(stringify(sortKeysRecursive(updated_config, {ignoreArrayAtKeys: ignoredKeys})))),
                ctx.stub.putState(`OwnerOf${dev_addr}`, Buffer.from(device_session.owner)),    
                ctx.stub.putState(join_accept_s.packet.hash, Buffer.from(stringify(sortKeysRecursive(join_accept_s.packet)))),
                ctx.stub.putState(join_req_s.packet.hash, Buffer.from(stringify(sortKeysRecursive(join_req_s.packet)))),
                ctx.stub.putPrivateData(sessionCollectionName, dev_addr, Buffer.from(stringify(sortKeysRecursive(device_session, {ignoreArrayAtKeys: ignoredKeys})))),
                ctx.stub.putPrivateData(packetCollectionName, join_accept_s.private_p.hash, Buffer.from(stringify(sortKeysRecursive(join_accept_s.private_p)))),
                ctx.stub.putPrivateData(packetCollectionName, join_req_s.private_p.hash, Buffer.from(stringify(sortKeysRecursive(join_req_s.private_p))))
            ])
        }
    }
    
    
    async HandleDataPacket(ctx: Context, pack: LoraPacket, original_packet: Buffer, date: string, n_id: string): Promise<void> {
        let stringAddr = pack.DevAddr.toString('hex')
        let owner = (await ctx.stub.getState(`OwnerOf${stringAddr}`)).toString()
        let sessionCollectionName = `${this.sessionCollectionBaseName}_${owner}`
        let packetCollectionName = `${this.packetCollectionBaseName}_${owner}`
        
        let {private_p, packet} = ChainLoRaWANPacketHelper.from(original_packet, owner, 7, date, [n_id]); //TODO owner è sbagliato, bisogna mettere il dev_id ma bisogna gestire il caso della join accept        
        const exists = (await this.PacketExists(ctx, packet.hash)).content;
        
        if (exists) {
            throw new Error(`The packet ${packet.hash} already exists`);
        }
        if (!this.verifyClientOrgMatchesPeerOrg(ctx)) return
        
        //console.log(`Owner: ${owner}, dev_eui: ${stringAddr}`)
        let sess = (await ctx.stub.getPrivateData(sessionCollectionName, stringAddr)).toString()
        //console.log(`Session: ${sess}, dev_eui: ${stringAddr}`)
        let device_session: DeviceSession = JSON.parse(sess)
        this.checkDataPacket(ctx, device_session, pack)
        
        let counter_type: LoRaWANCounterType = pack.getDir() == 'up' ? LoRaWANCounterType.F_CNT_UP : LoRaWANCounterType.AF_CNT_DWN
        let updated_session = this.IncreaseDevCounter(ctx, device_session, counter_type, pack.FCnt.readUInt16BE(0))
        
        let promises = []

        if (pack.isConfirmed()) {
            let tx_map = ctx.stub.getTransient()
            if(!tx_map.has("answer")) {
                throw new Error("Missing field answer for confirmed data packet")
            }
            
            let ans = Buffer.from(tx_map.get('answer'));
            let ans_pack = LoRaPacket.fromWire(ans)
            this.checkDataPacket(ctx, device_session, ans_pack)
            
            let {private_p, packet} = ChainLoRaWANPacketHelper.from(ans, owner, 7, date, [n_id]); //TODO owner è sbagliato, bisogna mettere il dev_id ma bisogna gestire il caso della join accept        

            counter_type = ans_pack.getDir() == 'up' ? LoRaWANCounterType.F_CNT_UP : LoRaWANCounterType.AF_CNT_DWN
            updated_session = this.IncreaseDevCounter(ctx, updated_session, counter_type, ans_pack.FCnt.readUInt16BE(0))

            promises.push(
                ctx.stub.putState(packet.hash, Buffer.from(stringify(sortKeysRecursive(packet)))),
                ctx.stub.putPrivateData(packetCollectionName, private_p.hash, Buffer.from(stringify(sortKeysRecursive(private_p))))
            )
        }

        promises.push(
            ctx.stub.putPrivateData(sessionCollectionName, stringAddr, Buffer.from(stringify(sortKeysRecursive(updated_session, {ignoreArrayAtKeys: ignoredKeys})))),
            ctx.stub.putState(packet.hash, Buffer.from(stringify(sortKeysRecursive(packet)))),
            ctx.stub.putPrivateData(packetCollectionName, private_p.hash, Buffer.from(stringify(sortKeysRecursive(private_p))))
        )

        await Promise.all(promises)
    }

    
    @Transaction()
    public async CreatePacket(ctx: Context): BlockchainAns<void> {
        console.log(`MSPID: ${ctx.clientIdentity.getMSPID()}`)
        console.log(`ID: ${ctx.clientIdentity.getID()}`)
        if (!this.verifyClientOrgMatchesPeerOrg(ctx)) return

        let tx_map = ctx.stub.getTransient()
        if(!tx_map.has("packet") || !tx_map.has("n_id") || !tx_map.has("date")) {
            throw new Error("Missing fields to create packet")
        }

        let b = Buffer.from(tx_map.get('packet'));
        let date = Buffer.from(tx_map.get('date')).toString('utf8');
        let n_id = Buffer.from(tx_map.get('n_id')).toString('utf8');
        let p: LoraPacket = LoRaPacket.fromWire(b)

        if(p.isJoinRequestMessage() || p.isReJoinRequestMessage()) {
            await this.checkJoinRejoinPacket(ctx, p)
            await this.HandleJoinRequest(ctx, p, b, date, n_id)
        } else if(p.isDataMessage()) {
            await this.HandleDataPacket(ctx, p, b, date, n_id)
        } else {
            throw new Error(`Unknown packet type, probably unsupported`)
        }
        console.log('*** Result: committed')
    }

    @Transaction(false)
    public async ReadPacket(ctx: Context, hash: string): BlockchainAns<string> {
        const assetJSON = await ctx.stub.getState(hash);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The packet ${hash} does not exist`);
        }
        let packet: ChainLoRaWANPacket = JSON.parse(assetJSON.toString());
        return {
            content: stringify(sortKeysRecursive(packet, {ignoreArrayAtKeys: ignoredKeys}))
        } 
    }
    
    @Transaction(false)
    public async ReadPrivatePacket(ctx: Context, hash: string): BlockchainAns<string> {
        const assetJSON = await ctx.stub.getPrivateData(`${this.packetCollectionBaseName}_${ctx.clientIdentity.getMSPID()}`, hash);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The packet ${hash} does not exist`);
        }
        let packet: ChainLoRaWANPacket = JSON.parse(assetJSON.toString());
        return {
            content: stringify(sortKeysRecursive(packet, {ignoreArrayAtKeys: ignoredKeys}))
        }
    }

    @Transaction(false)
    public async PacketExists(ctx: Context, hash: string): BlockchainAns<boolean> {
        const assetJSON = await ctx.stub.getState(hash);
        return {
            content: assetJSON && assetJSON.length > 0
        }
    }

    @Transaction(false)
    @Returns('string')
    public async GetPublicBlockchainState(ctx: Context): BlockchainAns<string> {
        const allResults: any = {
            packets: [],
            configs: []
        };
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value).toString('utf8');
            //console.log(strValue);
            try {
                let record = JSON.parse(strValue);
                if(record.hash) allResults.packets.push(record) 
                else allResults.configs.push(record);
            } catch(e) {
                console.error(e)
                //console.log('Just owner data, skipping...')
            }
            result = await iterator.next();
        }
        return {
            content: stringify(sortKeysRecursive(allResults, {ignoreArrayAtKeys: ignoredKeys}))
        }
    }
}