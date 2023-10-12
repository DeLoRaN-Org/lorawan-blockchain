
# Introduction

These are the steps to launch a simulation using colosseum as the channel emulator.
There are two main entities, devices and network controllers.
The fist step is the same for both, since it just uploads the needed file into the containers.

## Step 1 - Upload to containers

This step is the only one to be performed on your computer, from Step 2 everything is supposed to be run inside the containers after logging in with `ssh`.

Before uploading files to the containers you may run `./generate_artifacts` (you **MUST** do it if you change the structure of the organizations) which creates all the crypto materials based on the **crypto-config.yaml** file.

The script **upload_into_container.sh** is used to upload all the files in the container.

Change the variables **PEER_PER_ORG**, **ORG_NUM**, **PEER_ADDRESSES** and **DEVICE_ADDRESSES** accordingly with the simulation.
Remember that the ip addresses list should be ordered such that the first **PEER_PER_ORG** ip addresses are the peer0 of each organization, the next **PEER_PER_ORG** are the peer1 peers of each organization and so on.

example:
```bash
PEER_PER_ORG=2
ORG_NUM=3
PEER_ADDRESSES=("wineslab-037" "wineslab-041" "wineslab-043" "wineslab-039" "wineslab-042" "wineslab-051")
DEVICE_ADDRESSES=("wineslab-081" "wineslab-082" "wineslab-083" "wineslab-084" "wineslab-085" "wineslab-086")


# There ip addresses are mapped like this:
# wineslab-037 -> peer0.org1.dlwan.phd
# wineslab-041 -> peer0.org2.dlwan.phd
# wineslab-043 -> peer0.org3.dlwan.phd
# wineslab-039 -> peer1.org1.dlwan.phd
# wineslab-042 -> peer1.org2.dlwan.phd
# wineslab-051 -> peer1.org3.dlwan.phd
```
The peer0 of each organization will be the anchor peer (known peer) and the admin peer for each organization.

Change also the variable **ORDERER_ADDRESS** to the address of the container chosen to host all the orderers (4 by default). Files will be uploaded accordingly.

> [!IMPORTANT]
> Always remember to change the content of the **hosts_file.txt** which will be uploaded and used to route the communications between the peers (no automatic DNS update yet).

# **network controllers** (+ **blockchain**).

## Step 2 - Create nodes and launch the blockchain
Once everythings is uploaded to the containers it is time to create the network.

### Orderers
`cd` into **pure_network** directory and run `./create_orderers.sh --join`, you should see one json printed with status code 200 per orderer.

### Peers
The following steps can be performed on all the nodes at the same time, but it is suggested to do one organization at a time:

- Go into the mini_scripts directory and launch the `./peer_start.sh` script in the containers at the same time (or normal peers first and then the admin). 
- Check that in each peer everything is good: all the peers should have 2 screens (check with `screen -r`), peer and chaincode, and should not write tons of errors there. (`screen -r ${NAME}` attach you to the terminal that launched the command so you can see the output)

> [!WARNING]
> Sometimes the peer executable tries to connect to the wrong orderer first which causes a long loop of errors. Eventually it finds the right one but the best solution is to stop and restart the peer process.


## Step 3 - Configure the scenario (ID 13250):

