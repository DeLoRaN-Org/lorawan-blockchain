cd /root/chaincode && npm i
rm -r dist/
tsc
screen -S "chaincode" -d -m npm run start:server-nontls
cd /root/