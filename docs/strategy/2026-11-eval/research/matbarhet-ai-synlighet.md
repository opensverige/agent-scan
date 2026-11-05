# Research · Går AI-synlighet att mäta ärligt? (läge 2026-11-05)

Insamlat via webbsök 2026-11-05. Direkthämtning blockerad i miljön, allt bygger på sökresultatens utdrag. De flesta branschkällor säljer själva AI-synlighetsmätning. 2026 års arXiv-artiklar är lästa som abstracts, inte fulltext.

## 1. Variation mellan körningar

- **SparkToro** (Fishkin & O'Donnell, jan 2026; O'Donnell jobbar på Gumshoe.ai som säljer mätning, vilket redovisas). 600 frivilliga körde 12 promptar 2 961 gånger i ChatGPT, Claude och Google AI. Samma varumärkeslista kom tillbaka i färre än 1 av 100 körningar, i samma ordning ungefär 1 av 1 000. Frekvens bar ändå signal: toppvarumärken dök upp i 55–77 % av svaren. Rekommendation: släpp "rank" som mått, kör varje prompt 60–100 gånger. ([SparkToro](https://sparktoro.com/blog/new-research-ais-are-highly-inconsistent-when-recommending-brands-or-products-marketers-should-take-care-when-tracking-ai-visibility/))
- **Evertune** (leverantör): felmarginal ±27 procentenheter vid 5 körningar, ±12 vid 12, ±6 vid 100. ([Evertune](https://www.evertune.ai/resources/insights-on-ai/how-many-repetitions-of-a-single-prompt-does-it-take-to-understand-your-ai-visibility))
- **Akademiskt:** "Don't Measure Once" (Schulte m.fl., apr 2026, [arXiv 2604.07585](https://arxiv.org/abs/2604.07585)); "Dice Roll Method" (Żatuchin, sep 2026, [arXiv 2609.04047](https://arxiv.org/abs/2609.04047)), ingen standard för antal körningar; Martinez översikt av 45 studier (jul 2026, [arXiv 2607.14035](https://arxiv.org/abs/2607.14035)): synlighet varierar med motor, datum, plats, formulering och om sökning faktiskt kördes.
- **GEO-artikeln** (Aggarwal m.fl., KDD 2024, [arXiv 2311.09735](https://arxiv.org/abs/2311.09735)): "upp till ~40 %" mer synlighet, men mätt på dokument som redan var hämtade. 2026-översikten kallar det ett konfigurationsspecifikt maximum.
- **API ≠ app:** ChatGPT API vs app delade 24 % av varumärkena och 4 % av källorna (Surfer, dec 2025, [länk](https://surferseo.com/blog/llm-scraped-ai-answers-vs-api-results)); 6–12 % enligt Brandlight (leverantör, [länk](https://research.brandlight.ai/ui-vs-api.html)).

## 2. Hur motorerna väljer källor

- **ChatGPT:** OpenAIs dokumentation säger att sajter som blockerar OAI-SearchBot inte visas i ChatGPT-sökets svar, förutom rena navigeringslänkar. Bing-beroendet bygger på andrahandsuppgifter.
- **Claude:** Brave lades till i Anthropics underbiträdeslista mars 2025 ([TechCrunch via Yahoo](https://finance.yahoo.com/news/anthropic-appears-using-brave-power-170703042.html)), ej officiellt bekräftat som sökbackend.
- **Perplexity:** egen crawler (PerplexityBot) och eget index.
- **Google AI Overviews / AI Mode:** Google säger att det räcker att sidan är indexerad och kan visas med snippet ([Google](https://developers.google.com/search/docs/appearance/ai-features)).
- **Faktorer på sajten (bara korrelation):** varumärkesomnämnanden på webben korrelerar ρ=0,664 med AI Overview-synlighet, bakåtlänkar 0,218 ([Ahrefs](https://ahrefs.com/blog/ai-overview-brand-correlation/)). Wikipedia och Reddit dominerar citerade källor ([SER](https://www.seroundtable.com/chatgpt-google-aio-sources-39578.html)). Schema-markup: ett kontrollerat test på 1 885 sidor fann ingen mätbar effekt (andrahandsuppgift). **llms.txt, färskhet och "svar först"-format: inga kontrollerade bevis.**

## 3. Bottar per leverantör

| Leverantör | Träning | Sök/index | Användarstyrd hämtning | Dokumentation |
|---|---|---|---|---|
| OpenAI | GPTBot | OAI-SearchBot | ChatGPT-User (robots.txt gäller kanske inte) | [OpenAI](https://developers.openai.com/api/docs/bots) |
| Anthropic | ClaudeBot | Claude-SearchBot | Claude-User | [Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) |
| Perplexity | (säger att de inte tränar) | PerplexityBot | Perplexity-User (ignorerar oftast robots.txt) | [Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) |
| Google | Google-Extended (token) | Googlebot (styr AI Overviews/AI Mode) | | [Google](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers) |
| Apple | Applebot-Extended (token) | Applebot | | [Apple](https://support.apple.com/HT204683) |
| Meta | meta-externalagent | | meta-externalfetcher | [Meta](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers) |
| Common Crawl | CCBot | | | [CC](https://commoncrawl.org/faq) |

**Påverkar blockering av träningsbottar AI-sökets svar?** Enligt varje leverantörs dokumentation: nej. Blockering av sökbottarna gör det. Undantag: Google-Extended stoppar grundning i Gemini-appen; Metas agent täcker både träning och indexering; Cloudflare blockerar kända AI-crawlers som standard på nya domäner sedan 1 juli 2025 (andrahandsuppgift), en vanlig tyst orsak till osynlighet.

## 4. Gratisverktyg som redan finns

- **HubSpot AI Search Grader:** varumärke + kategori, kollar ChatGPT, Perplexity, Gemini. "One-time snapshot, no account". ([HubSpot](https://www.hubspot.com/ai-search-grader))
- **Ahrefs Free AI Visibility Checker:** ingen inloggning, ChatGPT, Gemini, Perplexity, Copilot, AI Overviews. Leder till betalda Brand Radar. ([Ahrefs](https://ahrefs.com/free-ai-visibility))
- **Semrush AI Search Visibility Checker:** ingen inloggning, ~3 kollar per dag. ([Semrush](https://www.semrush.com/free-tools/ai-search-visibility-checker/))
- **Mangools AI Search Grader:** gratis, 7–8 modeller. ([Mangools](https://mangools.com/ai-search-grader))
- **Otterly GEO Audit:** crawlbarhet/innehåll, kräver konto. ([Otterly](https://help.otterly.ai/what-does-the-geo-audit-do))
- **Inget av dem redovisar antal körningar eller konfidensintervall.**

## 5. Kostnad

- Anthropic webbsök: $10 per 1 000 sökningar plus tokens. OpenAI `web_search`: $10 per 1 000 anrop plus tokens ([OpenAI](https://developers.openai.com/api/docs/pricing)). Perplexity Sonar-API avvecklat 27 sep 2026 till förmån för Agent API (andrahandsuppgift, [länk](https://llmgateway.io/blog/perplexity-sonar-api-retirement)). Google AI Overviews/AI Mode har inget officiellt API.
- Grov uppskattning: $0,01–0,07 per prompt och motor och körning.

## Vad en engångskoll ärligt kan påstå

1. **Förutsättningar (hög säkerhet, deterministiskt):** robots.txt per bot med sök och träning åtskilda, CDN/WAF-blockering, `noindex`/`nosnippet`, innehåll som bara finns med JavaScript.
2. **Vad AI vet om företaget:** "Vad är [företag]?", är beskrivningen korrekt? Relativt stabilt, och ett fel ger ägaren något konkret att åtgärda.
3. **Kategorirekommendationer:** bara som märkt stickprov, "nämnd i k av N svar (motor, API, datum)", konkurrenternas andel i samma stickprov, plus intervall.

**Får inte påstås:** rank eller position, ett exakt 0–100-betyg, att resultatet är "vad ChatGPT-användare ser", att schema eller llms.txt fixar synlighet.

**Design som följer av detta:** promptar genererade från sajten, flera körningar per prompt, poolad andel med Wilson-intervall, råa svar och källor synliga, tidsstämpel och "ögonblicksbild"-etikett. Visa resultatet utan e-postspärr; be om e-post för 30-dagars uppföljning, där variansen är ett ärligt skäl.
