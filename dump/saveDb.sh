#!/bin/bash
# One-shot manual dump — run this to create/refresh the archive immediately.
# Usage: bash saveDb.sh

DUMP_DIR="/home/ubuntu/cost/cost/dump"

mongodump -d node-cost -o "$DUMP_DIR"
tar -czf "$DUMP_DIR/archive.tar.gz" -C "$DUMP_DIR" node-cost
echo "Done: $DUMP_DIR/archive.tar.gz"
