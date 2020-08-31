while (true) do
    mongodump -d node-cost -o .
    tar -cvzf /var/www/dump/archive.tar.gz /var/www/dump/node-cost
    sleep 86400
done