# Studie: vem rekommenderar AI för lokala tjänster? Plan, 7 november 2026

> Följer rekommendationen i [02-behovs-verktyget.md](02-behovs-verktyget.md): en svensk studie i stället för 14-dagarstestet. Den här filen är planen. Inget är kört än.

## Vinkeln

Klota mätte 189 e-handlare. Vi mäter **lokala tjänsteföretag**, och vi visar **hur mycket svaren ändras** när man ställer samma fråga igen. Det har ingen svensk aktör publicerat.

Arbetsrubrik (ett av två förslag, väljs efter resultatet):
- "Fråga AI om en elektriker tio gånger. Du får tio olika svar."
- "AI nämner sällan samma redovisningsbyrå två gånger."

Rubriken väljs först när siffrorna finns. Blir svaren stabila är det också en nyhet.

## Upplägg

| | |
|---|---|
| Branscher | Redovisningsbyrå, elektriker, rörmokare, tandläkare, bilverkstad |
| Städer | Stockholm, Göteborg, Malmö |
| Frågor | En per bransch, samma ordalydelse i alla städer |
| Körningar | 10 per fråga, alltså 150 svar |
| Motor | Claude (`claude-opus-5-5`, låg effort) med webbsök, plats satt till staden |
| Definition | [data/visibility/studies/tjanster-2026-11.json](../../../data/visibility/studies/tjanster-2026-11.json) |

Frågorna är skrivna som folk skriver i en chatt, till exempel: "Jag har flyttat till Malmö och behöver en ny tandläkare. Vilken klinik rekommenderar du?"

## Vad vi mäter

Per bransch och stad:
- **Antal olika företag** som nämns totalt, och hur många ett svar nämner i snitt.
- **Hur många som bara nämns en gång.** Det är det tydligaste måttet på slump.
- **Överlapp mellan två svar.** Andelen gemensamma namn, i snitt över alla par av svar (Jaccard).
- **Förstanamnet.** Hur ofta samma företag nämns först.
- **Per företag:** nämnt i k av n svar, med 95 % intervall. Ingen placering och ingen poäng.
- **Källor:** vilka sajter svaren bygger på, till exempel Reco, Hitta eller Google. Det här är det handlingsbara för ett litet företag.

Namn slås ihop när bara bolagsform eller domän skiljer, till exempel "Bokio AB" och "bokio.se". Det sker i `lib/visibility/study.ts` och är testat.

## Så kör man

Kräver `ANTHROPIC_API_KEY` i `.env.local` och Node 22.

1. Se vad som skulle köras, utan kostnad:
   ```bash
   npx tsx --env-file=.env.local scripts/visibility-index.ts --study tjanster-2026-11 --dry-run
   ```
2. **Pilot:** en kategori, 10 svar. Läs den uppmätta kostnaden och svaren innan resten körs.
   ```bash
   npx tsx --env-file=.env.local scripts/visibility-index.ts --study tjanster-2026-11 --only redovisning-stockholm
   ```
3. Hela studien:
   ```bash
   npx tsx --env-file=.env.local scripts/visibility-index.ts --study tjanster-2026-11
   ```

Resultatet hamnar i `data/visibility/tjanster-2026-11-<datum>/`:
- `raw.json`: varje svar i fulltext, dess källor och vilka företag som lästes ut.
- `summary.json`: siffrorna ovan.
- `rapport.md`: ett första utkast i text.

Filerna skrivs om efter varje kategori. Kraschar körningen finns det som redan är betalt kvar.

**Kostnad:** grov gissning cirka 23 USD för 150 svar. Gissningen bygger på ungefär 25 000 tokens in per svar, eftersom sökresultaten räknas som input. Piloten ger den riktiga siffran, och skriptet skriver ut den. Priser: Opus 5.5 kostar 4 USD in och 20 USD ut per miljon tokens, webbsök 10 USD per 1 000 sökningar. Kontrollera priserna innan körning.

## Kontroller före publicering

1. **Läs piloten för hand.** Stämmer utläsningen av företagsnamn med vad svaren faktiskt säger? Om inte, rätta prompten i `extractRecommended` innan resten körs.
2. **Finns företagen?** Slå upp ett stickprov, 20 namn, på Hitta eller Allabolag. Om AI hittar på företag blir det en egen rubrik. Det ska i så fall stå med siffror, inte anekdoter.
3. **Inga personuppgifter i det publicerade.** Enskilda firmor kan heta som ägaren. Rådata publiceras bara med svaren som AI gav, utan att vi lägger till något om personer.
4. **Metodstycke i rapporten:** en motor, en dag, tio svar per fråga, plats via API och inte en inloggad användare. Svaren i ChatGPT-appen kan skilja sig.

## Öppna frågor till Gustaf

1. **Bara Claude, eller ChatGPT också?** De flesta svenskar frågar ChatGPT. En studie som bara mäter Claude blir svagare som nyhet. ChatGPT kräver en OpenAI-nyckel och en ny klient i skriptet, men inget nytt beroende. Förslag: kör piloten på Claude först. Lägg till ChatGPT om variationen är intressant.
2. **Var publiceras den?** Förslag: opensverige.se-bloggen med rådata i repot, plus en tråd i Discord. Pitcha till Driva Eget eller Breakit för småföretagarvinkeln. Ehandel.se passar sämre, eftersom det inte är e-handel.
3. **Vem kör den?** Någon med API-nyckel lokalt. Två kvällar: en för pilot och kontroller, en för helkörning och text.

## Stoppkriterium

Samma som i 02: publicera inom två veckor. Om studien inte ger någon artikel, inga delningar utanför communityn och inga inkommande frågor, lägg ner agent.opensverige.se.
