#!/usr/bin/env bash

nc=""
PEER_PER_ORG=16
ORG_NUM=0
ORDERER_NUM=16
JSON_FILE_PATH="./addresses_local.json"
RANDOM_HOST_FILENAME="hosts_file_$RANDOM.txt"

if [ $# -lt 2 ]; then
    echo "Missing args, usage: $0 PEER_PER_ORG ORG_NUM [-nc]"
    exit
else
    PEER_PER_ORG=$1
    ORG_NUM=$2
    shift; shift;
fi

for var in "$@"; do
    if [[ "--network-controller" == "${var}" || "-nc" == "${var}" ]]; then
        echo "Building preloader release binary..."
        current_wd=$(pwd)
        cd ../../DeLoRaN/preloader/
        cargo b --release
        cd $current_wd
        nc="-nc"
    fi
done


#addresses=$(jq '.addresses' $JSON_FILE_PATH)
#total_addresses=$(echo $addresses | jq 'length')
#num_peer_addresses=$((ORG_NUM*PEER_PER_ORG))
#
#PEER_ADDRESSES=$(echo $addresses | jq -c '.[0:'$((num_peer_addresses-1))']'| jq -r '.[].address' | tr '\n' ' ')
#DEVICE_ADDRESSES=$(echo $addresses | jq -c '.['$num_peer_addresses':'$((total_addresses-1))']' | jq -r '.[].address' | tr '\n' ' ')
#ORDERER_ADDRESS=$(echo $addresses | jq -c '.['$((total_addresses-1))']' | jq -r '.address' | tr '\n' ' ')

readarray -t addresses < <(jq -r '.addresses[].address' $JSON_FILE_PATH)
LEN=${#addresses[@]}
PEER_ADDRESSES=("${addresses[@]:0:$((LEN-1))}")
ORDERER_ADDRESS="${addresses[-1]}"

# Print the extracted values
echo "PEER_PER_ORG=$PEER_PER_ORG"
echo "ORG_NUM=$ORG_NUM"
echo "PEER_ADDRESSES=(${PEER_ADDRESSES[*]})"
echo "DEVICE_ADDRESSES=(${DEVICE_ADDRESSES[*]})"
echo "ORDERER_ADDRESS=${ORDERER_ADDRESS}"
echo "ORDERER_NUM=${ORDERER_NUM}"


uploadToPeer() {
    PEER_ADDR=$1
    PEER_ID=$2
    PEER_ORG_ID=$3

    if [ $# -lt 3 ]; then
        echo "Missing args, usage: $0 username@ip_addr peer_id peer_org_id"
        exit
    else
        shift; shift; shift;
    fi

    echo "peer${PEER_ID}.org${PEER_ORG_ID} - ${PEER_ADDR} ${PEER_ID} ${PEER_ORG_ID}"

    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/bin -e                                                                                                             ssh $PEER_ADDR:/opt/fabric/
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/builders/ccaas/bin -e                                                                                              ssh $PEER_ADDR:/opt/fabric/
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/builders/ -e                                                                                                       ssh $PEER_ADDR:/opt/fabric/
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/config -e                                                                                                          ssh $PEER_ADDR:/opt/fabric/
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/crypto-config/peerOrganizations/org${PEER_ORG_ID}.dlwan.phd/peers/peer${PEER_ID}.org${PEER_ORG_ID}.dlwan.phd/ -e   ssh $PEER_ADDR:/opt/fabric/crypto/peer/
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/mini_scripts -e                                                                                                    ssh $PEER_ADDR:/root/
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/channel-artifacts -e                                                                                               ssh $PEER_ADDR:/root/
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/chaincode-external -e                                                                                              ssh $PEER_ADDR:/root/
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/crypto-config/ordererOrganizations/orderers.dlwan.phd/tlsca/tlsca.orderers.dlwan.phd-cert.pem -e                   ssh $PEER_ADDR:/opt/fabric/crypto/orderer-ca.crt
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/temp_folder/$RANDOM_HOST_FILENAME -e                                                                               ssh $PEER_ADDR:/etc/hosts

    ### TODO DA RIMUOVERE ###
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/crypto-config/peerOrganizations/org${PEER_ORG_ID}.dlwan.phd/users/Admin@org${PEER_ORG_ID}.dlwan.phd/ -e            ssh $PEER_ADDR:/opt/fabric/crypto/admin-certs
    ###     #########     ###

    RANDOM_SOURCE_PEER_FILENAME="source_peer_$RANDOM.sh"

    echo >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
    echo "export PEER_ID=${PEER_ID}" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
    echo "export PEER_ORG_ID=${PEER_ORG_ID}" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
    echo "export PEER_PER_ORG=${PEER_PER_ORG}" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
    echo "export ORG_NUM=${ORG_NUM}" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME

    cat ./source_peer.sh >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME

    echo >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME

    for var in "$@"; do
        if [[ "--network-controller" == "${var}" || "-nc" == "${var}" ]]; then
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../../DeLoRaN/ -e                                                     ssh $PEER_ADDR:/root/distributed-network-controller
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../DeLoRaN/preloader/*.json -e                                     ssh $PEER_ADDR:/opt/network-controller/config/
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../DeLoRaN/preloader/src/sdr-lora-merged.py -e                     ssh $PEER_ADDR:/opt/network-controller/config/lora.py
            #rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../DeLoRaN/preloader/target/release/preloader              -e      ssh $PEER_ADDR:/opt/network-controller/bin/
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../application_and_chaincode/chaincode-ts-lorawan/ -e      ssh $PEER_ADDR:/root/chaincode
        fi

        if [[ "--admin" == "${var}" ]]; then
            rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/crypto-config/peerOrganizations/org${PEER_ORG_ID}.dlwan.phd/users/Admin@org${PEER_ORG_ID}.dlwan.phd/ -e 'ssh -q' $PEER_ADDR:/opt/fabric/crypto/admin-certs
            echo "export ADMIN_PEER_MSPCONFIGPATH=/opt/fabric/crypto/admin-certs/msp" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
            echo "export ADMIN=\"true\"" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
        fi
        if [[ "--device" == "${var}" ]]; then
            rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/crypto-config/peerOrganizations/org${PEER_ORG_ID}.dlwan.phd/users/Admin@org${PEER_ORG_ID}.dlwan.phd/ -e 'ssh -q' $PEER_ADDR:/opt/fabric/crypto/admin-certs
            echo "export ADMIN_PEER_MSPCONFIGPATH=/opt/fabric/crypto/admin-certs/msp" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
            echo "export DEVICE=\"true\"" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
        fi
        if [[ "--all" == "${var}" ]]; then
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../../DeLoRaN/ -e                                                     ssh $PEER_ADDR:/root/distributed-network-controller
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../DeLoRaN/preloader/*.json -e                                     ssh $PEER_ADDR:/opt/network-controller/config/
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../DeLoRaN/preloader/src/sdr-lora-merged.py -e                     ssh $PEER_ADDR:/opt/network-controller/config/lora.py
            #rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../DeLoRaN/preloader/target/release/preloader              -e      ssh $PEER_ADDR:/opt/network-controller/bin/
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../application_and_chaincode/chaincode-ts-lorawan/ -e      ssh $PEER_ADDR:/root/chaincode
    
            rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/crypto-config/peerOrganizations/org${PEER_ORG_ID}.dlwan.phd/users/Admin@org${PEER_ORG_ID}.dlwan.phd/ -e 'ssh -q' $PEER_ADDR:/opt/fabric/crypto/admin-certs
            echo "export ADMIN_PEER_MSPCONFIGPATH=/opt/fabric/crypto/admin-certs/msp" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
            echo "export ADMIN=\"true\"" >> ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
        fi
    done

    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/temp_folder/$RANDOM_SOURCE_PEER_FILENAME -e 'ssh -q' $PEER_ADDR:/root/mini_scripts/source_peer.sh
    rm ./temp_folder/$RANDOM_SOURCE_PEER_FILENAME
}


uploadToDevice() {
    PEER_ADDR=$1

    echo "Device ${PEER_ADDR}"
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/mini_scripts/vivado_commands.sh -e 'ssh -q' $PEER_ADDR:/root/vivado_commands.sh
    rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../../DeLoRaN/ -e 'ssh -q' $PEER_ADDR:/root/distributed-network-controller
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/temp_folder/$RANDOM_HOST_FILENAME -e 'ssh -q' root@${ORDERER_ADDRESS}:/etc/hosts

}

#convert_to_ip() {
#    id=$(echo $1 | cut -d'-' -f2)
#    last_part=$((10#$id + 100))
#    ip_address="172.18.2.$last_part"
#    echo $ip_address
#}

uploadToOrderer() {
    if [[ -n "${ORDERER_ADDRESS}" ]]; then
        echo "uploading to orderers at $ORDERER_ADDRESS"
        rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/test-network* --exclude=**/useless_scripts --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD} -e 'ssh -q' root@${ORDERER_ADDRESS}:/root
        rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/temp_folder/$RANDOM_HOST_FILENAME -e 'ssh -q' root@${ORDERER_ADDRESS}:/etc/hosts
        rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/mini_scripts/network_monitor.sh -e 'ssh -q' root@${ORDERER_ADDRESS}:/root/network_monitor.sh
    fi
}


uploadAll() {
    uploadToOrderer
    
    for (( i=0; i < PEER_PER_ORG; i++)); do
        for (( j=0; j < ORG_NUM; j++)); do
            admin=$(if [[ i -eq 0 ]]; then echo "--all"; else echo ""; fi)
            #id="peer${i}.org$((${j}+1)).dlwan.phd"
            ip=${PEER_ADDRESSES[$((${i} * ${ORG_NUM} + ${j}))]}
            uploadToPeer "root@${ip}" ${i} $((${j} + 1)) ${admin} -nc #${nc}
        done
    done

    len=${#DEVICE_ADDRESSES[@]}
    for (( i=0; i < len; i++)); do
        ip=${DEVICE_ADDRESSES[i]}
        uploadToDevice "root@${ip}"
    done
}

#uploadAll $(lxc list -c n,4 -f csv | awk '{print $1}' | awk -F ',' '{ print $2}')3

createHostsFile() {
    cat ./hosts_file_base.txt  >> ./temp_folder/$RANDOM_HOST_FILENAME

    if [ $PEER_PER_ORG -eq 0 ]; then
        echo "## WARNING!! ## PEER_PER_ORG is 0"
    fi
    if [ $ORG_NUM -eq 0 ]; then
        echo "## WARNING!! ## ORG_NUM is 0"
    fi
    if [ $ORDERER_NUM -eq 0 ]; then
        echo "## WARNING!! ## ORDERER_NUM is 0"
    fi
    if [ ! -n "${ORDERER_ADDRESS}" ]; then
        echo "## WARNING!! ## ORDERER_ADDRESS is empty"
    fi

    for (( i=0; i < PEER_PER_ORG; i++)); do
        for (( j=0; j < ORG_NUM; j++)); do
            ip=${PEER_ADDRESSES[$((${i} * ${ORG_NUM} + ${j}))]}
            id="peer${i}.org$((${j}+1)).dlwan.phd"
            echo "$ip $id" >> ./temp_folder/$RANDOM_HOST_FILENAME
        done
    done

    if [[ -n "${ORDERER_ADDRESS}" ]]; then
        ip=${ORDERER_ADDRESS}
        for (( i=1; i <= ORDERER_NUM; i++)); do
            echo "$ip orderer$i.orderers.dlwan.phd" >> ./temp_folder/$RANDOM_HOST_FILENAME
        done
    fi

}

cleanTempData() {
    rm ./temp_folder/$RANDOM_HOST_FILENAME
}

echo "Uploading files to nodes..."
createHostsFile
uploadAll
cleanTempData
