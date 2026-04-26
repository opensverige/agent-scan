# Security policy

## Reporting a vulnerability

**Do not** open a public GitHub issue.

Email `security@opensverige.se` with:

- a description of the vulnerability
- steps to reproduce
- the affected version (commit hash if known)
- your name + how to credit you (optional)

We acknowledge within five business days. Triage + fix timeline depends on severity but we aim for 90 days from acknowledgement to public disclosure, in line with industry practice.

We don't run a paid bug bounty programme yet. If you want public credit for a valid finding, we'll add you to the security acknowledgements list (planned for Stage 5).

## Scope

In scope:

- The deployed application at `agent.opensverige.se`
- Source code in this repository (`opensverige/agent-scan`)
- Our public API at `/api/v1/*`
- The `scripts/` utilities

Out of scope:

- Third-party services we depend on (Anthropic, Vercel, Supabase, Cloudflare, Firecrawl, Exa, Cal.com) — report to them directly and copy us if relevant
- Issues that require physical access to a maintainer's machine
- Self-XSS, missing security headers on `*.opensverige.se` subdomains we don't control
- Vulnerabilities that require a maliciously crafted scanned domain to exploit, where the only impact is on the scanner operator's own infrastructure (we accept this risk by design — scanning untrusted domains is the point)

## Confidentiality

We treat all reports as confidential until you've agreed to disclosure. We may notify affected sub-processors privately if their systems are involved.

## See also

- [public/.well-known/security.txt](public/.well-known/security.txt) — RFC 9116 contact directives
- [LICENSE](LICENSE) — FSL-1.1-MIT
- [COMMERCIAL.md](COMMERCIAL.md) — commercial licensing
