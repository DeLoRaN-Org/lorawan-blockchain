
TARGET_PEER_ID=$1

sleep $(($PEER_ORG_ID * 10)) # To avoid concurrent modification with other orgs, ORG0 goes first, then ORG1, then ORG2 etc...

peer lifecycle chaincode approveformyorg -o orderer1.orderers.dlwan.phd:6050 --channelID lorawan --name lorawan --version 1 --package-id $CHAINCODE_ID --sequence 1 --tls --cafile /opt/fabric/crypto/orderer-ca.crt --collections-config /opt/fabric/config/collections_config.json --signature-policy "OR ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer')" --peerAddresses peer${TARGET_PEER_ID}.org${PEER_ORG_ID}.dlwan.phd:7051 --tlsRootCertFiles /opt/fabric/crypto/peer/msp/tlscacerts/tlsca.org${PEER_ORG_ID}.dlwan.phd-cert.pem


if (($PEER_ORG_ID == 1 && $PEER_ID == 0)); then
    peer lifecycle chaincode commit -o orderer1.orderers.dlwan.phd:6050 --channelID lorawan --name lorawan --version 1 --sequence 1 --tls --cafile /opt/fabric/crypto/orderer-ca.crt --collections-config /opt/fabric/config/collections_config.json --signature-policy "OR ('Org1MSP.peer','Org2MSP.peer','Org3MSP.peer')" --peerAddresses peer${TARGET_PEER_ID}.org${PEER_ORG_ID}.dlwan.phd:7051 --tlsRootCertFiles /opt/fabric/crypto/peer/msp/tlscacerts/tlsca.org${PEER_ORG_ID}.dlwan.phd-cert.pem
fi
