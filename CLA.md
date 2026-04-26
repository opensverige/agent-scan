# Contributor License Agreement

> Kort version: när du skickar en pull request bekräftar du att din kod kan användas under projektets licens, och att vi får dual-licensa den om vi någon gång erbjuder en kommersiell licens.

## Varför

Projektet ligger under [Functional Source License (FSL-1.1-MIT)](LICENSE). FSL skyddar mot att andra startar konkurrerande managed-tjänster ovanpå vår kod under två år, varefter koden auto-konverterar till MIT.

För att vi ska kunna:
- erbjuda en kommersiell licens till företag som behöver kringgå FSL:s "Competing Use"-klausul,
- och hålla projektet juridiskt ren-att-säljas i framtiden,

behöver vi tydligt veta att alla kodbidrag står under samma villkor.

## Vad du intygar genom en pull request

När du öppnar en PR mot detta repo bekräftar du att:

1. **Du äger upphovsrätten till den kod du bidrar med**, eller har explicit tillstånd från upphovsrättsinnehavaren att licensiera den.
2. **Din kod licensieras under FSL-1.1-MIT** (samma som resten av projektet).
3. **Copyright-innehavarna (för närvarande Felipe och Gustaf Garnow, framtida AB eller acquirer) får dual-licensa din kod** under valfri licens (inklusive kommersiella licenser) vid framtida behov, utan att meddela dig.
4. **Du frånsäger dig inga moraliska rättigheter eller upphovsrätt** — du behåller copyright, men beviljar oss en bred licens att använda bidraget.

Detta är samma modell som Sentry, Linear, MariaDB och Vercel använder.

## Hur du signerar

Inget formulär att fylla i. Lägg till denna rad i din PR-beskrivning eller commit-meddelande:

```
Signed-off-by: Your Name <your.email@example.com>
```

Det räcker. Vi tolkar `Signed-off-by` som accept av denna CLA — samma konvention som Linux-kärnan och Docker.

## Frågor

Tveksam? Maila info@opensverige.se innan du skickar PR. Bättre att fråga än att senare upptäcka att din kod inte kan inkluderas.
