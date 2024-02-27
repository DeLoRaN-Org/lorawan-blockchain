#!/bin/bash
# This script monitors CPU and memory usage


timestamp=$(date +%s)
path="/root/cpu_mem_usage_$timestamp.csv"
echo "Cpu%,Mem" >> $path

while true
do  
    # Get the current usage of CPU and memory
    read -r line < /proc/stat

    # Split the line into an array
    IFS=' ' read -ra cpu_stats <<< "$line"

    # Calculate the sum of the first   7 fields (user, nice, system, idle, iowait, irq, softirq)
    prev_total_time=$((${cpu_stats[1]} + ${cpu_stats[2]} + ${cpu_stats[3]} + ${cpu_stats[4]} + ${cpu_stats[5]} + ${cpu_stats[6]} + ${cpu_stats[7]}))
    prev_idle_time=${cpu_stats[4]}

    # Wait for   1 second
    sleep   1

    # Read the CPU stats again
    read -r line < /proc/stat
    IFS=' ' read -ra cpu_stats <<< "$line"

    # Calculate the sum of the first   7 fields again
    total_time=$((${cpu_stats[1]} + ${cpu_stats[2]} + ${cpu_stats[3]} + ${cpu_stats[4]} + ${cpu_stats[5]} + ${cpu_stats[6]} + ${cpu_stats[7]}))
    current_idle_time=${cpu_stats[4]}

    # Calculate the difference between the two sums
    total_time_diff=$((total_time - prev_total_time))

    # Calculate the idle time difference
    idle_time_diff=$((${current_idle_time} - ${prev_idle_time}))

    # Calculate the CPU utilization percentage
    cpu_usage_percentage=$(awk "BEGIN {printf \"%.2f\", (1 - $idle_time_diff / $total_time_diff) *  100}")
    cpu_usage_percentage=$(echo "$cpu_usage_percentage" | tr ',' '.')

    #Memory Usage
    memUsage=$(free -m | awk '/Mem/{print $3 - $5}')

    # Print the usage
    #echo "CPU Usage: $sum%"
    #echo "Memory Usage: $memUsage MB"
    echo "$cpu_usage_percentage,$memUsage" >> $path
    sleep  1
done
