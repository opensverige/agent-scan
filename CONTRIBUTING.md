# Contributing to agent.opensverige

Tack för att du vill bidra. Det här är ett community-projekt under MIT-licens — vi strävar efter att vara en lågfriktions plats att bygga på.

## Innan du börjar

- Issues > PRs för diskussion. Öppna ett issue först om du vill ändra arkitektur, lägga till en ny check, eller förändra UI markant.
- Triviala fixes (typos, lints, små bugs) behöver ingen pre-diskussion — skicka PR direkt.

## Setup

```bash
git clone https://github.com/opensverige/agent-scan
cd agent-scan
npm install
cp .env.example .env.local
# Fyll i ANTHROPIC_API_KEY (krävs)
# IP_HASH_PEPPER krävs i prod, dev har fallback
npm run dev
```

Öppna [http://localhost:3006/scan](http://localhost:3006/scan).

## Kvalitetskrav

- TypeScript strict — inga `any`-typer.
- `npm run type-check` + `npm run lint` + `npm run build` ska vara grönt på din PR.
- Inga oanvända imports, inga kvarvarande `// TODO` utan ticket-länk.
- Max 12 ord per mening i UI-copy (svenska språkkonvention för clean copy).
- Inga emojis i UI — animerade unicode-glyphs via CSS-keyframes om du vill ha rörlig dekoration.

## Code style

- Tailwind CSS 3 + shadcn/ui-komponenter (`components/ui/`).
- Cubic-bezier(0.16, 1, 0.3, 1) på alla transitions.
- Dark mode only. Bakgrund #060606. WCAG AA-kontrast.
- Instrument Serif endast vikt 400 + italic. Aldrig bold.

## Lägg till en ny check

Checks bor i `lib/checks.ts` (kommer flyttas till `lib/checks/{id}.ts` per check i kommande refactor — se [docs/strategy/PLAN.md](docs/strategy/PLAN.md)).

Varje check returnerar `CheckResult` med:

```ts
{
  id: CheckId,
  pass: boolean,
  label: string,
  category: 'discovery' | 'compliance' | 'builder',
  severity: 'critical' | 'important' | 'info',
  detail?: string,
  na?: boolean,           // 'not applicable' — excluded from score
  recommendation?: boolean // soft suggestion, not blocker
}
```

Lägg till context i `lib/check-context.ts` (`stat`, `source`, `action`).

Lägg till i18n-strängar i `lib/i18n.ts` om checken har user-facing text.

## Discord

Kom in på vår [Discord](https://discord.gg/CSphbTk8En) — 300+ builders. Bra för snabba frågor, design-feedback, och att hitta co-collaborators.

## Säkerhet

Rapportera **inte** säkerhetsproblem som GitHub-issues. Maila `info@opensverige.se` direkt. Se [security.txt](public/.well-known/security.txt) för detaljer.

## Code of Conduct

Behandla varandra med respekt. Personangrepp, trakasserier, eller diskriminering tolereras inte. Brott mot detta leder till banning från repo + Discord.
