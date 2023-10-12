/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { Contract, Identity, Network, Signer, connect, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

const cryptoPathOrg1_16Peers = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'test-network-16peers2orgs',
    'organizations',
    'peerOrganizations',
    'org1.example.com'
);

const cryptoPathOrg2_16Peers = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'test-network-16peers2orgs',
    'organizations',
    'peerOrganizations',
    'org2.example.com'
);

const cryptoPathOrg1_8Peers = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'test-network-8peers2orgs',
    'organizations',
    'peerOrganizations',
    'org1.example.com'
);

const cryptoPathOrg2_8Peers = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'test-network-8peers2orgs',
    'organizations',
    'peerOrganizations',
    'org2.example.com'
);

// Path to org2 crypto materials.
const cryptoPathOrg2_2Peers = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'test-network-2peers2orgs',
    'organizations',
    'peerOrganizations',
    'org2.example.com'
);

// Path to org1 crypto materials.
const cryptoPathOrg1_2Peers = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'test-network-2peers2orgs',
    'organizations',
    'peerOrganizations',
    'org1.example.com'
);

// Gateway peer endpoint.
export const peerEndpointOrg1Peer0 = 'localhost:7051';
export const peerEndpointOrg1Peer1 = 'localhost:7053';
export const peerEndpointOrg1Peer2 = 'localhost:7055';
export const peerEndpointOrg1Peer3 = 'localhost:7057';
export const peerEndpointOrg1Peer4 = 'localhost:7059';
export const peerEndpointOrg1Peer5 = 'localhost:7061';
export const peerEndpointOrg1Peer6 = 'localhost:7063';
export const peerEndpointOrg1Peer7 = 'localhost:7065';

export const peerEndpointOrg2Peer0 = 'localhost:9051';
export const peerEndpointOrg2Peer1 = 'localhost:9053';
export const peerEndpointOrg2Peer2 = 'localhost:9055';
export const peerEndpointOrg2Peer3 = 'localhost:9057';
export const peerEndpointOrg2Peer4 = 'localhost:9059';
export const peerEndpointOrg2Peer5 = 'localhost:9061';
export const peerEndpointOrg2Peer6 = 'localhost:9063';
export const peerEndpointOrg2Peer7 = 'localhost:9065';

// Gateway peer container name.
export const peerNameOrg1Peer0 = 'peer0.org1.example.com';
export const peerNameOrg1Peer1 = 'peer1.org1.example.com';
export const peerNameOrg1Peer2 = 'peer2.org1.example.com';
export const peerNameOrg1Peer3 = 'peer3.org1.example.com';
export const peerNameOrg1Peer4 = 'peer4.org1.example.com';
export const peerNameOrg1Peer5 = 'peer5.org1.example.com';
export const peerNameOrg1Peer6 = 'peer6.org1.example.com';
export const peerNameOrg1Peer7 = 'peer7.org1.example.com';

export const peerNameOrg2Peer0 = 'peer0.org2.example.com';
export const peerNameOrg2Peer1 = 'peer1.org2.example.com';
export const peerNameOrg2Peer2 = 'peer2.org2.example.com';
export const peerNameOrg2Peer3 = 'peer3.org2.example.com';
export const peerNameOrg2Peer4 = 'peer4.org2.example.com';
export const peerNameOrg2Peer5 = 'peer5.org2.example.com';
export const peerNameOrg2Peer6 = 'peer6.org2.example.com';
export const peerNameOrg2Peer7 = 'peer7.org2.example.com';


export async function newGrpcConnection(
    tlsCertPath: string,
    peerEndpoint: string,
    peerName: string
): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerName,
    });
}

