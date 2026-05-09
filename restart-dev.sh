#!/bin/bash
while true; do
  npx next dev -p 3000 2>&1
  echo "=== SERVER DIED - RESTARTING IN 2s ==="
  sleep 2
done

