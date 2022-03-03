kill `ps aux | grep node | sed -e 's/  \+/\t/g' | cut -f2 | head -n 1`
./startCost.sh
