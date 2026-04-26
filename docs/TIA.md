# Transfer Impact Assessment — agent.opensverige.se

> Per EDPB Recommendations 01/2020, when transferring personal data outside the EEA we must document a Transfer Impact Assessment (TIA) — risk analysis of the destination country plus supplementary measures we apply.
>
> This TIA covers transfers as of April 2026. Re-review annually or when surveillance laws materially change.

## Scope of transfers

We transfer the following personal data to non-EEA countries:

### Anthropic (US, primary risk)

| Data | Volume | Purpose |
|---|---|---|
| Domain names | One per scan (~30/day current) | LLM input for summary generation |
| Public scan probe content (HTML/text) | ~10-30 KB per scan | LLM input |
| **Hashed IP** | NEVER | We don't send IP to Anthropic |

### Vercel (US-incorporated, but EU edge presence)

Hashed IP and request metadata transit through Vercel's edge network. Some processing happens in US data centers (cold-start function execution).

### Cloudflare (US-incorporated, EU edge)

DNS resolution + DDoS shield for opensverige.se. IP addresses transit but are not persisted by us.

## Threat assessment

### US surveillance regimes

- **FISA 702** — could compel Anthropic/Vercel/Cloudflare to disclose data of EU residents.
- **EO 12333** — bulk-collection authority for non-US persons.
- **EO 14086 (Oct 2022)** — establishes Data Privacy Framework redress mechanism. Critical for DPF validity.

### CJEU Schrems II implications

The CJEU invalidated Privacy Shield in 2020 over insufficient redress + proportionality. EU-US Data Privacy Framework (2023) addresses this — General Court upheld validity Sep 2025 (T-557/20). NOYB has signaled plans for "Schrems III" but no filing as of April 2026.

### Practical risk for our data

| Concern | Realistic risk | Mitigation |
|---|---|---|
| Anthropic compelled to disclose scan content | Low — content is public-by-definition (we scan public URLs) | Migrating to Bedrock Frankfurt before Aug 2026 eliminates this |
| Vercel compelled to disclose hashed IPs | Medium — but hashes are pseudonymised + peppered (HMAC-SHA256, key not in Vercel) | Pepper held only in Vercel env vars; without pepper, hashes are useless |
| Cloudflare compelled to disclose source IPs | Low — Cloudflare publishes transparency reports + warrant canaries | Standard DPF reliance; transient data |

## Supplementary measures (per EDPB Recommendations 01/2020)

### Technical

1. **HMAC-peppered IP hashing** (`lib/ip-hash.ts`) — IPs are hashed with a server-side secret. The hash alone is useless for re-identification without the pepper, which lives only in Vercel env vars.
2. **Pseudonymisation before transfer** — we never send raw IPs to Anthropic. The Claude API call payload contains domain names + public scan content only.
3. **TLS 1.3 in transit** — all connections to Anthropic, Vercel, Cloudflare use modern TLS.
4. **Encryption at rest** — Supabase eu-west-2 stores all data encrypted (AES-256) with keys managed by Supabase.

### Organisational

1. **Data minimisation** — Anthropic only receives the data needed to generate summaries. We don't include user identifiers, IP info, or anything sensitive.
2. **Access logging** — Vercel logs request metadata; we can audit if a query reveals concerning patterns.
3. **Subject rights honoured** — DSAR endpoint at `/api/dsar` lets EU subjects request access/erasure within 30 days.
4. **Sub-processor list public** — `/legal/subprocessors` discloses every transfer recipient with location + transfer mechanism.

### Contractual

1. **EU SCC Module 2** signed with Anthropic (controller-to-processor) — pending DPA execution.
2. **Vercel DPA** signed (auto-included in Pro plan).
3. **Supabase DPA** signed via dashboard.
4. **Cloudflare DPA** signed at account creation.

## Conclusion

Current transfers to US are lawful given:
- Active EU-US Data Privacy Framework (Vercel, Cloudflare, AWS certified)
- Standard Contractual Clauses where DPF doesn't apply (Anthropic pending Bedrock migration)
- Strong technical pseudonymisation (peppered IP hashing)
- Public-by-design data set (domain scans of public URLs)

Stage 4e — migrating Claude inference to AWS Bedrock Frankfurt (eu-central-1) — eliminates the largest residual US transfer entirely. Targeted before 2 August 2026.

## Re-review trigger events

- Schrems III ruling that invalidates DPF
- Material change in US surveillance law (e.g. CLOUD Act amendment)
- New high-volume transfer added (e.g. switching to a new LLM provider in US)
- Regulatory change in GDPR or AI Act
- Annual review (next: April 2027)
