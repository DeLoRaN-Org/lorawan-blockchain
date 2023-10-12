#!/usr/bin/env bash

nc=""
PEER_PER_ORG=0
ORG_NUM=0
#JSON_FILE_PATH="/home/thecave3/Downloads/reservation_138024.json"
JSON_FILE_PATH=""

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

    rsync -q --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../../distributed-network-controller/ -e                                                     ssh $PEER_ADDR:/root/distributed-network-controller
    #rsync -q --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../distributed-network-controller/preloader/*.json -e                                     ssh $PEER_ADDR:/opt/network-controller/config/
    #rsync -q --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../distributed-network-controller/preloader/src/sdr-lora-merged.py -e                     ssh $PEER_ADDR:/opt/network-controller/config/lora.py
    #rsync -q --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf                     ../../distributed-network-controller/preloader/target/release/preloader              -e      ssh $PEER_ADDR:/opt/network-controller/bin/
    #rsync -q --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../application_and_chaincode/chaincode-ts-lorawan/ -e      ssh $PEER_ADDR:/root/chaincode
}


uploadToDevice() {
    PEER_ADDR=$1
    echo "Device ${PEER_ADDR}"

    rsync -q --mkpath -av --exclude=**/.git --exclude=**/node_modules --exclude=**/target --exclude=**/*.pdf ${PWD}/mini_scripts/vivado_commands.sh -e 'ssh -q' $PEER_ADDR:/root/vivado_commands.sh
    rsync -q --mkpath -av --exclude=**/test-network* --exclude=**/.git --exclude=**/node_modules --exclude=**/*.pdf --exclude=**/target ../../distributed-network-controller/ -e 'ssh -q' $PEER_ADDR:/root/distributed-network-controller
}

convert_to_ip() {
    id=$(echo $1 | cut -d'-' -f2)
    last_part=$((10#$id + 100))
    ip_address="172.18.2.$last_part"
    echo $ip_address
}


uploadAll() {
    for (( i=0; i < PEER_PER_ORG; i++)); do
        for (( j=0; j < ORG_NUM; j++)); do
            admin=$(if [[ i -eq 0 ]]; then echo "--all"; else echo ""; fi)
            #id="peer${i}.org$((${j}+1)).dlwan.phd"
            ip=${PEER_ADDRESSES[$((${i} * ${ORG_NUM} + ${j}))]}
            uploadToPeer "root@${ip}" ${i} $((${j} + 1)) ${admin} ${nc}
        done
    done

    len=${#DEVICE_ADDRESSES[@]}
    for (( i=0; i < len; i++)); do
        ip=${DEVICE_ADDRESSES[i]}
        uploadToDevice "root@${ip}"
    done
}

#uploadAll $(lxc list -c n,4 -f csv | awk '{print $1}' | awk -F ',' '{ print $2}')3

echo "Uploading files to nodes..."
uploadAll