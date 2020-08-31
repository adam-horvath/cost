#!/bin/bash
while (true) do
    numberOfNodeJobs=`ps -aux | grep node | wc -l` 
    if [ "$numberOfNodeJobs" -ne 2 ] 
    then
	./startCost.sh
    fi
    sleep 300
done
