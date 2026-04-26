# Incident Response Plan — agent.opensverige.se

> Internal runbook for security + privacy incidents. The 72-hour clock starts the moment any team member becomes aware of a likely personal-data breach (GDPR Art. 33).
>
> Owner: Gustaf Garnow. Reviewed twice yearly + after every major incident.

---

## Severity classification

**P0 — Confirmed personal-data breach**
- Production database breach (read or write)
- Leaked SUPABASE_SERVICE_ROLE_KEY
- Active exploitation of vulnerability that exposes user data
- Active key compromise where an attacker is making /v1/* calls

**P1 — Probable breach + investigation needed**
- Anomalous database access patterns
- Leaked dev credentials (.env.local in a repo, etc.)
- Sub-processor reports an incident on their side
- Ransomware indicators

**P2 — Service degradation, no data exposure**
- Site down (Vercel deploy failure, Supabase outage)
- Rate limiter broken letting too many scans through
- Scanner returning incorrect results due to logic bug

---

## P0/P1 response — first hour

1. **Acknowledge in #incidents Discord channel** with `INCIDENT P0/P1 — <one-line summary>`. Time-stamp.
2. **Stop the bleeding:**
   - If credentials leaked: revoke at source (Supabase dashboard, Vercel env, etc.) — within 15 min.
   - If suspected ongoing exploitation: take affected service offline (deploy `503 maintenance` page).
   - If single API key compromised: revoke via SQL (`UPDATE api_keys SET revoked_at = now() WHERE id = ...`).
3. **Preserve evidence:**
   - Screenshot Vercel logs immediately (logs may rotate).
   - Snapshot Supabase audit log (`audit.audit_log` extension).
   - Save any external sources (issue reports, abuse emails).
4. **Start incident doc** in `docs/incidents/YYYY-MM-DD-shortname.md` with:
   - Timeline of events
   - Affected systems
   - Affected users (count + identifying info if known)
   - Initial root-cause hypothesis

---

## P0 — within 72 hours (GDPR Art. 33 deadline)

If personal-data breach is confirmed:

1. **Notify IMY within 72 hours** of becoming aware.
   - Online form: https://www.imy.se/anmal-personuppgiftsincident/
   - Required info: nature of breach, categories of data + subjects, approximate number affected, likely consequences, mitigation taken.
   - If you don't have all info, file partial — you can supplement.
2. **Notify affected data subjects (Art. 34)** if breach is likely to result in high risk to rights/freedoms.
   - Email all key holders if API keys compromised.
   - Email DSAR-listed contacts if their requests were exposed.
   - Public notice on agent.opensverige.se if scope is large.
3. **Document in incident doc:** decisions made, why notified or didn't notify subjects (with justification).

---

## P0/P1 — within 7 days

1. **Root cause analysis** (RCA) document:
   - What happened
   - Why it happened (technical + organisational factors)
   - Why we didn't catch it sooner
   - Prevention plan (concrete code/process changes)
2. **Implement prevention:** within 7 days of RCA completion, ship code/policy changes that prevent recurrence.
3. **Update this runbook** if the incident revealed gaps in our process.

---

## Contact tree

| Role | Contact | When to call |
|---|---|---|
| Tech lead | Gustaf Garnow (`info@opensverige.se`) | All incidents |
| Co-contributor | Felipe (Discord DM) | All incidents (cross-check) |
| Privacy authority | IMY — `imy@imy.se` / +46 8 657 61 00 | P0 personal-data breach |
| AI Act authority | PTS — pts@pts.se | Suspected AI Act violation |
| External legal counsel | TBD — onboard before public launch | Material legal exposure |
| Cyber insurance | TBD — onboard before public launch | Cyber claim trigger |

## Sub-processor contacts

| Provider | Incident channel |
|---|---|
| Supabase | https://supabase.com/contact (status: status.supabase.com) |
| Vercel | https://vercel-status.com — incidents include public RCA |
| Anthropic | trust@anthropic.com |
| Cloudflare | https://status.cloudflare.com |
| Cal.com | help@cal.com |

---

## Tabletop exercises

Run a tabletop drill twice yearly (roughly when this doc is reviewed):

- Pick a hypothetical scenario (P0 breach example).
- Walk through this runbook in real-time. Note where it breaks.
- Update doc + tooling.

Last tabletop: not yet run. Schedule one for late May 2026 before public API launch.

---

## What not to do

- Don't speculate publicly before facts are confirmed. Incidents leak even when they shouldn't.
- Don't delete evidence before lawyer/IMY have seen it.
- Don't notify affected users before tech lead approves the notification text.
- Don't make commitments to compensation without legal review.

---

*This runbook is part of our pre-launch GDPR + AI Act readiness. Updated as the org grows.*
