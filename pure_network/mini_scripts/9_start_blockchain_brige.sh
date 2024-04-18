cd /root/server_chaincode
rm -r dist/
if [ -d "node_modules" ]; then
    echo "node_modules exists."
else
    npm i
fi
tsc
screen -S "blockchain_bridge" -d -m npm run run_server
cd /root/