![Scenario Image](https://github.com/rastafaninplakeibol/lorawan-blockchain/blob/network-without-containers/pure_network/scenario_13250.png?raw=true)

To configure the radio<->node couple in the scenario, use the script `scenario_creator.js`. It will ask for 18 radios ID. Leave empty values for unused nodes and write the numeric ID of the SRN for the node you want to use. 

> [!NOTE]
> The image in `scenario_13250.png` represents the configuration of the network in this scenario. The nodes ID starts at 0, but `scenario_creator.js` will output a file where the node IDs start at 1, as expected by colosseum.

## Step 4 - Creating the devices on the blockchain

Before running the devices, you must create them on the blockchain. By executing the **fake_device** package (`cd /path/to/distributed-network-controller/fake_device/ && cargo r`), it creates by default 12 devices configured with crypto material got from **/root/distributed-network-controller/simulation/devices.csv** (change the value in `main.rs` to change the number of devices created). This command will populate the **fake_device/configs** folder with N json files named **{dev_eui}_config.json**, containing the respective configurations, a file called **create_commands.json**, contining the commands to create the devices to be used programmatically, and will also print these commands on the screen ready to be copypasted and run into the containers acting as a network controller.

Example of the command:
`peer chaincode invoke -o orderer1.orderers.dlwan.phd:6050 -C lorawan -n lorawan -c  '{"Args":["CreateDeviceConfig","{\"class\":\"A\",\"version\":\"V1_0_4\",\"region\":\"EU863_870\",\"activation_mode\":\"OTAA\",\"dev_nonce\":0,\"dev_eui\":[17,4,159,210,98,90,200,119],\"join_eui\":[46,143,203,164,37,39,43,182],\"nwk_key\":[155,244,173,188,170,107,125,19,24,136,52,131,54,191,179,45],\"app_key\":[155,244,173,188,170,107,125,19,24,136,52,131,54,191,179,45],\"js_int_key\":[182,217,6,182,186,11,155,154,114,68,211,246,220,45,186,71],\"js_enc_key\":[91,139,130,10,42,2,203,214,131,127,160,110,208,96,148,104],\"rj_count1\":0,\"join_nonce\":0,\"last_join_request_received\":\"JoinRequest\",\"dev_addr\":null,\"owner\":\"owner\"}"]}' --tls --cafile /opt/fabric/crypto/orderer-ca.crt --waitForEvent`

> [!IMPORTANT]
> Remember to run this command as a peer of orgX if you want the device to be owned by orgX. Rn you cannot move the ownership of the device.

## Step 5 - Run the preloader

The preloader is the main executable which implements all the roles: device, network controller and application server (useless rn).

First of all you need to flash the radio image. To do this you have to run `vivado_commands.sh` which can be found in `/root/mini_scripts/` in network controller containers, while it is in `/root/` in a device container.

Then you need to `cd` into the **/root/distributed-network-controller/preloader** directory and run `cargo r --release -- -c path/to/config_file.json -p src/sdr-lora-merged.py`

`config_file.json` defines the role of the node and it is structured like this:
```json

{
    "device": {    /* Configuration for the device */
      "configuration": {
        "class": "A",
        "version": "V1_0_3",
        "activation_mode": "OTAA",
        "dev_nonce": 0,
        "dev_eui": [ /* bytes */ ],
        "join_eui": [ /* bytes */ ],
        "nwk_key": [ /* bytes */ ],
        "app_key": [ /* bytes */ ],
        "join_context": {
          "js_int_key": [ /* bytes */ ],
          "js_enc_key": [ /* bytes */ ],
          "rj_count1": 0,
          "join_nonce": 0
        },
        "last_join_request_received": "JoinRequest",
        "regional_params": null
      },
      "dtype": {  /* WARNING: 2 types, TCP or COLOSSEUM configuration for the device, cannot have BOTH*/
        "TCP": {
          "addr": "peer1.org1.dlwan.phd",
          "port": 9090
        },
        "COLOSSEUM": {
            "radio_config": {
                "region": "EU863_870",
                "spreading_factor": 7,
                "data_rate": 5,
                "rx_gain": 10,
                "tx_gain": 20,
                "bandwidth": 125000,
                "rx_freq": 990000000,
                "tx_freq": 1010000000,
                "sample_rate": 1000000,
                "rx_chan_id": 0,
                "tx_chan_id": 1,
                "dev_id": 10
            },
            "address": "192.168.40.2"
        }
      }
    },
    "network_controller": { /* Configuration for the network controller, unlike the device it can have all 3 configurations at the same time */
      "n_id": "ns_test_1",
      "tcp_config": {
        "tcp_dev_port": 9090,
        "tcp_nc_port": 9091  /* To contact other network controller, useless rn */
      },
      "radio_config": {
        "region": "EU863_870",
        "spreading_factor": 7,
        "data_rate": 5,
        "rx_gain": 10,
        "tx_gain": 20,
        "bandwidth": 125000,
        "rx_freq": 990000000,
        "tx_freq": 1010000000,
        "sample_rate": 1000000,
        "rx_chan_id": 0,
        "tx_chan_id": 1,
        "dev_id": 1001
      },
      "colosseum_config": {
        "radio_config": {
          "region": "EU863_870",
          "spreading_factor": 7,
          "data_rate": 5,
          "rx_gain": 10,
          "tx_gain": 20,
          "bandwidth": 125000,
          "rx_freq": 990000000,
          "tx_freq": 1010000000,
          "sample_rate": 1000000,
          "rx_chan_id": 0,
          "tx_chan_id": 1,
          "dev_id": 1001
        },
        "address": "192.168.40.2"
      }
    },
    "application_server": { /* Configuration for the application server */
      "tcp_receive_port": 5050
    }
  }
```
Only one between "device", "network_controller" and "application_server" should be specified within the same file, otherwise the first one will be used, so remember to setup the config file accordingly.

## Clean the containers

In case you want to restart the simulation, if something goes wrong or you just want to start a new simulation without shutdown and upload everything again, you just need to stop every process running on the nodes (the peers, the chaincodes, the preloaders and the 4 orderers) and then run:

### Orderers
`rm -r /root/pure_network/data`

### Network Controllers
`rm -r /opt/fabric/data`




# Devices

Since the cose was uploaded during Step 1, you just need to upload the specific configuration for every given container acting as a device (for how to create them look for previous Step 4) and then follow the instructions in Step 5 to run the application.

> [!IMPORTANT]
> Devices do not store data anywhere, so the session is not persistent. If you start and stop a device remember to update the `dev_nonce` field in the device configuration by incrementing by one its value or the join request will be rejected.