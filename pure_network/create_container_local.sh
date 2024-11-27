
for i in $(seq -w 2 16)
do
  lxc launch dlwan nc$i --profile raspberry2
done

lxc launch orderer dlwan