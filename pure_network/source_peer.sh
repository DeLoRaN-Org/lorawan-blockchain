export PEER_IP_ADDRESS=$(hostname -I | awk '{print $1}')

export CCADDR="127.0.0.1" #chaincode addr, rimarrà localhost
export PATH=/opt/network-controller/bin:/opt/fabric/bin:/opt/fabric/builders/ccaas:"$PATH"
export FABRIC_CFG_PATH=/opt/fabric/config


export FABRIC_LOGGING_SPEC=debug:cauthdsl,policies,msp,grpc,peer.gossip.mcs,gossip,leveldbhelper=info
export FABRIC_LOGGING_FORMAT=json
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_TLS_CERT_FILE=/opt/fabric/crypto/peer/tls/server.crt
export CORE_PEER_TLS_KEY_FILE=/opt/fabric/crypto/peer/tls/server.key
export CORE_PEER_TLS_ROOTCERT_FILE=/opt/fabric/crypto/peer/tls/ca.crt

export CORE_PEER_ID=peer${PEER_ID}.org${PEER_ORG_ID}.dlwan.phd
export CORE_PEER_ADDRESS=$CORE_PEER_ID:7051
export CORE_PEER_LISTENADDRESS=0.0.0.0:7051
export CORE_PEER_CHAINCODEADDRESS="${CCADDR}":7052
export CORE_PEER_CHAINCODELISTENADDRESS=0.0.0.0:7052
export CORE_PEER_GOSSIP_EXTERNALENDPOINT=$CORE_PEER_ID:7051

#un altro peer della stessa organizzazione, per ora ho lo commento
#export CORE_PEER_GOSSIP_BOOTSTRAP=$OTHER_CORE_PEER_ID:7053

export CORE_PEER_LOCALMSPID=Org${PEER_ORG_ID}MSP
export CORE_PEER_MSPCONFIGPATH=/opt/fabric/crypto/peer/msp
export CORE_OPERATIONS_LISTENADDRESS=$CORE_PEER_ID:8446
export CORE_PEER_FILESYSTEMPATH=/opt/fabric/data/peer${PEER_ID}.org${PEER_ORG_ID}.dlwan.phd
export CORE_LEDGER_SNAPSHOTS_ROOTDIR=/opt/fabric/data/peer${PEER_ID}.org${PEER_ORG_ID}.dlwan.phd/snapshots

export CHAINCODE_SERVER_ADDRESS=127.0.0.1:9999

##### CUSTOM CONFIGURATION #####
