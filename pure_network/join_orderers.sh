#!/usr/bin/env bash

set -eu

export PATH="${PWD}"/../../fabric/build/bin:"${PWD}"/../bin:"$PATH"
export FABRIC_CFG_PATH="${PWD}"/config
export ORDERER_CONSENSUS_TYPE="etcdraft"

#if [ $# -gt 0 ]
#then
#    if [ "$1" != "BFT" ] && [ "$1" != "etcdraft" ]
#    then
#        echo "Unsupported input consensus type ${1}"
#        exit 1
#    fi
#    if [ "$1" = "BFT" ]
#    then
#      ORDERER_CONSENSUS_TYPE="BFT"
#    fi
#fi


if [[ -z "$1" ]]; then
    echo "Error: No argument supplied for number of orderers."
    exit 1
fi

NUM_ORDERERS=$1 # the number of orderers to create

for ((i=1;i<=NUM_ORDERERS;i++))
do
    osnadmin channel join --channelID lorawan --config-block ./channel-artifacts/lorawan.block -o orderer$i.orderers.dlwan.phd:$((9442 + $i))
done

#osnadmin channel join --channelID lorawan --config-block ./channel-artifacts/lorawan.block -o orderer1.orderers.dlwan.phd:9443
#osnadmin channel join --channelID lorawan --config-block ./channel-artifacts/lorawan.block -o orderer2.orderers.dlwan.phd:9444
#osnadmin channel join --channelID lorawan --config-block ./channel-artifacts/lorawan.block -o orderer3.orderers.dlwan.phd:9445
#osnadmin channel join --channelID lorawan --config-block ./channel-artifacts/lorawan.block -o orderer4.orderers.dlwan.phd:9446

#if [ "$ORDERER_CONSENSUS_TYPE" = "BFT" ]; then
#  osnadmin channel join --channelID mychannel --config-block ./channel-artifacts/mychannel.block -o 10.17.119.1:9446
#fi
