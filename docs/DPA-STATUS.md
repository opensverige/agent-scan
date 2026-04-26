# DPA Status — Sub-processor agreements

> Internal tracking of Data Processing Agreements. Not customer-facing — see [/legal/subprocessors](https://agent.opensverige.se/legal/subprocessors) for the public list.
>
> Audit owner: Gustaf Garnow. Reviewed quarterly + when adding/removing sub-processors.

## Required by GDPR Art. 28

Every sub-processor that handles personal data on our behalf must have a signed DPA before they receive production data. SCCs (Standard Contractual Clauses, EU 2021/914) are the default mechanism for non-EEA transfers.

## Current sub-processor status

| Provider | Service | Personal data they touch | DPA signed | Mechanism | Notes |
|---|---|---|---|---|---|
| **Vercel Inc.** | Hosting + edge | Hashed IP, request metadata | ✅ | EU-US DPF (active certification) | Auto-included in Vercel ToS for Pro plan |
| **Supabase Inc.** | Postgres database | Hashed IP, scan results, AI summaries | ✅ | DPA + EU SCC Modules 2+3 | Region: eu-west-2 (London) |
| **Anthropic PBC** | Claude API (LLM) | Domain names, public scan probe content | ⏳ pending | SCC Module 2 + TIA | Migrating to AWS Bedrock Frankfurt before 2 Aug 2026 |
| **AWS** (planned) | Bedrock Claude inference | Same as Anthropic above, but in EU region | ⏳ not yet onboarded | EU-US DPF (AWS certified) + EU region | See Stage 4e |
| **Mendable Labs (Firecrawl)** | JS-rendered scraping | Public scan probe content | ⚠️ implicit (ToS) | SCC | Domain names not personal data; reduce exposure if possible |
| **Exa Labs Inc.** | Semantic search for portals | Domain names + search queries | ⚠️ implicit (ToS) | SCC | Domain names not personal data |
| **Cloudflare Inc.** | DNS + DDoS for opensverige.se | IP addresses (transient) | ✅ | EU-US DPF (active certification) | DPA signed at account creation |
| **Cal.com Inc.** | Booking calendar | Email + booking data | ✅ | DPA + EU SCC | Limited scope — only when user books a meeting |

## Gaps to close before public launch (Aug 2 deadline)

- [ ] **Sign Anthropic DPA** — go to trust.anthropic.com, complete DPA flow, store signed PDF in 1Password vault
- [ ] **Confirm Anthropic DPF certification status** — check dataprivacyframework.gov participant list. If certified, SCC not required. If not certified, file TIA (see TIA.md).
- [ ] **Migrate Claude → Bedrock Frankfurt** — eliminates US transfer entirely. See Stage 4e in PLAN.md.
- [ ] **Document Firecrawl data flow** — verify they don't persist scraped content in their own systems beyond response time.

## Process for adding new sub-processors

1. Check if they handle personal data (broad GDPR definition — even hashed IP counts).
2. Check if they have public DPA template + adequate transfer mechanism (DPF, SCC, adequacy).
3. Sign DPA, store signed copy in shared vault.
4. Update this file + `/legal/subprocessors` page.
5. Email existing customers with 30-day notice (per ToS commitment).
6. Update `lib/i18n.ts` subprocessors.providers array.
7. Wait 30 days before sending production data unless emergency justifies sooner.

## Process for removing sub-processors

1. Stop sending new data to the sub-processor.
2. Request data deletion confirmation from them.
3. Update this file + `/legal/subprocessors`.
4. Email customers if they were dependent on the integration.
5. Archive signed DPA copy for at least 6 years (limitation period for GDPR claims).
