/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { Context, Contract, Info, Returns, Transaction } from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import { Device, DeviceConfiguration, DeviceHelper, DeviceSession, LoRaWANCounterType } from './asset';
import sortKeysRecursive from 'sort-keys-recursive';
import { Hash, createHash } from 'crypto';

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

let sessionCollectionBaseName = "sessionCollection"

export type BlockchainAns<T> = Promise<{
    content?: T 
}>


@Info({ title: 'LoRaWANDevices', description: 'Smart contract for storing devices context' })
export class LoRaWANDevices extends Contract {

    private verifyClientOrgMatchesPeerOrg(ctx: Context): boolean {
        let clientMSPID = ctx.clientIdentity.getMSPID();
        let peerMSPID = ctx.stub.getMspID();

        console.log(`clientMSPID: ${clientMSPID}, peerMSPID: ${peerMSPID}`);
        
        if (peerMSPID !== clientMSPID) {
            console.error(`Client from org ${clientMSPID} is not authorized to read or write private data from an org ${peerMSPID} peer`);
            throw Error(`Client from org ${clientMSPID} is not authorized to read or write private data from an org ${peerMSPID} peer`);
            //return false
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

    /*
    @Transaction()
    public async InitLedger(ctx: Context): BlockchainAns<void> {
        const devices: DeviceConfiguration[] = []
        for (const device of devices) {
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-sortKeysRecursive(deterministic, {ignoreArrayAtKeys: ignoredKeys})' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            let id = Buffer.from(device.dev_eui).toString('hex')
            let dev_stringed = stringify(sortKeysRecursive(device, {ignoreArrayAtKeys: ignoredKeys}))
            //console.log(stringify(sortKeysRecursive(device, {ignoreArrayAtKeys: ignoredKeys})))
            await ctx.stub.putState(id, Buffer.from(dev_stringed));
            console.info(`Device ${id} initialized`);
        }
    }*/

    @Transaction()
    public async CreateDeviceConfig(ctx: Context, device_config: string): BlockchainAns<void> {
        console.log('Invoked CreateDeviceConfig')
        let dev: DeviceConfiguration = JSON.parse(device_config)
        let id = ctx.clientIdentity.getMSPID()

        dev.owner = ctx.clientIdentity.getMSPID()
        let dev_id: string = Buffer.from(dev.dev_eui).toString('hex')
        const exists = (await this.configExists(ctx, dev_id)).content;
        if (exists) {
            throw new Error(`The device ${dev_id} already exists`);
        }
        //console.log(dev)
        //console.log(dev_id)

        await Promise.all([
            ctx.stub.putState(dev_id, Buffer.from(stringify(sortKeysRecursive(dev, {ignoreArrayAtKeys: ignoredKeys})))),
            ctx.stub.putState(`OwnerOf${dev_id}`, Buffer.from(dev.owner)),
        ])

        return {}
    }
    
    /*
    @Transaction()
    public async CreateDeviceSession(ctx: Context): BlockchainAns<void> {
        //console.log('Invoked CreateDeviceSession')
        if (!this.verifyClientOrgMatchesPeerOrg(ctx)) return

        let tx_map = ctx.stub.getTransient()
        if(!tx_map.has("device_session") || !tx_map.has("dev_eui")) {
            throw new Error("Missing session or dev_eui")
        }

        let dev: DeviceSession = JSON.parse(String.fromCharCode(...tx_map.get("device_session")))
        let dev_eui = Buffer.from(tx_map.get("dev_eui")).toString('hex')

        dev.dev_eui = [...tx_map.get("dev_eui")]

        dev.owner = ctx.clientIdentity.getMSPID()

        let dev_id: string = Buffer.from(dev.dev_addr).toString('hex')
        const exists = (await this.sessionExists(ctx, dev_id)).content;
        if (exists) {
            throw new Error(`The device session for ${dev_id} already exists`);
        }
        
        let collectionName = `${sessionCollectionBaseName}_${ctx.clientIdentity.getMSPID()}`
        
        await ctx.stub.putPrivateData(collectionName, dev_id, Buffer.from(stringify(sortKeysRecursive(dev, {ignoreArrayAtKeys: ignoredKeys}))))
        let device_config: DeviceConfiguration = JSON.parse(await this.ReadDeviceConfig(ctx, dev_eui));
        device_config.dev_addr = dev.dev_addr

        await Promise.all([
            ctx.stub.putState(dev_eui, Buffer.from(stringify(sortKeysRecursive(device_config, {ignoreArrayAtKeys: ignoredKeys})))),
            ctx.stub.putState(`OwnerOf${dev_id}`, Buffer.from(dev.owner)),    
        ])
    }*/

    @Transaction(false)
    public async ReadDevice(ctx: Context, dev_eui: string): BlockchainAns<string> {
        //console.log('Invoked ReadDevice')
        
        const assetJSON = await ctx.stub.getState(dev_eui);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The device ${dev_eui} does not exist`);
        }
        let device_config: DeviceConfiguration = JSON.parse(assetJSON.toString());
        //console.log(device_config)

        let device_sess: DeviceSession | undefined = undefined
        
        if(device_config.dev_addr) {
            //if (!this.verifyClientOrgMatchesPeerOrg(ctx)) return
            if (!this.verifyClientOrgMatchesOwnerOrg(ctx, device_config)) return
            let ans = await this.ReadDeviceSession(ctx, Buffer.from(device_config.dev_addr).toString('hex'))
            device_sess = JSON.parse(ans.content)
        }
        let device: Device = DeviceHelper.from_conf_session(device_config, device_sess)
        
        return {
            content: stringify(sortKeysRecursive(device, {ignoreArrayAtKeys: ignoredKeys}))
        }
    }
    
    @Transaction(false)
    public async ReadDeviceConfig(ctx: Context, dev_eui: string): BlockchainAns<string> {
        //console.log('Invoked ReadDeviceConfig')

        const assetJSON = await ctx.stub.getState(dev_eui);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The device ${dev_eui} does not exist`);
        }
        let device: Device = JSON.parse(assetJSON.toString());
        return {
            content: stringify(sortKeysRecursive(device , {ignoreArrayAtKeys: ignoredKeys}))
        } 
    }

