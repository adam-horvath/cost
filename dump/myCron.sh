#!/bin/bash
# Weekly DB dump + email archive.
# Scheduled via crontab — do NOT run in a while loop.
# Add to crontab with: crontab -e
#   0 6 * * 1  /home/ubuntu/cost/cost/dump/myCron.sh >> /home/ubuntu/cost/cost/log/cron.txt 2>> /home/ubuntu/cost/cost/log/cron.err

set -euo pipefail

DUMP_DIR="/home/ubuntu/cost/cost/dump"
ARCHIVE="$DUMP_DIR/archive.tar.gz"
APP_DIR="/home/ubuntu/cost/cost"

echo "[$(date)] Starting DB dump..."

# Dump into a fixed absolute path so it works regardless of cwd
mongodump -d node-cost -o "$DUMP_DIR"

# Re-create the archive (overwrite previous)
tar -czf "$ARCHIVE" -C "$DUMP_DIR" node-cost

echo "[$(date)] Archive created at $ARCHIVE ($(du -sh "$ARCHIVE" | cut -f1))"

# Trigger the email via the app's archive endpoint.
# JWT_TOKEN must be a valid superadmin token — set it as an environment variable
# or replace the value below.
if [ -n "${ARCHIVE_JWT_TOKEN:-}" ]; then
    curl -sf -X GET "http://localhost:${PORT:-8080}/api/v1/archive" \
        -H "Authorization: JWT $ARCHIVE_JWT_TOKEN" \
        && echo "[$(date)] Email sent." \
        || echo "[$(date)] WARNING: email request failed."
else
    echo "[$(date)] WARNING: ARCHIVE_JWT_TOKEN not set, skipping email."
fi

echo "[$(date)] Starting DB dump..."

# Dump into a fixed absolute path so it works regardless of cwd
mongodump -d node-cost -o "$DUMP_DIR"

# Re-create the archive (overwrite previous)
tar -czf "$ARCHIVE" -C "$DUMP_DIR" node-cost

echo "[$(date)] Archive created at $ARCHIVE ($(du -sh "$ARCHIVE" | cut -f1))"

# Trigger the email via the app's archive endpoint.
# JWT_TOKEN must be a valid superadmin token — set it as an environment variable
# or replace the value below.
if [ -n "${ARCHIVE_JWT_TOKEN:-}" ]; then
    curl -sf -X GET "http://localhost:${PORT:-8080}/api/v1/archive" \
        -H "Authorization: JWT $ARCHIVE_JWT_TOKEN" \
        && echo "[$(date)] Email sent." \
        || echo "[$(date)] WARNING: email request failed."
else
    echo "[$(date)] WARNING: ARCHIVE_JWT_TOKEN not set, skipping email."
fi