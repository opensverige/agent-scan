#!/usr/bin/env bash
# scripts/rescan-seeds.sh
#
# Replaces synthetic seed scans with real scans via prod API.
# Each scan takes ~10-30s; rate limit is 1/min per IP-hash, so we sleep 65s
# between requests. Total runtime: ~35 min for 32 domains.
#
# After all scans complete (the script logs each result), the seed rows
# can be cleaned up with:
#   DELETE FROM scan_submissions WHERE ip_hash='seed-historical-2026-04-26';
#
# Latest-by-timestamp logic in /scan/[domain]/page.tsx ensures the new
# scans take precedence in the UI even before the seeds are deleted.

set -euo pipefail

DOMAINS=(
  spotify.com ikea.com hm.com ericsson.com saab.com
  abb.com atlascopco.com sandvik.com electrolux.se astrazeneca.com
  polestar.com seb.se swedbank.se handelsbanken.se nordea.se
  avanza.se nordnet.se tele2.se telia.se scania.com
  hexagon.com assaabloy.com ica.se axfood.se coop.se
  truecaller.com tink.se trustly.com bonnier.se schibsted.com
  storytel.com northvolt.com
)

LOG="/tmp/rescan-seeds-$(date +%s).log"
echo "Logging to: $LOG"

i=0
for domain in "${DOMAINS[@]}"; do
  i=$((i + 1))
  echo "[$i/${#DOMAINS[@]}] $domain — scanning..." | tee -a "$LOG"
  result=$(curl -sS -X POST https://agent.opensverige.se/api/scan \
    -H "Content-Type: application/json" \
    -d "{\"domain\":\"$domain\"}" \
    --max-time 60 || echo '{"error":"curl_failed"}')

  scan_id=$(echo "$result" | python3 -c 'import sys, json; d=json.load(sys.stdin); print(d.get("scan_id", "ERROR"))' 2>/dev/null || echo "PARSE_FAILED")
  badge=$(echo "$result" | python3 -c 'import sys, json; d=json.load(sys.stdin); print(d.get("badge", "?"))' 2>/dev/null || echo "?")
  echo "[$i/${#DOMAINS[@]}] $domain → badge=$badge id=${scan_id:0:18}..." | tee -a "$LOG"

  # Last domain doesn't need a sleep
  if [ "$i" -lt "${#DOMAINS[@]}" ]; then
    echo "  sleeping 65s for rate limit..." | tee -a "$LOG"
    sleep 65
  fi
done

echo "All ${#DOMAINS[@]} scans submitted. Run cleanup SQL when ready." | tee -a "$LOG"
