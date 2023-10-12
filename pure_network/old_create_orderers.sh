#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#
set -eu

# look for binaries in local dev environment /build/bin directory and then in local samples /bin directory
export PATH="${PWD}"/bin:"$PATH"
export FABRIC_CFG_PATH="${PWD}"/config

#ORDERER 1

export FABRIC_LOGGING_SPEC=debug:cauthdsl,policies,msp,common.configtx,common.channelconfig=info
export ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
export ORDERER_GENERAL_LISTENPORT=6050
export ORDERER_GENERAL_LOCALMSPID=OrdererMSP
export ORDERER_GENERAL_TLS_ENABLED=true
export ORDERER_GENERAL_BOOTSTRAPMETHOD=none
export ORDERER_CHANNELPARTICIPATION_ENABLED=true

export ORDERER_GENERAL_LOCALMSPDIR="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer1.orderers.dlwan.phd/msp
export ORDERER_GENERAL_TLS_ROOTCAS="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer1.orderers.dlwan.phd/tls/ca.crt
export ORDERER_GENERAL_TLS_PRIVATEKEY="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer1.orderers.dlwan.phd/tls/server.key
export ORDERER_GENERAL_TLS_CERTIFICATE="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer1.orderers.dlwan.phd/tls/server.crt
export ORDERER_FILELEDGER_LOCATION="${PWD}"/data/orderer
if [ $# -gt 0 ]
then
    if [ "$1" == "BFT" ] || [ "$1" == "etcdraft" ]
    then
        export ORDERER_CONSENSUS_TYPE=${1}
    fi
fi
export ORDERER_CONSENSUS_WALDIR="${PWD}"/data/orderer/consensus/wal
export ORDERER_CONSENSUS_SNAPDIR="${PWD}"/data/orderer/consensus/snap
export ORDERER_OPERATIONS_LISTENADDRESS=orderer1.orderers.dlwan.phd:8443
export ORDERER_ADMIN_LISTENADDRESS=orderer1.orderers.dlwan.phd:9443

# start orderer
screen -S "orderer1" -d -m "orderer"

#ORDERER 2

export ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
export ORDERER_GENERAL_LISTENPORT=6051
export ORDERER_GENERAL_LOCALMSPDIR="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer2.orderers.dlwan.phd/msp
export ORDERER_GENERAL_TLS_PRIVATEKEY="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer2.orderers.dlwan.phd/tls/server.key
export ORDERER_GENERAL_TLS_CERTIFICATE="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer2.orderers.dlwan.phd/tls/server.crt
# following setting is not really needed at runtime since channel config has ca root certs, but we need to override the default in orderer.yaml
export ORDERER_GENERAL_TLS_ROOTCAS="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer2.orderers.dlwan.phd/tls/ca.crt
export ORDERER_FILELEDGER_LOCATION="${PWD}"/data/orderer2

export ORDERER_CONSENSUS_WALDIR="${PWD}"/data/orderer2/consensus/wal
export ORDERER_CONSENSUS_SNAPDIR="${PWD}"/data/orderer2/consensus/snap
export ORDERER_OPERATIONS_LISTENADDRESS=orderer2.orderers.dlwan.phd:8444
export ORDERER_ADMIN_LISTENADDRESS=orderer2.orderers.dlwan.phd:9444

# start orderer
screen -S "orderer2" -d -m "orderer"

#ORDERER 3

export ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
export ORDERER_GENERAL_LISTENPORT=6052
export ORDERER_GENERAL_LOCALMSPDIR="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer3.orderers.dlwan.phd/msp
export ORDERER_GENERAL_TLS_PRIVATEKEY="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer3.orderers.dlwan.phd/tls/server.key
export ORDERER_GENERAL_TLS_CERTIFICATE="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer3.orderers.dlwan.phd/tls/server.crt
# following setting is not really needed at runtime since channel config has ca root certs, but we need to override the default in orderer.yaml
export ORDERER_GENERAL_TLS_ROOTCAS="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer3.orderers.dlwan.phd/tls/ca.crt
export ORDERER_FILELEDGER_LOCATION="${PWD}"/data/orderer3

export ORDERER_CONSENSUS_WALDIR="${PWD}"/data/orderer3/consensus/wal
export ORDERER_CONSENSUS_SNAPDIR="${PWD}"/data/orderer3/consensus/snap
export ORDERER_OPERATIONS_LISTENADDRESS=orderer3.orderers.dlwan.phd:8445
export ORDERER_ADMIN_LISTENADDRESS=orderer3.orderers.dlwan.phd:9445

# start orderer
screen -S "orderer3" -d -m "orderer"
#ORDERER 4

export ORDERER_GENERAL_LISTENADDRESS=0.0.0.0
export ORDERER_GENERAL_LISTENPORT=6053
export ORDERER_GENERAL_LOCALMSPDIR="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer4.orderers.dlwan.phd/msp
export ORDERER_GENERAL_TLS_PRIVATEKEY="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer4.orderers.dlwan.phd/tls/server.key
export ORDERER_GENERAL_TLS_CERTIFICATE="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer4.orderers.dlwan.phd/tls/server.crt
# following setting is not really needed at runtime since channel config has ca root certs, but we need to override the default in orderer.yaml
export ORDERER_GENERAL_TLS_ROOTCAS="${PWD}"/crypto-config/ordererOrganizations/orderers.dlwan.phd/orderers/orderer4.orderers.dlwan.phd/tls/ca.crt
export ORDERER_FILELEDGER_LOCATION="${PWD}"/data/orderer4

export ORDERER_CONSENSUS_WALDIR="${PWD}"/data/orderer4/consensus/wal
export ORDERER_CONSENSUS_SNAPDIR="${PWD}"/data/orderer4/consensus/snap
export ORDERER_OPERATIONS_LISTENADDRESS=orderer4.orderers.dlwan.phd:8450
export ORDERER_ADMIN_LISTENADDRESS=orderer4.orderers.dlwan.phd:9446

# start orderer
screen -S "orderer4" -d -m "orderer"

sleep 4

if [[ ($# == 1 && "$1" == "--join") || ($# == 2 && "$2" == "--join") ]]; then
    echo "Joining orderers"
    "${PWD}"/join_orderers.sh
fi