    @Transaction(false)
    public async ReadDeviceSession(ctx: Context, dev_addr: string): BlockchainAns<string> {
        //console.log('Invoked ReadDeviceSessions')
        //if (!this.verifyClientOrgMatchesPeerOrg(ctx)) return

        const assetJSON = await ctx.stub.getPrivateData(`${sessionCollectionBaseName}_${ctx.clientIdentity.getMSPID()}`, dev_addr);
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The device session for ${dev_addr} does not exist`);
        }
        let session: DeviceSession = JSON.parse(assetJSON.toString());
        if (!this.verifyClientOrgMatchesOwnerOrg(ctx, session)) return

        return {
            content: stringify(sortKeysRecursive(session, {ignoreArrayAtKeys: ignoredKeys}))
        }       
    }

    // DeleteAsset deletes an given asset from the world state.
    @Transaction()
    public async DeleteDevice(ctx: Context, dev_eui: string): BlockchainAns<void> {
        //console.log('Invoked DeleteDevice')
        const assetJSON = await ctx.stub.getState(dev_eui);
        const exists = assetJSON && assetJSON.length > 0;
        if (!exists) {
            throw new Error(`The asset ${dev_eui} does not exist`);
        }
        let config: DeviceConfiguration = JSON.parse(assetJSON.toString());
        if(ctx.clientIdentity.getMSPID() === config.owner) {
            let promises = [
                ctx.stub.deleteState(dev_eui),
                ctx.stub.deleteState(`OwnerOf${dev_eui}`)
            ]
            if (config.dev_addr) {
                await this.DeleteDeviceSession(ctx, Buffer.from(config.dev_addr).toString('hex'))
            } 
            Promise.all(promises)
        }

        return {}
    }
    
    @Transaction()
    public async DeleteDeviceSession(ctx: Context, dev_addr: string): BlockchainAns<void> {
        //console.log('Invoked DeleteDeviceSession')

        if (!this.verifyClientOrgMatchesPeerOrg(ctx)) return
        const exists = (await this.sessionExists(ctx, dev_addr)).content;
        if (!exists) {
            throw new Error(`The asset ${dev_addr} does not exist`);
        }

        let [r1,r2] = await Promise.all([
            ctx.stub.deletePrivateData(`${sessionCollectionBaseName}_${ctx.clientIdentity.getMSPID()}`, dev_addr),
            ctx.stub.deleteState(`OwnerOf${dev_addr}`),       
        ]);
    }

    // EntryExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async configExists(ctx: Context, dev_id: string): BlockchainAns<boolean> {
        //console.log('Invoked configExists')

        const assetJSON = await ctx.stub.getState(dev_id);
        console.log(assetJSON);
        return {
            content: assetJSON && assetJSON.length > 0
        }
    }
    
    // EntryExists returns true when asset with given ID exists in world state.
    @Transaction(false)
    @Returns('boolean')
    public async sessionExists(ctx: Context, dev_id: string): BlockchainAns<boolean> {
        //console.log('Invoked sessionExists')
        const assetJSON = await ctx.stub.getPrivateData(`${sessionCollectionBaseName}_${ctx.clientIdentity.getMSPID()}`, dev_id);
        return {
            content: assetJSON && assetJSON.length > 0
        }
    }
    

    // TransferAsset updates the owner field of asset with given id in the world state, and returns the old owner.
    @Transaction()
    public async TransferDevice(ctx: Context, dev_eui: string, newOwner: string): BlockchainAns<string> {
        const assetString = await this.ReadDeviceConfig(ctx, dev_eui);
        const asset: Device = JSON.parse(assetString.content);
        const oldOwner = asset.owner;
        asset.owner = newOwner;

        await ctx.stub.putState(dev_eui, Buffer.from(stringify(sortKeysRecursive(asset, {ignoreArrayAtKeys: ignoredKeys}))));
        return {
            content: oldOwner
        }
    }

    // GetChainHash returns an hash of the whole blockchain.
    @Transaction(false)
    @Returns('string')
    public async GetChainHash(ctx: Context): BlockchainAns<string> {
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        let sha256 = createHash('sha256');
        let code: Hash;

        const configs: DeviceConfiguration[] = []

        while (!result.done) {
            const strValue = Buffer.from(result.value.value).toString('utf8');
            
            //console.log(strValue);
            try {
                let record = JSON.parse(strValue);
                configs.push(record);
            }
            catch(err) {}
            code = sha256.update(strValue);
            result = await iterator.next();
        }

        for(let config of configs) {
            if(config.dev_addr) {
                let dev_addr: string = Buffer.from(config.dev_addr).toString('hex')
                let owner = Buffer.from(await ctx.stub.getState(`OwnerOf${dev_addr}`)).toString('utf8')
                const private_data_hash = Buffer.from(await ctx.stub.getPrivateDataHash(`${sessionCollectionBaseName}_${owner}`, dev_addr)).toString('hex');
                code = sha256.update(private_data_hash);
            }
        }

        let output = sha256.digest().toString('base64');
        return {
            content: output
        }
    }
    
    // GetAllAssets returns all assets found in the world state.
    @Transaction(false)
    @Returns('string')
    public async GetAllDevices(ctx: Context): BlockchainAns<string> {
        const allResults = {
            configs: [],
            sessions: [],
            packets: []
        };
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();

        let container = ''
        while (!result.done) {
            const strValue = Buffer.from(result.value.value).toString('utf8');
            let record = JSON.parse(strValue);
            
            if(record.dev_eui) allResults.configs.push(record);
            else if(record.hash) allResults.packets.push(record) 
            else allResults.sessions.push(record)
            result = await iterator.next();
        }

        return {
            content: stringify(sortKeysRecursive(allResults, {ignoreArrayAtKeys: ignoredKeys})) 
        }
    }

    @Transaction(false)
    public async GetDeviceOrg(ctx: Context, devID: string): BlockchainAns<string> {
        //console.log('Invoked GetDeviceOrg')

        const asset = await ctx.stub.getState(`OwnerOf${devID}`);
        if (!asset || asset.length === 0) {
            throw new Error(`The device ${devID} does not exist`);
        }
        let dev_owner =  asset.toString();
        //console.log(dev_owner)
        return {
            content: dev_owner
        }
    }
    
    @Transaction(true)
    public async CreateFlag(ctx: Context): BlockchainAns<void> {
        //console.log('Invoked GetDeviceOrg')
        await ctx.stub.putState(`ConvergenceFlagTest`, Buffer.from('imaconvergenceflagtest'));
        //console.log(dev_owner)
        return {}
    }

    @Transaction(true)
    public async ClearFlag(ctx: Context): BlockchainAns<void> {
        //console.log('Invoked GetDeviceOrg')
        await ctx.stub.putState(`ConvergenceFlagTest`, Buffer.from("notaflag"));
        return {}
    }
    
    @Transaction()
    public async ReadFlag(ctx: Context): BlockchainAns<string> {
        //console.log('Invoked GetDeviceOrg')

        let asset = await ctx.stub.getState(`ConvergenceFlagTest`) || Buffer.from("notaflag");
        let dev_owner =  asset.toString();
        //console.log(dev_owner)
        return {
            content: dev_owner
        }
    }
}
