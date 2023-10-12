#!/usr/bin/env sh
#
# SPDX-License-Identifier: Apache-2.0
#
set -eu

#num_peers=$1
#org=$2
#
#export PATH="${PWD}"/bin:"$PATH"
#export FABRIC_CFG_PATH="${PWD}"/config
#
#export FABRIC_LOGGING_SPEC=INFO
#export CORE_PEER_TLS_ENABLED=true
#export CORE_PEER_LOCALMSPID=Org${org}MSP
#
#
#for i in $(seq 1 10);
#do
#    export CORE_PEER_ADDRESS=127.0.0.1:7051
#    export CORE_PEER_TLS_ROOTCERT_FILE="${PWD}"/crypto-config/peerOrganizations/org${org}.dlwan.phd/peers/peer${i}.org${org}.dlwan.phd/tls/ca.crt
#    export CORE_PEER_MSPCONFIGPATH="${PWD}"/crypto-config/peerOrganizations/org${org}.dlwan.phd/users/Admin@org${org}.dlwan.phd/msp
#    
#done

peer channel join -b "${PWD}"/channel-artifacts/mychannel.block

# join peer to channel
#CORE_PEER_MSPCONFIGPATH=/root/admin-certs/msp

