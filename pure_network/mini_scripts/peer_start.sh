#!/usr/bin/env bash
#
# SPDX-License-Identifier: Apache-2.0
#

#for var in "$@"
#do
#    if [[ "--admin" -eq "${var}" || "-a" -eq "${var}"  ]]; then
#        export CORE_PEER_MSPCONFIGPATH=/opt/fabric/crypto/admin-certs/msp
#    fi
#    if [[ "--join" -eq "${var}"    || "-j" -eq "${var}" ]]; then
#        export JOIN="true"
#    fi
#    if [[ "--install" -eq "${var}" || "-i" -eq "${var}"  ]]; then
#        export INSTALL="true"
#    fi
#    if [[ "--approve" -eq "${var}" || "-a" -eq "${var}"  ]]; then
#        export APPROVE="true"
#    fi
#    if [[ "--all" -eq "${var}" ]]; then
#        export CORE_PEER_MSPCONFIGPATH=/opt/fabric/crypto/admin-certs/msp
#        export JOIN="true"
#        export INSTALL="true"
#        export APPROVE="true"
#    fi
#done

#is_network_controller() {
#    cat /root/network-controller/distributed-network-controller/preloader/config.json | jq -ec .network_controller
#    return $?
#}


#set -eu
source ./source_peer.sh

#./vivado_commands.sh
#screen -S "network" -d -m ./network_monitor.sh
#screen -S "monitor" -d -m ./cpu_mem_usage.sh

#route add default gw $(ip addr show can0 | grep -w inet | awk '{print $2}' | awk -F '/' '{print $1}' | sed 's/\.[0-9]*$/\.1/')
#echo 'nameserver 10.100.11.53' >> /etc/resolv.conf
#echo 'nameserver 10.100.11.54' >> /etc/resolv.conf
#echo 'nameserver 10.100.11.55' >> /etc/resolv.conf

if [[ -z ${DEVICE} ]]; then #network controller
    # START PEER.
    ./1_start_peer.sh
    sleep 3
    ./2_join_channel.sh
    sleep 3
    source ./3_set_chaincode_id.sh

    if [[ -n ${ADMIN} ]]; then
        sleep 3
        # Install Chaincode on all peer of the organization.
        for (( i=0; i < PEER_PER_ORG; i++)); do
            CORE_PEER_MSPCONFIGPATH="$ADMIN_PEER_MSPCONFIGPATH" ./4_install_chaincode_on_peer.sh $i
            echo "Installed" | nc -q 1 peer${i}.org${PEER_ORG_ID}.dlwan.phd 12345 | echo  #ignore errors
        done

        random_peer_id=$((1 + $RANDOM % ($PEER_PER_ORG - 1)))
        CORE_PEER_MSPCONFIGPATH="$ADMIN_PEER_MSPCONFIGPATH" ./5_approve_and_commit.sh 1 #$random_peer_id
    else
        echo "Waiting for chaincode to be installed..."
        nc -l -p 12345
        echo "Chaincode received!"
    fi

    ./6_start_chaincode_server.sh
    #./7_start_preloader.sh nc_config_colosseum.json src/sdr-lora-merged.py
else
    for (( i=0; i < 30; i++)); do
        if [ "$((i % 10))" -eq 0 ]; then
            echo "Waiting $((30 - i))s..."
        fi
        sleep 1
    done
    #./7_start_preloader.sh device_colosseum_config.json src/sdr-lora-merged.py
fi

#cd /root/network-controller/distributed-network-controller/preloader
#cargo b --release
#screen -S "preloader" -d -m cargo r --release
#cd /root/preloader