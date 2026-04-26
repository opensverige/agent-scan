# agent.opensverige

[![CI](https://github.com/opensverige/agent-scan/actions/workflows/ci.yml/badge.svg)](https://github.com/opensverige/agent-scan/actions/workflows/ci.yml)
[![License: FSL-1.1-MIT](https://img.shields.io/badge/license-FSL--1.1--MIT-blue.svg)](LICENSE)
[![Discord](https://img.shields.io/discord/1466847548864987289?label=discord&color=5865F2)](https://discord.gg/CSphbTk8En)
[![Made in Stockholm](https://img.shields.io/badge/made_in-Stockholm-yellow.svg)](https://opensverige.se)

Sveriges öppna AI-agent-readiness scanner. 17 checks. EU-jurisdiktion. Open source under FSL.

Live: **[agent.opensverige.se](https://agent.opensverige.se)** · API: [/api-docs](https://agent.opensverige.se/api-docs) · OpenAPI 3.1: [/openapi.yaml](https://agent.opensverige.se/openapi.yaml)

---

## What it does

Scans a domain and reports how well it's prepared for AI agents (Claude, ChatGPT, Cursor, Perplexity). 17 technical signals across three categories:

- **Discovery** — robots.txt, sitemap, llms.txt, llms-full.txt, markdown content negotiation, SSR check, actual AI-crawler access
- **Compliance** — GDPR Art. 22 (automated decision-making) signal, cookie/bot handling, EU AI Act Art. 50 marking
- **Builder** — public API, OpenAPI spec, dev docs, MCP server, MCP discovery (`.well-known/mcp`), MCP server card, sandbox

Each check returns pass/fail with severity. Results aggregate to green/yellow/red badge. Full methodology in [docs/SCANNER-METHODOLOGY.md](docs/SCANNER-METHODOLOGY.md).

## Why we built it

[Cloudflare's isitagentready.com](https://isitagentready.com) (April 17, 2026) is the global English equivalent. It has 16 checks, zero EU compliance signals, and runs on AWS US. We built the Nordic version: 17 checks (one more), GDPR + EU AI Act explicit, source on GitHub, EU-only data plane.

300+ Swedish builders in our [Discord](https://discord.gg/CSphbTk8En) need a scanner that respects EU jurisdiction. EU AI Act Art. 50 (effective 2 Aug 2026) requires AI-disclosure patterns nobody else implements yet. We do.

## Quickstart (local dev)

```bash
git clone https://github.com/opensverige/agent-scan
cd agent-scan
npm install
cp .env.example .env.local
# Fill in ANTHROPIC_API_KEY (required for AI summary)
# Other keys are optional but improve results
npm run dev
```

Open [http://localhost:3006/scan](http://localhost:3006/scan).

## Quickstart (API)

```bash
# 1. Get an alpha key (DM in Discord — invite-only during alpha)
export OSV_KEY=osv_test_xxxxxxxxxxxxxxxxxxxxxxxx

# 2. Scan
curl -X POST https://agent.opensverige.se/api/v1/scan \
  -H "Authorization: Bearer $OSV_KEY" \
  -H "Content-Type: application/json" \
  -d '{"domain":"klarna.com"}'
```

Full reference: [docs/API.md](docs/API.md) · Interactive: [/api-docs](https://agent.opensverige.se/api-docs)

## Stack

- **Next.js 15** (app router) + TypeScript strict
- **Tailwind CSS 3** + shadcn/ui (Radix primitives)
- **Supabase Postgres** (eu-west-2 London) + pg_cron for retention
- **Anthropic Claude** for AI summaries (migrating to AWS Bedrock Frankfurt before Aug 2, 2026)
- **Firecrawl** for JS-rendered content
- **Exa** for semantic dev-portal discovery
- **Vercel** hosting + edge

Architecture deep-dive: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Roadmap: [docs/strategy/PLAN.md](docs/strategy/PLAN.md).

## Contributing

PRs welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CLA.md](CLA.md) first. Sign your commits with `git commit -s` to accept the CLA.

Wanting to propose a new check (G-XX)? Open a [check-proposal issue](.github/ISSUE_TEMPLATE/new_check.yml) — the template asks the right questions.

## License

[FSL-1.1-MIT](LICENSE) — Functional Source License, MIT future license.

**You can:** read, fork, modify, contribute back, run internally, use for non-commercial education or research, build professional services on top.

**You cannot** (during the 2-year non-compete window): offer agent.opensverige.se as a competing managed service, or embed it in a closed-source commercial product.

After 2 years per commit, code auto-converts to MIT.

For commercial licensing (waive the non-compete): see [COMMERCIAL.md](COMMERCIAL.md). Email `gustaf@opensverige.se`.

## Security

Email `security@opensverige.se`. Don't open public issues. See [SECURITY.md](SECURITY.md).

## Privacy

[/integritetspolicy](https://agent.opensverige.se/integritetspolicy) · [/legal/subprocessors](https://agent.opensverige.se/legal/subprocessors) · [/legal/ai-disclosure](https://agent.opensverige.se/legal/ai-disclosure)

90-day retention, HMAC-peppered IP hashing, EU-only data plane (Supabase eu-west-2).

## Community

[Discord](https://discord.gg/CSphbTk8En) — 300+ Swedish builders. Stockholm, Göteborg, Malmö.
