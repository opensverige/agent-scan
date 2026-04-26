# Decisions Log

> Sex binära beslut som blockar olika stages. Forma av: fråga → mitt försvar → ditt svar → datum + commit-ref där det effektueras.

---

## #1 — IP-hash pepper-strategi

**Fråga:** När vi pepperar IP-hashen — migrerar vi befintliga rader (re-hash med ny pepper) eller accepterar att gamla blir oåterställbara?

**Mitt försvar:** **Acceptera oåterställbara.** Det är *bättre* GDPR-mässigt — gamla data blir mer anonymiserade, inte mindre. Forskningen § 4.3 stödjer detta (peppered hash är best practice; oåterställbara historiska data minskar risk).

**Konsekvens om "ja":**
- Gamla 35 rader får null/dummy ip_hash
- Rate-limiting kan inte korsreferera gamla scans (men det är lugnt — ingen scannar samma sajt 1000 gånger på en månad)
- Migreringen tar 2 minuter

**Ditt svar:** ☑ Acceptera oåterställbara (per användarens "kör de du rekommenderar")

**Datum:** 2026-04-26

---

## #2 — De 33 seed-scansen

**Fråga:** Radera dem eller re-scanna på riktigt via produktions-API?

**Mitt försvar:** **Re-scanna.** ~17 SEK kostnad. Counter behåller `35` istället för att rasa till `2`. Och nu är data riktig — ingen reputationsrisk om någon delar `/scan/spotify.com`. Vi har redan API:et som ID:ar svenska företag korrekt.

**Konsekvens om "re-scanna":**
- Skripta 33 anrop med 30s mellanrum → ~17 minuter
- 33 × $0,05 ≈ 17 SEK total
- Counter förblir `35`
- Alla resultat-sidor får riktig data + riktig Claude-summary

**Konsekvens om "radera":**
- Counter går från 35 → 2 omedelbart
- Sidan är tom under en period medan vi väntar på riktiga scans
- 0 kr kostnad
- Helt ärligt (men deprimerande)

**Ditt svar:** ☑ Re-scanna (per användarens "kör de du rekommenderar")

**Datum:** 2026-04-26

---

## #3 — Open source repot?

**Fråga:** Pusha repot publikt på GitHub under MIT/Apache-licens?

**Mitt försvar:** **Ja, MIT-licens.**

Pros:
- Cloudflare *kan inte* OSS:a sin scanner — den är knuten till bot management. Vi gör det de inte kan.
- "Gratis OCH öppen källkod" är ett starkt narrativ mot Cloudflare's gratis-men-black-box.
- AI Sweden, Vinnova, DIGG samarbetar gärna med OSS-projekt.
- Community-PR från Discord-builders blir möjligt.
- Distribution via GitHub trending, awesome-lists, blog-mentions.
- "We score companies on having open APIs and MCP servers — vi själva är open source" är konsekvent storytelling.

Cons:
- Konkurrenter kan klona och hosta billigare. Mitigering: värdet ligger i datadriftet (35+ scans, 90-dagars historik, AI-summaries via Anthropic, riktig Supabase-integrering), inte i koden.
- Säkerhetsbrister blir publika. Mitigering: vanlig responsible disclosure via /.well-known/security.txt.

**Ditt svar:** ☑ MIT, GitHub-org `opensverige` (befintlig — repot ligger redan på `opensverige/agent-scan`, vi behöver bara byta visibility till public)

**Datum:** 2026-04-26

**Copyright-innehavare:** Felipe och Gustaf Garnow (kodbidragare per 2026-04-26). Innan publik launch eller framtida sale: överväg överföring till AB för tydligare juridiskt subjekt.

**Reviderat 2026-04-26 senare samma dag:** Bytt från MIT → **FSL-1.1-MIT** efter samtal om Gollum-skydd och säljbarhet.

Anledning: MIT skyddar inte mot AWS/Vercel/Cloudflare som wrappar koden som managed-tjänst. AGPL skulle bara kräva att de publicerar sina ändringar — de gör det knorrande och ändå konkurrerar. FSL kontraktsförbjuder "Competing Use" i två år, varefter koden auto-konverterar till MIT. Ger:

- Strömlinjeformat skydd mot konkurrent-SaaS de första två åren
- Tydlig copyright-kontroll → säljbart till acquirer
- Möjlighet att dual-licensa kommersiellt utan komplikation
- Eventuell övergång till äkta öppen källkod (MIT) på autopilot

