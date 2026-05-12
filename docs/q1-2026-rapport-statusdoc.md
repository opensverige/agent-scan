# Q1 2026 rapport — statusdoc

**Datum:** 12 maj 2026 · 13:45 (uppdaterad efter iteration 2)
**Branch:** awesome-austin-17bcab worktree
**Status:** Bygd, refinerad genom **två iterationer** av reviewer-feedback (8 personas totalt). **Inte pushad.** Dev-server kör via preview-tool på `http://localhost:3006/rapport/q1-2026`.

## Sista-minuten-uppdateringar i iteration 2

**Headline:** "Skatteverket har ingen **AI-vägledning**" (var: "AI-policy"). Skatteverkets comms-officer-persona påpekade att "ingen AI-policy" är faktiskt fel — interna policys finns, det som saknas är maskinläsbar vägledning. Anna (non-tech) bekräftade också att "vägledning" är ett bättre ord än "policy".

**Academic causal-language softening:**
- "Bonnier styr blockeringspolicy uppifrån" → "konsistent med koncentrerat ägarskap — central styrning, gemensam CMS-mall eller branschnorm"
- "mediahusens beslut skapar informations-asymmetri" → "konsistent med en informations-asymmetri" (+ EU AI Act Recital 105 / DSM 4(3)-referens)
- Pull quote "Svenska topp-sajter ligger 50 % efter Fortune 500" → "halva Fortune 500-takten — i en annan urvalskontext"

**A11y (WCAG 2.2 AA — Conditional Pass → Pass):**
- `lang="sv"` på `[data-report]`-root
- "82 dgr" → "82 dagar" (VoiceOver läste "deegeear")
- Global `:focus-visible` outline för alla länkar/knappar inom data-report
- `aria-current="location"` på aktiv TOC-länk
- `aria-hidden` på decorative bar-tracks i DataBar
- `aria-live="polite"` confirmation när citat kopieras
- Touch-targets: share-länkar `space-y-3`, pioneer-länkar `min-h-[28px] py-1`, TOC `py-2`
- `<h2 className="sr-only">Sammanfattning</h2>` så deep-link target har heading
- Hero meta-dl: `opacity-60` → `opacity-85` (var under AA-kontrast)
- TOC outer `<aside>` har `aria-label="Innehållsförteckning och delning"`

**Verified live** via preview tool:
```json
{ rootLang: "sv", sammHeadingExists: true,
  heroStatAriaLabel: "82 dagar",
  tocActiveText: "00Sammanfattning", tocAsideExists: true,
  pulseQuoteLiveRegions: 3 }
```

## Vad som finns på plats

### Sidor

| URL | Status |
|---|---|
| `/rapport` | Hub-sida med rapport-lista. Klar. |
| `/rapport/q1-2026` | Hela rapporten som webpage. Klar. |

### Komponenter (nya) — `components/report/`

- `Eyebrow.tsx` — numrerad mono-uppercase eyebrow ("01 — POLICY-VAKUUMET")
- `Hero.tsx` — title (ReactNode för multi-line rytm) + giant stat block
- `KeyFindings.tsx` — 4-cells grid med nyckeltal under hero
- `SectionAnchor.tsx` — sektion-header med eyebrow + h2 + subtitle + rule
- `DataBar.tsx` — horizontellt bar-chart, en accent-färg, animerat in via IntersectionObserver
- `PullQuote.tsx` — serif italic citat med kopiera-knapp
- `Prose.tsx` — body-typografi (18px/1.7, max 64ch)
- `ReadingProgress.tsx` — pure-CSS scroll-progress-bar (scroll-driven animation)
- `StickyToc.tsx` — desktop sticky table-of-contents med IntersectionObserver
- `MetaBar.tsx` — end-of-article meta-block (authors, license, DOI, citation)

### Globalt — `app/globals.css`