export async function newIdentity(
    certPath: string,
    mspId: string
): Promise<Identity> {
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

export async function newSigner(keyDirectoryPath: string): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

export enum ContractType {
    DEVICES,
    PACKETS
}

export class PeerContract {
    devicesContract: Contract
    packetsContract: Contract
}

export class OrgsContracts {
    org1: PeerContract[]
    org2: PeerContract[]
    private counterOrg1: number
    private counterOrg2: number
    
    constructor() {
        this.org1 = []
        this.org2 = []
        this.counterOrg1 = 0            
        this.counterOrg2 = 0
    }

    public addPeerContract(org: 1 | 2, peerContract: PeerContract): void {
        if (org == 1) {
            this.org1.push(peerContract)
        } else {
            this.org2.push(peerContract)
        }
    }
    
    public getNextPeerContract(org : 1 | 2, type: ContractType): Contract {
        let to_return: Contract = null
        let c = 0
        if (org == 1) {
            c = this.counterOrg1
            if(type == ContractType.DEVICES) {
                to_return = this.org1[this.counterOrg1].devicesContract
                this.counterOrg1 = (this.counterOrg1 + 1) % this.org1.length
            } else {
                to_return = this.org1[this.counterOrg1].packetsContract
                this.counterOrg1 = (this.counterOrg1 + 1) % this.org1.length
            }
        } else {
            c = this.counterOrg2
            if(type == ContractType.DEVICES) {
                to_return = this.org2[this.counterOrg2].devicesContract
                this.counterOrg2 = (this.counterOrg2 + 1) % this.org2.length
            } else {
                to_return = this.org2[this.counterOrg2].packetsContract
                this.counterOrg2 = (this.counterOrg2 + 1) % this.org2.length
            }
        }
        console.log(`Using peer${c}.org${org}.example.com`)
        return to_return
    }
}


async function getContracts(tlsCertPath: string, peerEndpoint: string, peerName: string, certPathUser: string, mspId: string, keyDirectoryUserPath: string, channelName: string, chaincodeName: string): Promise<PeerContract> {
    const clientOrg = await newGrpcConnection(
        tlsCertPath,
        peerEndpoint,
        peerName
    );

    const gatewayOrg = connect({
        client: clientOrg,
        identity: await newIdentity(certPathUser, mspId),
        signer: await newSigner(keyDirectoryUserPath),
    });

    // Build a network instance based on the channel where the smart contract is deployed
    const network = gatewayOrg.getNetwork(channelName);

    // Get the contract from the network.
    return {
        devicesContract: network.getContract(chaincodeName, 'LoRaWANDevices'),
        packetsContract: network.getContract(chaincodeName, 'LoRaWANPackets')
    }
}

async function getNetwork(tlsCertPath: string, peerEndpoint: string, peerName: string, certPathUser: string, mspId: string, keyDirectoryUserPath: string, channelName: string, chaincodeName: string): Promise<Network> {
    const clientOrg = await newGrpcConnection(
        tlsCertPath,
        peerEndpoint,
        peerName
    );

    const gatewayOrg = connect({
        client: clientOrg,
        identity: await newIdentity(certPathUser, mspId),
        signer: await newSigner(keyDirectoryUserPath),
    });

    // Build a network instance based on the channel where the smart contract is deployed
    return gatewayOrg.getNetwork(channelName);
}

export async function get16peer2orgsContracts(): Promise<OrgsContracts> {
    const mspIdOrg1 = 'Org1MSP';
    const mspIdOrg2 = 'Org2MSP';

    const channelName = 'lorawan';
    const chaincodeName = 'lorawan-chaincode';

    // Path to org1 user private key directory.
    const keyDirectoryPathOrg1User1 = path.resolve(
        cryptoPathOrg1_16Peers,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    );

// Path to org1 user certificate.
    const certPathOrg1User1 = path.resolve(
        cryptoPathOrg1_16Peers,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts',
        'cert.pem'
    );

// Path to org1 peer tls certificate.
    const tlsCertPathOrg1Peer0 = path.resolve(
        cryptoPathOrg1_16Peers,
        'peers',
        'peer0.org1.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg1Peer1 = path.resolve(
        cryptoPathOrg1_16Peers,
        'peers',
        'peer1.org1.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg1Peer2 = path.resolve(
        cryptoPathOrg1_16Peers,
        'peers',
        'peer2.org1.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg1Peer3 = path.resolve(
        cryptoPathOrg1_16Peers,
        'peers',
        'peer3.org1.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg1Peer4 = path.resolve(
        cryptoPathOrg1_16Peers,
        'peers',
        'peer4.org1.example.com',
        'tls',
        'ca.crt'
    );
    
    const tlsCertPathOrg1Peer5 = path.resolve(
        cryptoPathOrg1_16Peers,
        'peers',
        'peer5.org1.example.com',
        'tls',
        'ca.crt'
    );
    const tlsCertPathOrg1Peer6 = path.resolve(
        cryptoPathOrg1_16Peers,
        'peers',
        'peer6.org1.example.com',
        'tls',
        'ca.crt'
    );
    const tlsCertPathOrg1Peer7 = path.resolve(
        cryptoPathOrg1_16Peers,
        'peers',
        'peer7.org1.example.com',
        'tls',
        'ca.crt'
    );


// Path to org2 user private key directory.
    const keyDirectoryPathOrg2User1 = path.resolve(
        cryptoPathOrg2_16Peers,
        'users',
        'User1@org2.example.com',
        'msp',
        'keystore'
    );

// Path to org2 user certificate.
    const certPathOrg2User1 = path.resolve(
        cryptoPathOrg2_16Peers,
        'users',
        'User1@org2.example.com',
        'msp',
        'signcerts',
        'cert.pem'
    );

// Path to org2 peer tls certificate.
    const tlsCertPathOrg2Peer0 = path.resolve(
        cryptoPathOrg2_16Peers,
        'peers',
        'peer0.org2.example.com',
        'tls',
        'ca.crt'
    );
    
    const tlsCertPathOrg2Peer1 = path.resolve(
        cryptoPathOrg2_16Peers,
        'peers',
        'peer1.org2.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg2Peer2 = path.resolve(
        cryptoPathOrg2_16Peers,
        'peers',
        'peer2.org2.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg2Peer3 = path.resolve(
        cryptoPathOrg2_16Peers,
        'peers',
        'peer3.org2.example.com',
        'tls',
        'ca.crt'
    );
    
    const tlsCertPathOrg2Peer4 = path.resolve(
        cryptoPathOrg2_16Peers,
        'peers',
        'peer4.org2.example.com',
        'tls',
        'ca.crt'
    );
    
    const tlsCertPathOrg2Peer5 = path.resolve(
        cryptoPathOrg2_16Peers,
        'peers',
        'peer5.org2.example.com',
        'tls',
        'ca.crt'
    );
    
    const tlsCertPathOrg2Peer6 = path.resolve(
        cryptoPathOrg2_16Peers,
        'peers',
        'peer6.org2.example.com',
        'tls',
        'ca.crt'
    );
    
    const tlsCertPathOrg2Peer7 = path.resolve(
        cryptoPathOrg2_16Peers,
        'peers',
        'peer7.org2.example.com',
        'tls',
        'ca.crt'
    );

    
    let contracts = new OrgsContracts()

    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer0, peerEndpointOrg1Peer0, peerNameOrg1Peer0, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer1, peerEndpointOrg1Peer1, peerNameOrg1Peer1, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer2, peerEndpointOrg1Peer2, peerNameOrg1Peer2, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer3, peerEndpointOrg1Peer3, peerNameOrg1Peer3, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer4, peerEndpointOrg1Peer4, peerNameOrg1Peer4, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer5, peerEndpointOrg1Peer5, peerNameOrg1Peer5, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer6, peerEndpointOrg1Peer6, peerNameOrg1Peer6, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer7, peerEndpointOrg1Peer7, peerNameOrg1Peer7, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer0, peerEndpointOrg2Peer0, peerNameOrg2Peer0, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer1, peerEndpointOrg2Peer1, peerNameOrg2Peer1, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer2, peerEndpointOrg2Peer2, peerNameOrg2Peer2, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer3, peerEndpointOrg2Peer3, peerNameOrg2Peer3, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer4, peerEndpointOrg2Peer4, peerNameOrg2Peer4, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer5, peerEndpointOrg2Peer5, peerNameOrg2Peer5, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer6, peerEndpointOrg2Peer6, peerNameOrg2Peer6, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer7, peerEndpointOrg2Peer7, peerNameOrg2Peer7, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    
    return contracts
}

export async function get8peer2orgsContracts(): Promise<OrgsContracts> {
    const mspIdOrg1 = 'Org1MSP';
    const mspIdOrg2 = 'Org2MSP';

    const channelName = 'lorawan';
    const chaincodeName = 'lorawan-chaincode';

    // Path to org1 user private key directory.
    const keyDirectoryPathOrg1User1 = path.resolve(
        cryptoPathOrg1_8Peers,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    );

// Path to org1 user certificate.
    const certPathOrg1User1 = path.resolve(
        cryptoPathOrg1_8Peers,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts',
        'cert.pem'
    );

// Path to org1 peer tls certificate.
    const tlsCertPathOrg1Peer0 = path.resolve(
        cryptoPathOrg1_8Peers,
        'peers',
        'peer0.org1.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg1Peer1 = path.resolve(
        cryptoPathOrg1_8Peers,
        'peers',
        'peer1.org1.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg1Peer2 = path.resolve(
        cryptoPathOrg1_8Peers,
        'peers',
        'peer2.org1.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg1Peer3 = path.resolve(
        cryptoPathOrg1_8Peers,
        'peers',
        'peer3.org1.example.com',
        'tls',
        'ca.crt'
    );


// Path to org2 user private key directory.
    const keyDirectoryPathOrg2User1 = path.resolve(
        cryptoPathOrg2_8Peers,
        'users',
        'User1@org2.example.com',
        'msp',
        'keystore'
    );

// Path to org2 user certificate.
    const certPathOrg2User1 = path.resolve(
        cryptoPathOrg2_8Peers,
        'users',
        'User1@org2.example.com',
        'msp',
        'signcerts',
        'cert.pem'
    );

// Path to org2 peer tls certificate.
    const tlsCertPathOrg2Peer0 = path.resolve(
        cryptoPathOrg2_8Peers,
        'peers',
        'peer0.org2.example.com',
        'tls',
        'ca.crt'
    );
    
    const tlsCertPathOrg2Peer1 = path.resolve(
        cryptoPathOrg2_8Peers,
        'peers',
        'peer1.org2.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg2Peer2 = path.resolve(
        cryptoPathOrg2_8Peers,
        'peers',
        'peer2.org2.example.com',
        'tls',
        'ca.crt'
    );

    const tlsCertPathOrg2Peer3 = path.resolve(
        cryptoPathOrg2_8Peers,
        'peers',
        'peer3.org2.example.com',
        'tls',
        'ca.crt'
    );

    
    let contracts = new OrgsContracts()

    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer0, peerEndpointOrg1Peer0, peerNameOrg1Peer0, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer1, peerEndpointOrg1Peer1, peerNameOrg1Peer1, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer2, peerEndpointOrg1Peer2, peerNameOrg1Peer2, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer3, peerEndpointOrg1Peer3, peerNameOrg1Peer3, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer0, peerEndpointOrg2Peer0, peerNameOrg2Peer0, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer1, peerEndpointOrg2Peer1, peerNameOrg2Peer1, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer2, peerEndpointOrg2Peer2, peerNameOrg2Peer2, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer3, peerEndpointOrg2Peer3, peerNameOrg2Peer3, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    
    return contracts
}

export async function get2peer2orgsContracts(): Promise<OrgsContracts> {
    const mspIdOrg1 = 'Org1MSP';
    const mspIdOrg2 = 'Org2MSP';

    const channelName = 'lorawan';
    const chaincodeName = 'lorawan-chaincode';

    // Path to org1 user private key directory.
    const keyDirectoryPathOrg1User1 = path.resolve(
        cryptoPathOrg1_2Peers,
        'users',
        'User1@org1.example.com',
        'msp',
        'keystore'
    );

// Path to org1 user certificate.
    const certPathOrg1User1 = path.resolve(
        cryptoPathOrg1_2Peers,
        'users',
        'User1@org1.example.com',
        'msp',
        'signcerts',
        'cert.pem'
    );

// Path to org1 peer tls certificate.
    const tlsCertPathOrg1Peer0 = path.resolve(
        cryptoPathOrg1_2Peers,
        'peers',
        'peer0.org1.example.com',
        'tls',
        'ca.crt'
    );


// Path to org2 user private key directory.
    const keyDirectoryPathOrg2User1 = path.resolve(
        cryptoPathOrg2_2Peers,
        'users',
        'User1@org2.example.com',
        'msp',
        'keystore'
    );

// Path to org2 user certificate.
    const certPathOrg2User1 = path.resolve(
        cryptoPathOrg2_2Peers,
        'users',
        'User1@org2.example.com',
        'msp',
        'signcerts',
        'cert.pem'
    );

// Path to org2 peer tls certificate.
    const tlsCertPathOrg2Peer0 = path.resolve(
        cryptoPathOrg2_2Peers,
        'peers',
        'peer0.org2.example.com',
        'tls',
        'ca.crt'
    );

    let contracts = new OrgsContracts()
    contracts.addPeerContract(1, await getContracts(tlsCertPathOrg1Peer0, peerEndpointOrg1Peer0, peerNameOrg1Peer0, certPathOrg1User1, mspIdOrg1, keyDirectoryPathOrg1User1, channelName, chaincodeName))
    contracts.addPeerContract(2, await getContracts(tlsCertPathOrg2Peer0, peerEndpointOrg2Peer0, peerNameOrg2Peer0, certPathOrg2User1, mspIdOrg2, keyDirectoryPathOrg2User1, channelName, chaincodeName))
    return contracts
}