Implementerat: LICENSE bytt, CLA.md tillagd, README + CONTRIBUTING uppdaterade.

---

## #4 — Inngest + Upstash som bakgrundsjobb-stack

**Fråga:** Köra med Inngest (kömotor) + Upstash Redis (rate limit) per forskningens § 5.7?

**Mitt försvar:** **Ja.** Forskningen är tydlig:
- Vercel function-timeout är 300s default 2026 (Fluid Compute)
- Scan-jobb tar 10-30s i normalfall, kan spika på Firecrawl/Exa
- Vi behöver retry, dead letter queue, observability
- Inngest free tier räcker långt (50k step runs/månad)
- Upstash free tier räcker långt (10k commands/dag)

Alternativ: Trigger.dev, BullMQ self-hosted, Cloudflare Queues, Supabase Edge Functions med pg_cron.

**Vad jag behöver:**
- Inngest-konto (du registrerar på inngest.com, ger mig signing key)
- Upstash-konto (du registrerar på upstash.com, ger mig REST URL + token)

**Ditt svar:** ☐ Inngest + Upstash | ☐ Annat (specifiera)

**Datum:**

---

## #5 — Stripe + Stripe Tax för betalningar

**Fråga:** Kör vi Stripe + Stripe Tax från start (vs alternativ som Lemon Squeezy, Paddle, FastSpring)?

**Mitt försvar:** **Stripe + Stripe Tax.**
- Forskningen § 3.6 rekommenderar det — branschstandard, EU OSS-momshanering inbyggt
- Stripe har bäst utvecklarexperience för API-products (idempotency, webhooks, signering)
- Klarna är Stripe-payment-method (svenska kunder gillar Klarna)
- Stripe Tax kostar 0% extra (ingår i Stripe-avgiften)

Nackdelar: 1.5% + 1.80 SEK per kort-transaktion. Acceptabelt vid 290+ SEK Builder-tier.

Alternativ Lemon Squeezy är "Merchant of Record" → de hanterar all moms men tar 5% + 0,50 USD. Bra för USA-fokuserade SaaS, ej optimal för svenska B2B.

**Vad jag behöver:**
- Stripe-konto registrerat på opensverige.se
- Stripe Tax aktiverat (kräver F-skattsedel + momsregistrering hos Skatteverket)
- Stripe test- och live-keys

**Ditt svar:** ☐ Stripe + Stripe Tax | ☐ Annat

**Datum:**

---

## #6 — AWS Bedrock Frankfurt vs Anthropic-direkt

**Fråga:** Migrerar vi Claude-anrop till AWS Bedrock i Frankfurt (eu-central-1) före Aug 2-deadlinen, eller kör vi Anthropic-direkt + SCC + TIA?

**Mitt försvar:** **Bedrock Frankfurt.**

Pros:
- Data stannar i EU (eu-central-1)
- Eliminerar Schrems III-risk
- AWS är DPF-certifierat ([dataprivacyframework.gov participant 5666](https://www.dataprivacyframework.gov/list))
- Claude funkar identiskt via Bedrock API (samma modeller: Sonnet 4.6/4.5, Opus 4.7)
- AWS-kontot ger oss också väg till Lambda, S3, SES för andra behov

Cons:
- Kräver AWS-konto (du registrerar)
- Bedrock-priser kan vara aningen högre än Anthropic-direkt på vissa modeller
- En extra leverantör i kedjan

Alt: stanna på Anthropic-direkt → kräver SCC modul 2 + Transfer Impact Assessment + dokumentera "alla rimliga åtgärder för EU-skydd". Mer pappersarbete, mer juridisk risk om Schrems III-talan vinner.

**Vad jag behöver:**
- AWS-konto registrerat på opensverige.se
- IAM-user med endast Bedrock-permissions (`bedrock:InvokeModel*`)
- Region eu-central-1 aktiverat för Bedrock
- Anthropic-modeller aktiverade i Bedrock console
- AWS access key + secret key

**Ditt svar:** ☐ Bedrock Frankfurt | ☐ Anthropic-direkt + SCC/TIA

**Datum:**

---

## Anteckningar

- Beslut är inte huggna i sten. Om verkligheten visar något annat — uppdatera och dokumentera "ändrat datum" + "varför".
- Beslut #1-3 blockerar Stage 0. Måste fattas först.
- Beslut #4 blockerar Stage 2.
- Beslut #5 blockerar Stage 3.
- Beslut #6 blockerar Stage 4.
