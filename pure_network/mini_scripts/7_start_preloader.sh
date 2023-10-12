cd /root/distributed-network-controller/preloader
screen -S "preloader" -d -m cargo r -- -c $1 -p $2
cd /root/