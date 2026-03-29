#!/bin/sh
# IronLog container entrypoint
#
# Start sequence:
#   1. Start PocketBase in background (--automigrate creates all collections on first boot)
#   2. Wait for it to be healthy
#   3. Create/update admin superuser from PB_ADMIN_EMAIL + PB_ADMIN_PASSWORD env vars
#   4. Run seed script — idempotent, safe on every restart
#      Exercises/programs are synced from seedData.ts baked into the image.
#      Workout history is never touched.
#   5. Hand off to PocketBase (foreground, handles signals cleanly)
#
# Required env vars:
#   PB_ADMIN_EMAIL     Admin login email (set once, same on every restart)
#   PB_ADMIN_PASSWORD  Admin login password
#
# Optional env vars:
#   PB_ENCRYPTION_KEY  AES-256 key for encrypting sensitive collection fields

set -e

/pb/pocketbase serve --http=0.0.0.0:8090 --automigrate &
PB_PID=$!

printf "[IronLog] Waiting for PocketBase"
until wget -q -O- http://127.0.0.1:8090/api/health >/dev/null 2>&1; do
  printf "."
  sleep 1
done
echo " ready"

if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  echo "[IronLog] Configuring admin account: $PB_ADMIN_EMAIL"
  /pb/pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD"

  echo "[IronLog] Seeding exercises and programs..."
  PB_URL=http://127.0.0.1:8090 node /pb/seed.mjs
  echo "[IronLog] Seed complete"
else
  echo "[IronLog] WARNING: PB_ADMIN_EMAIL / PB_ADMIN_PASSWORD not set"
  echo "[IronLog]   Admin account and seed data will not be configured."
  echo "[IronLog]   Set these env vars and restart to seed."
fi

# Wait for PocketBase — keeps container alive and propagates SIGTERM/SIGINT correctly
wait $PB_PID
