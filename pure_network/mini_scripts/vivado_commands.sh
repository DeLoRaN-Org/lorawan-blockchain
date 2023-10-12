original_dir=$(pwd)

cd ~/vivado_colosseum
source setupenv.sh
viv_jtag_program /usr/share/uhd/images/usrp_x310_fpga_HG.bit

cd "$original_dir"