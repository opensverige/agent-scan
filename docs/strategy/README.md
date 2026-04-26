# Strategy folder

Dokumentation för strategin från forskning till publik API.

## Struktur

```
docs/strategy/
├── README.md         — denna fil
├── PLAN.md           — master plan, dependency-graf, beslutsbehov
├── CHECKLIST.md      — concrete bockning per stage
├── DECISIONS.md      — 6 binära beslut + svar + datum
└── research/         — orörda forskningsdokument från april 2026
    ├── 00-executive-summary.md
    ├── 01-cloudflare-isitagentready-teardown.md
    ├── 02-agent-readiness-scoring-2026.md
    ├── 03-api-monetization-benchmarks.md
    ├── 04-legal-eu-ai-act-gdpr.md
    └── 05-async-api-architecture.md
```

## Hur vi använder dokumenten

- **PLAN.md** — läs först. Förstå sekvenseringen och vad som blockar vad.
- **DECISIONS.md** — fyll i de 6 svaren när du tar besluten. Stage 0 blockas av #1-3.
- **CHECKLIST.md** — bockas i samma commit som löser respektive item.
- **research/** — refereras med `§ X.Y`-notation i hela planen. Rör inte original-filerna.

## Konvention vid uppdatering

- Vid commit som löser ett checklist-item: uppdatera `CHECKLIST.md` i samma commit.
- Vid stage-completion: uppdatera "Definition of Done"-sektionen i `CHECKLIST.md` + flagga i `PLAN.md`.
- Vid nytt beslut: lägg till i `DECISIONS.md` (numrera #7, #8, ...).
- Aldrig redigera `research/`-filerna — de är källmaterial.

## Hard deadlines (från research)

- **2 augusti 2026** — EU AI Act Art. 50 tillämpas (15M EUR / 3% omsättning i böter).
- **~3 månader från Cloudflares launch** (17 april 2026) — reputation window för "Swedish alternative"-narrativ.