`[data-report]` block med:
- Light editorial theme (warm paper #FBFAF7 + deep ink #1C1815)
- Brand red #9C2F18 (deeper than scanner-red för long-form)
- 3 easing-kurvor: `--ease-out-expo`, `--ease-out-quint`, `--ease-in-out-quad`
- Pure-CSS scroll-progress via `animation-timeline: scroll(root block)` (Safari < 17: graceful fallback)
- `prefers-reduced-motion`-stöd

## Reviewer-feedback (4 personas, parallellt)

### 1. Skeptisk journalist (Computer Sweden / Breakit-profil)

**Verdict: covers it.** Headline-vinkel: *"Skatteverket har ingen AI-policy — 82 dagar innan EU:s AI Act"*. Ringer IMY/Digg samma dag.

**Pushar tillbaka på:**
- Apples-to-oranges Sverige vs Fortune 500 (olika sampling-metodik) — **fixat: hedge tillagd**
- N=6 myndigheter är anekdot, inte urval — **delvis fixat: subtitle förtydligat att det är stora myndigheter, inte hela urvalet**
- "DOI pending" på publiceringsdag är röd flagga — **fortsatt issue, behöver Zenodo-upload**
- "Bonnier blockerar uppifrån" — kausalitet utan källa — **mjukat: "publication-portfölj-mönster"**

### 2. CTO på mid-size svensk SaaS

**Verdict: forwards to marketing, ja. Forwards to CEO med en-pager.**

**Sakn­ar:**
- Före/efter-data ("got X% more AI-referred traffic") — **inte fixat: kräver Q2-uppföljning**
- Exempel `/llms.txt`-block för copy-paste — **ej tillagd ännu** (kandidat för v1.1)
- Risk-numbers för inaction — **inte fixat: vi har inte den data publikt**

**3 delningsbara citat hen plockade:**
1. *"Skatteverket har ingen AI-policy. Bahnhof har det. Bonnier blockerar."* (hero — perfect tweet)
2. *"Sex av sex stora svenska myndighetssajter har inga regler alls för AI-agenter."*
3. *"Resonemanget från SaaS-sidan: en kund som hittar oss via ChatGPT är en kund."*

### 3. Compliance officer (svensk storbank)

**Verdict: data citerbar med reservation. Framing inte board-citerbar utan tre reframings.**

**Tre kritiska fixar:**
1. **"EU AI Act Article 50 mandaterar inte llms.txt"** — explicit klargörande behövs. **FIXAT: hero-stat-label + sektion 01 har nu explicit disclaimer**
2. **"0/6 myndigheter har ingen AI-policy"** är factually contestable (Skatteverket har interna AI-policys). **FIXAT: omformulerat till "publicerar ingen maskinläsbar AI-vägledning för agenter"** i hero, key findings, section title, pull quote
3. **"49 % efter Fortune 500"** är apples-to-oranges. **FIXAT: dampened till "ungefär hälften så långt fram", explicit "försiktig läsning"-callout tillagd**

**Andra punkter:**
- "Bonnier blockerar" defensibel men reduktiv — robots.txt-blockering är legitimt enligt EU AI Act Recital 105 / DSM 4(3). **Befintlig text säger redan "Det är inte fel. Det är ett legitimt affärsval."** — nuvarande OK.
- Tone: "rapportens politiska sticker" och "De accepterar tyst all AI-skrapning" var problematiska. **FIXAT: "politiska sticker" borttaget, citat omformulerat.**
- Tranco-redistribution: verifiera research-exempt. **Ej än verifierat** — TODO innan publicering.

### 4. Senior design-kritiker (Stripe Press / Anthropic / NYT-bench)

**Score: 7,6 / 10. Ovan Linear blog, parity mid-tier Stripe Press, under Anthropic.**

**Vad som funkar:**
- Single-accent röd discipline (90% rätt — en break: TOC active rule var samma röd utan att numret colored)
- DataBar single-accent rule ("only GPTBot in red")
- `/llms.txt` rendered i Mono inom Serif prose
- 64-72px sektion-gaps, generös TOC-margin
- Restrained pull quote treatment

**Vad som fixades:**
- Hero eyebrow → H1 drop var 32px (för tight) — **FIXAT: nu 56px+ (mt-14 → mt-16 → mt-20)**
- "Bonnier" opacity 50% var för light, tappade hierarki — **FIXAT: nu 65% (mer vikt än lede)**
- DataBar caption + source samma viktning — **FIXAT: caption nu foreground/medium, source muted/80**
- DataBar numerals var oklart — **FIXAT: nu definitivt JetBrains Mono tabular**
- Sticky TOC active-state: numret förlorade vs rule — **FIXAT: aktiv "02" nu primary röd**
- Mobile "AI-policy" delade vid bindestreck — **FIXAT: nbsp-hyphen + whitespace-nowrap span**

**Vad som ej är fixat (medvetet eller pending):**
- Hero stat-baseline-alignment med sista headline-line — kräver större refactor, tar Q1.1
- Pull quote copy button på desktop hover bara — redan opacity-0 + group-hover, men på touch är den alltid synlig (avsiktligt för mobil)
- "PÅ DENNA SIDA"-label storlek — kvar som är, designkritikern flaggade subjektivt

## Verifierat lokalt

- ✅ `npx tsc --noEmit` passes (no type errors)
- ✅ `npm run build` passes (44 routes, `/rapport/q1-2026` = 2.16 kB / 137 kB First Load JS)
- ✅ Desktop hero (1440×900) — clean three-line gradient + 82dgr right-aligned
- ✅ Mobile hero (390×844) — stack med 82dgr, "AI-policy" stays together
- ✅ Sticky TOC tracks active section via IntersectionObserver
- ✅ Scroll-progress-bar uppe (CSS-only, scroll-driven animation)
- ✅ DataBar fyller in när scroll når den (IntersectionObserver, threshold 0.4)
- ✅ MetaBar bottom (authors, license, DOI, citation, source)
- ✅ Share-länkar i sidebar (X, LinkedIn, CSV-data download)

## Inte gjort (medvetet)

- **Inte pushad till git remote** — per din instruktion ("inte pisha till live")
- **Inga `articles/research`-läsningar för v1.1** — håller mig till v1-content omramat
- **Ingen Zenodo DOI** — kräver upload-akt separat
- **Ingen press-pitch eller embargo-mejl** — kommer i nästa session
- **Pre-clear Tranco redistribution** — kvar att verifiera

## Vad du behöver göra själv (efter att du tittat)

1. **Öppna `http://localhost:3006/rapport/q1-2026`** — dev-server kör i bakgrunden
2. **Läsa igenom v2-content** — strukturen är: Hero → 5 nyckeltal → §01 Policy → §02 SaaS vs Media → §03 Sverige vs Fortune 500 → §04 Sektor → §05 19 pionjärer → §06 Metod
3. **Beslut: ska vi pre-warning Skatteverket/Försäkringskassan/Bonnier press 48h innan publicering?** (Compliance officer-rekommendation)
4. **Beslut: vill du att jag pushar PR till GitHub?** (efter ditt OK)
5. **Beslut: ska jag skriva pressrelease + Zenodo-deposition + Linear-issues för v1.1?**

## Filer ändrade

```
NEW    app/rapport/page.tsx                  (hub)
NEW    app/rapport/q1-2026/page.tsx          (rapport — 600+ rader)
NEW    components/report/Eyebrow.tsx
NEW    components/report/Hero.tsx
NEW    components/report/KeyFindings.tsx
NEW    components/report/SectionAnchor.tsx
NEW    components/report/DataBar.tsx
NEW    components/report/PullQuote.tsx
NEW    components/report/Prose.tsx
NEW    components/report/ReadingProgress.tsx
NEW    components/report/StickyToc.tsx
NEW    components/report/MetaBar.tsx
EDIT   app/globals.css                       (+ [data-report] block, scroll-progress keyframe)
```

## Skärmavbilder (för referens)

```
q1-v3-desktop-hero.png       — final desktop hero (1440px)
q1-v3-mobile-hero.png        — final mobile hero (iPhone 14)
q1-v3-databar.png            — DataBar med correct hierarchy
q1-v3-fortune500.png         — Fortune 500 section + försiktig läsning
q1-desktop-bottom.png        — MetaBar slut-av-artikel
q1-desktop-pioneers.png      — sektor-sektion
q1-hub.png                   — /rapport hub
```
