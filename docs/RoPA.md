# Register of Processing Activities (RoPA) — agent.opensverige.se

> Internal document required by GDPR Art. 30. Lists every processing activity we perform on personal data. Must be available on request to IMY.

**Controller:** Felipe and Gustaf Garnow (community project)
**Contact:** info@opensverige.se
**Reviewed:** 26 April 2026

---

## Activity 1: Public scanner usage

| Field | Value |
|---|---|
| **Purpose** | Run AI-agent-readiness scans on user-submitted domains |
| **Lawful basis** | GDPR Art. 6(1)(f) — legitimate interest (technical analysis, security research, education on AI standards) |
| **Categories of data subjects** | Anyone visiting agent.opensverige.se to scan a domain |
| **Categories of personal data** | Hashed IP address (HMAC-SHA256 with server-held pepper) |
| **Recipients** | Vercel (hosting), Supabase (database, eu-west-2 London) |
| **Transfers outside EEA** | Vercel (US edge processing) — covered by EU-US DPF; supplementary measures per `TIA.md` |
| **Retention** | 90 days, automatic deletion via pg_cron (`supabase/migrations/006_retention_cron.sql`) |
| **Security measures** | HMAC-peppered IP hashing, TLS 1.3 in transit, AES-256 at rest, RLS on Supabase |

## Activity 2: API key issuance + usage

| Field | Value |
|---|---|
| **Purpose** | Authenticate users of the public /v1/* API; rate-limit per key |
| **Lawful basis** | GDPR Art. 6(1)(b) — contract performance (we provide the service in exchange for API consumption) |
| **Categories of data subjects** | Alpha API users (currently invite-only, ~10 builders) |
| **Categories of personal data** | Email, name, hashed API key, scan history attribution |
| **Recipients** | Supabase (database) |
| **Transfers outside EEA** | None — Supabase stores in eu-west-2 |
| **Retention** | While account is active + 6 years after revocation (Swedish bookkeeping requirements; reduced if user requests erasure and we have no overriding legal obligation) |
| **Security measures** | SHA-256 hashed API keys, RLS on Supabase, TLS in transit, AES-256 at rest |

## Activity 3: AI-summary generation

| Field | Value |
|---|---|
| **Purpose** | Generate human-readable summaries of scan results using Anthropic Claude |
| **Lawful basis** | Art. 6(1)(f) — same legitimate interest as Activity 1 |
| **Categories of data subjects** | Same as Activity 1 |
| **Categories of personal data** | Domain names + public scan probe content sent to Anthropic. **No IP addresses, no user identifiers.** |
| **Recipients** | Anthropic PBC (US) |
| **Transfers outside EEA** | Yes — to US under SCC Module 2 + TIA (`TIA.md`). Migrating to AWS Bedrock Frankfurt before 2 Aug 2026 to eliminate. |
| **Retention** | Anthropic does not persist API inputs by default per their enterprise terms (trust.anthropic.com) |
| **Security measures** | TLS 1.3 in transit; data minimisation (no IPs sent); pending Bedrock Frankfurt migration |

## Activity 4: DSAR handling

| Field | Value |
|---|---|
| **Purpose** | Honour data subject rights under GDPR Art. 15-22 |
| **Lawful basis** | Art. 6(1)(c) — legal obligation |
| **Categories of data subjects** | Anyone submitting a DSAR via `/api/dsar` or info@opensverige.se |
| **Categories of personal data** | Email, name, request description, hashed submitter IP |
| **Recipients** | Supabase (database) |
| **Transfers outside EEA** | None |
| **Retention** | 6 years from resolution (legal claim limitation period) |
| **Security measures** | Same as Activity 2 |

## Activity 5: Booking calls (Cal.com integration)

| Field | Value |
|---|---|
| **Purpose** | Let users book 15-min calls with builders |
| **Lawful basis** | Art. 6(1)(b) — contract performance |
| **Categories of data subjects** | Users who book |
| **Categories of personal data** | Email, name, time of meeting, optional notes |
| **Recipients** | Cal.com Inc. (controller for that data, not processor for us) |
| **Transfers outside EEA** | Yes — Cal.com US under their own DPF; we don't store the data, only redirect |
| **Retention** | Per Cal.com retention policy (we don't have a copy) |
| **Security measures** | Cal.com SOC 2 Type II; we don't store; user agrees to Cal.com terms when booking |

## Activity 6: Web analytics

| Field | Value |
|---|---|
| **Purpose** | Measure site usage to improve UX |
| **Lawful basis** | Art. 6(1)(f) — legitimate interest |
| **Categories of data subjects** | All site visitors |
| **Categories of personal data** | Page views, referrers (no cookies, no fingerprinting) |
| **Recipients** | Vercel Analytics |
| **Transfers outside EEA** | Vercel US — DPF covered |
| **Retention** | 90 days per Vercel default |
| **Security measures** | Cookieless by design; no cross-site tracking |

---

## Update protocol

- When adding a new processing activity (e.g. new feature touching personal data), add a section to this file.
- Review at least annually (next: April 2027).
- On request from IMY, provide this document within 30 days.
