#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#

# This is a collection of bash functions used by different scripts

# imports
. scripts/utils.sh

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem
export PEER0_ORG2_CA=${PWD}/organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem
export PEER0_ORG3_CA=${PWD}/organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem
export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.crt
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/tls/server.key


setGlobalsWithAdminKeys() {
    echo "org $1 peer $2"
  local USING_ORG=$1
  local USING_PEER=$2
  #if [ -z "$OVERRIDE_ORG" ]; then
  #  USING_ORG=$1
  #  USING_PEER=$2
  #else
  #  USING_ORG="${OVERRIDE_ORG}"
  #fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    if [ $USING_PEER -eq 0 ]; then
      export CORE_PEER_ADDRESS=localhost:7051
    elif [ $USING_PEER -eq 1 ]; then
      export CORE_PEER_ADDRESS=localhost:7053
    elif [ $USING_PEER -eq 2 ]; then
      export CORE_PEER_ADDRESS=localhost:7055
    elif [ $USING_PEER -eq 3 ]; then
      export CORE_PEER_ADDRESS=localhost:7057
    elif [ $USING_PEER -eq 4 ]; then
      export CORE_PEER_ADDRESS=localhost:7059
    elif [ $USING_PEER -eq 5 ]; then
      export CORE_PEER_ADDRESS=localhost:7061
    elif [ $USING_PEER -eq 6 ]; then
      export CORE_PEER_ADDRESS=localhost:7063
    elif [ $USING_PEER -eq 7 ]; then
      export CORE_PEER_ADDRESS=localhost:7065
    fi
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    if [ $USING_PEER -eq 0 ]; then
      export CORE_PEER_ADDRESS=localhost:9051
    elif [ $USING_PEER -eq 1 ]; then
      export CORE_PEER_ADDRESS=localhost:9053
    elif [ $USING_PEER -eq 2 ]; then
      export CORE_PEER_ADDRESS=localhost:9055
    elif [ $USING_PEER -eq 3 ]; then
      export CORE_PEER_ADDRESS=localhost:9057
    elif [ $USING_PEER -eq 4 ]; then
      export CORE_PEER_ADDRESS=localhost:9059
    elif [ $USING_PEER -eq 5 ]; then
      export CORE_PEER_ADDRESS=localhost:9061
    elif [ $USING_PEER -eq 6 ]; then
      export CORE_PEER_ADDRESS=localhost:9063
    elif [ $USING_PEER -eq 7 ]; then
      export CORE_PEER_ADDRESS=localhost:9065
    fi
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_LOCALMSPID="Org3MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}


# Set environment variables for the peer org
setGlobals() {
  echo "org $1 peer $2"
  local USING_ORG=$1
  local USING_PEER=$2
  #if [ -z "$OVERRIDE_ORG" ]; then
  #  USING_ORG=$1
  #  USING_PEER=$2
  #else
  #  USING_ORG="${OVERRIDE_ORG}"
  #fi
  infoln "Using organization ${USING_ORG}"
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    if [ $USING_PEER -eq 0 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
      export CORE_PEER_ADDRESS=localhost:7051
    elif [ $USING_PEER -eq 1 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/msp
      export CORE_PEER_ADDRESS=localhost:7053
    elif [ $USING_PEER -eq 2 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer2.org1.example.com/msp
      export CORE_PEER_ADDRESS=localhost:7055
    elif [ $USING_PEER -eq 3 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer3.org1.example.com/msp
      export CORE_PEER_ADDRESS=localhost:7057
    elif [ $USING_PEER -eq 4 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer4.org1.example.com/msp
      export CORE_PEER_ADDRESS=localhost:7059
    elif [ $USING_PEER -eq 5 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer5.org1.example.com/msp
      export CORE_PEER_ADDRESS=localhost:7061
    elif [ $USING_PEER -eq 6 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer6.org1.example.com/msp
      export CORE_PEER_ADDRESS=localhost:7063
    elif [ $USING_PEER -eq 7 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer7.org1.example.com/msp
      export CORE_PEER_ADDRESS=localhost:7065
    fi
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    #export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    #export CORE_PEER_ADDRESS=localhost:9051
    if [ $USING_PEER -eq 0 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
      export CORE_PEER_ADDRESS=localhost:9051
    elif [ $USING_PEER -eq 1 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer1.org2.example.com/msp
      export CORE_PEER_ADDRESS=localhost:9053
    elif [ $USING_PEER -eq 2 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer2.org2.example.com/msp
      export CORE_PEER_ADDRESS=localhost:9055
    elif [ $USING_PEER -eq 3 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer3.org2.example.com/msp
      export CORE_PEER_ADDRESS=localhost:9057
    elif [ $USING_PEER -eq 4 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer4.org2.example.com/msp
      export CORE_PEER_ADDRESS=localhost:9059
    elif [ $USING_PEER -eq 5 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer5.org2.example.com/msp
      export CORE_PEER_ADDRESS=localhost:9061
    elif [ $USING_PEER -eq 6 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer6.org2.example.com/msp
      export CORE_PEER_ADDRESS=localhost:9063
    elif [ $USING_PEER -eq 7 ]; then
      export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer7.org2.example.com/msp
      export CORE_PEER_ADDRESS=localhost:9065
    fi
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_LOCALMSPID="Org3MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}


# Set environment variables for use in the CLI container
setGlobalsCLI() {
  setGlobals $1 0

  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_ADDRESS=peer0.org2.example.com:9051
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_ADDRESS=peer0.org3.example.com:11051
  else
    errorln "ORG Unknown"
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1 0
    PEER="peer0.org$1"
    ## Set peer addresses
    if [ -z "$PEERS" ]
    then
	PEERS="$PEER"
    else
	PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    CA=PEER0_ORG$1_CA
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
