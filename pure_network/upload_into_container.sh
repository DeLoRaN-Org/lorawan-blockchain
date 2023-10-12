#!/usr/bin/env bash

nc=""
PEER_PER_ORG=0
ORG_NUM=0
#JSON_FILE_PATH="/home/thecave3/Downloads/reservation_138024.json"
JSON_FILE_PATH=""
RANDOM_HOST_FILENAME="hosts_file_$RANDOM.txt"

if [ $# -lt 3 ]; then
    echo "Missing args, usage: $0 PEER_PER_ORG ORG_NUM RESERVATION_PATH [-nc]"
    exit
else
    PEER_PER_ORG=$1
    ORG_NUM=$2
    JSON_FILE_PATH=$3
    shift; shift; shift;
fi

for var in "$@"; do
    if [[ "--network-controller" == "${var}" || "-nc" == "${var}" ]]; then
        echo "Building preloader release binary..."
        current_wd=$(pwd)
        cd ../../distributed-network-controller/preloader/
        cargo b --release
        cd $current_wd
        nc="-nc"
    fi
done

# Read team name from JSON
TEAM_NAME=$(jq -r '.team_name' "$JSON_FILE_PATH")

# Extract srn_ids and create addresses
SRN_IDS=($(jq -r '.nodes[].srn_id' "$JSON_FILE_PATH"))
ADDRESS_PREFIX="${TEAM_NAME}-"
ADDRESS_SUFFIX=""

# Create addresses array
for srn_id in "${SRN_IDS[@]}"; do
    # Ensure the address suffix is three digits long
    ADDRESS_SUFFIX=$(printf "%03d" "$srn_id")
    ADDRESS="${ADDRESS_PREFIX}${ADDRESS_SUFFIX}"
    ADDRESSES+=("$ADDRESS")
done

# Distribute addresses to PEER_ADDRESSES, DEVICE_ADDRESSES, and ORDERER_ADDRESS
PEER_ADDRESSES=()
DEVICE_ADDRESSES=()
ORDERER_ADDRESS=()

for ((i = 0; i < ${#ADDRESSES[@]}; i++)); do
    if [ "$i" -lt "$((PEER_PER_ORG * ORG_NUM))" ]; then
        PEER_ADDRESSES+=("${ADDRESSES[i]}")
    elif [ "$i" -lt "$((${#ADDRESSES[@]} - 1))" ]; then
        DEVICE_ADDRESSES+=("${ADDRESSES[i]}")
    else
        ORDERER_ADDRESS+=("${ADDRESSES[i]}")
    fi
done

# Print the extracted values
echo "PEER_PER_ORG=$PEER_PER_ORG"
echo "ORG_NUM=$ORG_NUM"
echo "PEER_ADDRESSES=(${PEER_ADDRESSES[*]})"
echo "DEVICE_ADDRESSES=(${DEVICE_ADDRESSES[*]})"
echo "ORDERER_ADDRESS=(${ORDERER_ADDRESS[*]})"

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
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../../distributed-network-controller/ -e                                                     ssh $PEER_ADDR:/root/distributed-network-controller
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../distributed-network-controller/preloader/*.json -e                                     ssh $PEER_ADDR:/opt/network-controller/config/
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../distributed-network-controller/preloader/src/sdr-lora-merged.py -e                     ssh $PEER_ADDR:/opt/network-controller/config/lora.py
            #rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../distributed-network-controller/preloader/target/release/preloader              -e      ssh $PEER_ADDR:/opt/network-controller/bin/
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
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../../distributed-network-controller/ -e                                                     ssh $PEER_ADDR:/root/distributed-network-controller
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../distributed-network-controller/preloader/*.json -e                                     ssh $PEER_ADDR:/opt/network-controller/config/
            rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../distributed-network-controller/preloader/src/sdr-lora-merged.py -e                     ssh $PEER_ADDR:/opt/network-controller/config/lora.py
            #rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../distributed-network-controller/preloader/target/release/preloader              -e      ssh $PEER_ADDR:/opt/network-controller/bin/
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
    rsync -q -u --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../../distributed-network-controller/ -e 'ssh -q' $PEER_ADDR:/root/distributed-network-controller
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/temp_folder/$RANDOM_HOST_FILENAME -e 'ssh -q' root@${ORDERER_ADDRESS}:/etc/hosts

}

convert_to_ip() {
    id=$(echo $1 | cut -d'-' -f2)
    last_part=$((10#$id + 100))
    ip_address="172.18.2.$last_part"
    echo $ip_address
}

uploadToOrderer() {
    echo "uploading to orderers at $ORDERER_ADDRESS"
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/test-network* --exclude=**/useless_scripts --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD} -e 'ssh -q' root@${ORDERER_ADDRESS}:/root
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/temp_folder/$RANDOM_HOST_FILENAME -e 'ssh -q' root@${ORDERER_ADDRESS}:/etc/hosts
    rsync -q -u --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/mini_scripts/network_monitor.sh -e 'ssh -q' root@${ORDERER_ADDRESS}:/root/network_monitor.sh
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
    for (( i=0; i < PEER_PER_ORG; i++)); do
        for (( j=0; j < ORG_NUM; j++)); do
            ip=$(convert_to_ip "${PEER_ADDRESSES[$((${i} * ${ORG_NUM} + ${j}))]}")
            id="peer${i}.org$((${j}+1)).dlwan.phd"
            echo "$ip $id" >> ./temp_folder/$RANDOM_HOST_FILENAME
        done
    done

    ip=$(convert_to_ip "${ORDERER_ADDRESS}")

    for (( i=1; i <= 16; i++)); do
        echo "$ip orderer$i.orderers.dlwan.phd" >> ./temp_folder/$RANDOM_HOST_FILENAME
    done
}

cleanTempData() {
    rm ./temp_folder/$RANDOM_HOST_FILENAME
}

echo "Uploading files to nodes..."
createHostsFile
uploadAll
cleanTempData