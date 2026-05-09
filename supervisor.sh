#!/bin/bash
# Atlas Core - Dev Server Auto-Restart Supervisor
cd /home/z/my-project

while true; do
  echo "[$(date +%H:%M:%S)] Starting server..." >> /home/z/my-project/dev.log
  rm -rf .next 2>/dev/null
  NODE_OPTIONS="--max-old-space-size=256" bun run dev >> /home/z/my-project/dev.log 2>&1
  EXIT=$?
  echo "[$(date +%H:%M:%S)] Exited ($EXIT), restarting in 2s..." >> /home/z/my-project/dev.log
  sleep 2
done
