#!/usr/bin/env sh
#
# SPDX-License-Identifier: Apache-2.0
#

# look for binaries in local dev environment /build/bin directory and then in local samples /bin directory
export PATH="${PWD}"/bin:"$PATH"

. peer1admin.sh

peer lifecycle chaincode package lorawan.tar.gz --path /root/network-controller/hyperledger/lorawan-blockchain/application_and_chaincode/chaincode-ts-lorawan --lang node --label lorawan
peer lifecycle chaincode install lorawan.tar.gz 

# Set the CHAINCODE_ID from the created chaincode package
CHAINCODE_ID=$(peer lifecycle chaincode calculatepackageid basic.tar.gz)
export CHAINCODE_ID

# Approve the chaincode using Peer1Admin
peer lifecycle chaincode approveformyorg -o 127.0.0.1:6050 --channelID mychannel --name basic --version 1 --package-id "${CHAINCODE_ID}" --sequence 1 --tls --cafile "${PWD}"/crypto-config/ordererOrganizations/dlwan.phd/orderers/orderer.dlwan.phd/tls/ca.crt >> ./logs/install\&approve\&commit_chaincode_peer_1.log 2>&1
peer lifecycle chaincode commit -o 127.0.0.1:6050 --channelID mychannel --name basic --version 1 --sequence 1 --tls --cafile "${PWD}"/crypto-config/ordererOrganizations/dlwan.phd/orderers/orderer.dlwan.phd/tls/ca.crt >> ./logs/install\&approve\&commit_chaincode_peer_1.log 2>&1
