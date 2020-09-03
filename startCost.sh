today=$(date +"%m_%d_%Y")
node server.js > "log/$today.txt" 2> "log/$today.err" &