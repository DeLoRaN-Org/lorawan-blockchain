#!/bin/bash

ping_target() {
    ping -c 1 "$1" | grep 'time=' | sed 's/.*time=\([0-9]*\.[0-9]*\).*/\1/'
}

timestamp=$(date +%s%3N)
network_file_name="/root/network_traffic_${timestamp}.csv"
ping_file_name="/root/ping_delays_${timestamp}.csv"

echo "tmst,rx,rx_packets,tx,tx_packets" >> "$network_file_name"

header="tmst"
for ((i=0; i<$PEER_PER_ORG; i++)); do
    header="$header,peer$i"
done
header="$header,orderers"
echo $header >> $ping_file_name

while true; do
    rx_tx=$(ip -s -j link show eth0 | jq '[.[0].stats64.rx.bytes,.[0].stats64.rx.packets, .[0].stats64.tx.bytes,.[0].stats64.tx.packets] | @csv' | sed 's/"//g')
    
    timestamp=$(date +%s%3N)
    echo "$timestamp,$rx_tx" >> "$network_file_name"

    line="$timestamp"
    for ((i=0; i<$PEER_PER_ORG; i++)); do
        if [ $i != $PEER_ID ]; then
            target="peer$i.org$PEER_ORG_ID.dlwan.phd"
            delay=$(ping_target $target)
            line="$line, $delay"
        else
            line="$line, 0"
        fi
    done
    
    delay=$(ping_target "orderer1.orderers.dlwan.phd")
    line="$line, $delay"

    # Write the line to the CSV file
    echo $line >> $ping_file_name
    sleep 5
done