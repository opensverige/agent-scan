#!/usr/bin/env bash
# scripts/rescan-seeds.sh
#
# Replaces synthetic seed scans with real scans via prod API.
# Skips domains that already have a real (non-seed) scan in DB.
# Each scan takes ~10-30s; rate limit is 1/min per IP-hash, so we sleep 65s
# between requests.
#
# After all scans complete, clean up with:
#   DELETE FROM scan_submissions WHERE ip_hash='seed-historical-2026-04-26';

set -uo pipefail

# Resume list — domains that haven't been re-scanned yet (queried 2026-04-26).
# Includes spotify.com (failed in first run) and seb.se (in-progress when killed).
DOMAINS=(
  spotify.com seb.se swedbank.se handelsbanken.se nordea.se
  avanza.se nordnet.se tele2.se telia.se scania.com
  assaabloy.com ica.se axfood.se coop.se truecaller.com
  tink.se trustly.com bonnier.se schibsted.com storytel.com
  northvolt.com
)

LOG="/tmp/rescan-seeds-$(date +%s).log"
echo "Logging to: $LOG"

i=0
ok=0
fail=0
for domain in "${DOMAINS[@]}"; do
  i=$((i + 1))
  echo "[$i/${#DOMAINS[@]}] $domain — scanning..." | tee -a "$LOG"
  result=$(curl -sS -X POST https://agent.opensverige.se/api/scan \
    -H "Content-Type: application/json" \
    -d "{\"domain\":\"$domain\"}" \
    --max-time 90 || echo '{"error":"curl_failed"}')

  scan_id=$(echo "$result" | python3 -c 'import sys, json; d=json.load(sys.stdin); print(d.get("scan_id", "ERROR"))' 2>/dev/null || echo "PARSE_FAILED")
  badge=$(echo "$result" | python3 -c 'import sys, json; d=json.load(sys.stdin); print(d.get("badge", "?"))' 2>/dev/null || echo "?")

  if [[ "$scan_id" == ERROR* ]] || [[ "$scan_id" == PARSE_FAILED* ]] || [[ "$scan_id" == local-* ]]; then
    fail=$((fail + 1))
    echo "[$i/${#DOMAINS[@]}] $domain → FAILED (id=$scan_id)" | tee -a "$LOG"
  else
    ok=$((ok + 1))
    echo "[$i/${#DOMAINS[@]}] $domain → badge=$badge id=${scan_id:0:18}..." | tee -a "$LOG"
  fi

  if [ "$i" -lt "${#DOMAINS[@]}" ]; then
    sleep 65
  fi
done

echo "Done. ok=$ok fail=$fail / ${#DOMAINS[@]}" | tee -a "$LOG"
