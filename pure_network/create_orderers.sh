#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#
set -e

# look for binaries in local dev environment /build/bin directory and then in local samples /bin directory
export PATH="${PWD}"/bin:"$PATH"
export FABRIC_CFG_PATH="${PWD}"/config
export FABRIC_LOGGING_SPEC=debug:cauthdsl,policies,msp,common.configtx,common.channelconfig=info
export ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
export ORDERER_GENERAL_LOCALMSPID="OrdererMSP"
export ORDERER_GENERAL_TLS_ENABLED=true
export ORDERER_GENERAL_BOOTSTRAPMETHOD=none
export ORDERER_CHANNELPARTICIPATION_ENABLED=true

if [[ -z "$1" ]]; then
    echo "Error: No argument supplied for number of orderers."
    exit 1
fi

NUM_ORDERERS=$1 # the number of orderers to create

#if [ $# -gt 0 ]
#then
#    if [ "$1" == "BFT" ] || [ "$1" == "etcdraft" ]
#    then
#        export ORDERER_CONSENSUS_TYPE=${1}
#    fi
#fi

for ((i=1;i<=NUM_ORDERERS;i++))
do
    export ORDERER_GENERAL_LISTENPORT=$((6049 + $i))
    export ORDERER_GENERAL_LOCALMSPDIR="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer$i.orderers.dlwan.phd/msp
    export ORDERER_GENERAL_TLS_ROOTCAS="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer$i.orderers.dlwan.phd/tls/ca.crt
    export ORDERER_GENERAL_TLS_PRIVATEKEY="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer$i.orderers.dlwan.phd/tls/server.key
    export ORDERER_GENERAL_TLS_CERTIFICATE="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer$i.orderers.dlwan.phd/tls/server.crt
    export ORDERER_FILELEDGER_LOCATION="${PWD}"/data/orderer$i
    export ORDERER_CONSENSUS_WALDIR="${PWD}"/data/orderer$i/consensus/wal
    export ORDERER_CONSENSUS_SNAPDIR="${PWD}"/data/orderer$i/consensus/snap
    export ORDERER_OPERATIONS_LISTENADDRESS=orderer$i.orderers.dlwan.phd:$((8442 + $i))
    export ORDERER_ADMIN_LISTENADDRESS=orderer$i.orderers.dlwan.phd:$((9442 + $i))

    screen -S "orderer"$i -d -m "orderer"
done

sleep 4

if [[ ($# == 2 && "$2" == "--join") ]]; then
    echo "Joining orderers"
    "${PWD}"/join_orderers.sh $NUM_ORDERERS
fi