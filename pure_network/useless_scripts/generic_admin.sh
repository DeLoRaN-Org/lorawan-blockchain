#!/usr/bin/env sh
#
# SPDX-License-Identifier: Apache-2.0
#
set -eu

#   ARGOMENTI:
#       ID_PEER
#       ORG
#       MAIN PORT
#   ex: ./generic_peer.sh 1 1 7051 -> peer1.org1.dlwan.org:7051

CCADDR="127.0.0.1" #chaincode addr, rimarrà localhost

t_id=$1
t_org=$2
t_port=$3

ID=${t_id:=0}
ORG=${t_org:=1}
PORT=${t_org:=7051}

#export PATH="${PWD}"/../../fabric/build/bin:"${PWD}"/../bin:"$PATH"
export PATH=/opt/fabric/bin:"$PATH"

#export FABRIC_CFG_PATH="${PWD}"/../config
export FABRIC_CFG_PATH=/opt/fabric/config


#export FABRIC_LOGGING_SPEC=debug:cauthdsl,policies,msp,grpc,peer.gossip.mcs,gossip,leveldbhelper=info
export FABRIC_LOGGING_SPEC=debug:cauthdsl,policies,msp,grpc,peer.gossip.mcs,gossip,leveldbhelper=info

#export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_ENABLED=true

#export CORE_PEER_TLS_CERT_FILE="${PWD}"/crypto-config/peerOrganizations/org1.dlwan.phd/peers/peer0.org1.dlwan.phd/tls/server.crt
export CORE_PEER_TLS_CERT_FILE=/opt/fabric/crypto/tls/server.crt

#export CORE_PEER_TLS_KEY_FILE="${PWD}"/crypto-config/peerOrganizations/org1.dlwan.phd/peers/peer0.org1.dlwan.phd/tls/server.key
export CORE_PEER_TLS_KEY_FILE=/opt/fabric/crypto/tls/server.key

#export CORE_PEER_TLS_ROOTCERT_FILE="${PWD}"/crypto-config/peerOrganizations/org1.dlwan.phd/peers/peer0.org1.dlwan.phd/tls/ca.crt
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/fabric/crypto/tls/ca.crt


#export CORE_PEER_ID=peer0.org1.dlwan.phd
export CORE_PEER_ID=peer${ID}.org${ORG}.dlwan.phd

#export CORE_PEER_ADDRESS=127.0.0.1:7051
export CORE_PEER_ADDRESS=127.0.0.1:$PORT

#export CORE_PEER_LISTENADDRESS=127.0.0.1:7051
export CORE_PEER_LISTENADDRESS=127.0.0.1:$PORT

#export CORE_PEER_CHAINCODEADDRESS="${CCADDR}":7052
export CORE_PEER_CHAINCODEADDRESS="${CCADDR}":7052

#export CORE_PEER_CHAINCODELISTENADDRESS=127.0.0.1:7052
export CORE_PEER_CHAINCODELISTENADDRESS=127.0.0.1:7052

#export CORE_PEER_GOSSIP_BOOTSTRAP=127.0.0.1:7053
export CORE_PEER_GOSSIP_BOOTSTRAP=127.0.0.1:7053

#export CORE_PEER_GOSSIP_EXTERNALENDPOINT=127.0.0.1:7051
export CORE_PEER_GOSSIP_EXTERNALENDPOINT=127.0.0.1:$PORT

#export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_LOCALMSPID=Org${ORG}MSP

#export CORE_PEER_MSPCONFIGPATH="${PWD}"/crypto-config/peerOrganizations/org1.dlwan.phd/peers/peer0.org1.dlwan.phd/msp
export CORE_PEER_MSPCONFIGPATH=/opt/fabric/crypto/msp

#export CORE_OPERATIONS_LISTENADDRESS=127.0.0.1:8446
export CORE_OPERATIONS_LISTENADDRESS=127.0.0.1:8446

#export CORE_PEER_FILESYSTEMPATH="${PWD}"/data/peer0.org1.dlwan.phd
export CORE_PEER_FILESYSTEMPATH="${PWD}"/data/peer${ID}.org${ORG}.dlwan.phd

#export CORE_LEDGER_SNAPSHOTS_ROOTDIR="${PWD}"/data/peer0.org1.dlwan.phd/snapshots
export CORE_LEDGER_SNAPSHOTS_ROOTDIR="${PWD}"/data/peer${ID}.org${ORG}.dlwan.phd/snapshots

# start peer
screen -d -m peer node start

# Install Chaincode on Peer1
peer lifecycle chaincode package lorawan.tar.gz --path /root/network-controller/hyperledger/lorawan-blockchain/application_and_chaincode/chaincode-ts-lorawan --lang ts --label lorawan
peer lifecycle chaincode install lorawan.tar.gz 

# Set the CHAINCODE_ID from the created chaincode package
export CHAINCODE_ID=$(peer lifecycle chaincode calculatepackageid basic.tar.gz)
export CHAINCODE_SERVER_ADDRESS=127.0.0.1:3000

screen -d -m "cd /root/network-controller/hyperledger/lorawan-blockchain/application_and_chaincode/chaincode-ts-lorawan && npm i && npm run start:server-nontls"


