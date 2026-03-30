// lib/check-context.ts
import type { CheckId } from './checks';

export interface CheckContext {
  stat: string;
  source: string;
  action: string;
}

export const CHECK_CONTEXT: Record<CheckId, CheckContext> = {
  robots_ok: {
    stat: "83% av företag planerar att deploya AI-agenter. Om din robots.txt blockerar dem, utestänger du framtidens trafik.",
    source: "Cisco AI Readiness Index 2025",
    action: "Se till att robots.txt inte blockerar AI-agenter som GPTBot och ClaudeBot.",
  },
  sitemap_exists: {
    stat: "AI-system kräver strukturerade, konsekventa format för att fungera. Utan sitemap navigerar agenter blint.",
    source: "Postman, The 90-day AI Readiness Playbook",
    action: "Lägg till sitemap.xml så agenter kan navigera din sajt.",
  },
  llms_txt: {
    stat: "AI-agenter förlitar sig på strukturerad metadata och maskinläsbar dokumentation. Utan llms.txt vet de inte vad du erbjuder.",
    source: "Postman, The 90-day AI Readiness Playbook",
    action: "Lägg till /llms.txt som beskriver ditt API och dina tjänster för AI-agenter.",
  },
  privacy_automation: {
    stat: "71% av stora företag har AI-agenter med direkt åtkomst till affärssystem, men bara 16% styr den åtkomsten. Din integritetspolicy måste adressera detta.",
    source: "Gravitee, The AI Agent Governance Gap 2026",
    action: "Uppdatera integritetspolicyn med info om automatiserad behandling (GDPR Art. 22).",
  },
  cookie_bot_handling: {
    stat: "60% av organisationer förlitar sig fortfarande på autentiseringsmönster byggda för mänskliga workflows — sessionhantering, lösenord, consent-flöden. Agenter behöver andra lösningar.",
    source: "Gravitee, The AI Agent Governance Gap 2026",
    action: "Se över hur din cookielösning hanterar icke-mänskliga besökare.",
  },
  ai_content_marking: {
    stat: "EU AI Act ställer krav på märkning av AI-genererat innehåll. Reglerna för högrisk-system träder i full kraft 2026 med böter upp till 7% av global omsättning.",
    source: "Gravitee, The AI Agent Governance Gap 2026",
    action: "Förbered för EU AI Act — märk AI-genererat innehåll maskinläsbart (Art. 50).",
  },
  api_exists: {
    stat: "Bara 13% av företag globalt är fullt AI-redo. De som investerar i infrastruktur — inklusive publika API:er — ligger längst före.",
    source: "Cisco AI Readiness Index 2025",
    action: "Skapa ett publikt API — utan det kan ingen agent interagera med ditt system.",
  },
  openapi_spec: {
    stat: "58% av utvecklare förlitar sig på intern dokumentation för att lära sig API:er. Utan maskinläsbar spec kan varken människor eller agenter bygga mot ditt system effektivt.",
    source: "Postman, State of API Report 2024",
    action: "Publicera en OpenAPI-spec så agenter och builders kan mappa ditt API automatiskt.",
  },
  api_docs: {
    stat: "Organisationer som löst skalbar API-samarbete först är de som lyckas med AI. Dokumentation är grundstenen.",
    source: "Postman, The 90-day AI Readiness Playbook",
    action: "Publicera API-dokumentation — utan docs kan ingen bygga mot ditt system.",
  },
  mcp_server: {
    stat: "75% av organisationer har redan hittat osanktionerade AI-verktyg i sina miljöer. MCP ger dig kontroll över hur agenter kopplar in sig.",
    source: "Gravitee, The AI Agent Governance Gap 2026",
    action: "Vi hittade ingen MCP-koppling till den här domänen — agenter kan inte nå er direkt. Utforska om MCP är rätt steg för er integration.",
  },
  sandbox_available: {
    stat: "Bara 34% av organisationer anser att sin IT-infrastruktur är fullt anpassningsbar för AI-projekt. En sandbox sänker tröskeln för agent-utvecklare.",
    source: "Cisco AI Readiness Index 2025",
    action: "Erbjud en sandbox/testmiljö så builders kan testa utan att påverka produktionsdata.",
  },
};

export const SEVERITY_CONTEXT = {
  critical: {
    text: "Dessa problem blockerar AI-agenter eller skapar juridisk risk. 71% av stora företag har deployat AI-agenter med direkt åtkomst till affärssystem — men bara 16% styr den åtkomsten effektivt.",
    source: "Gravitee, The AI Agent Governance Gap 2026",
  },
  important: {
    text: "Dessa brister begränsar hur AI-agenter kan interagera med ditt system. Postmans 90-dagars playbook rekommenderar att API-grunderna — dokumentation, spec, discovery — löses inom de första 30 dagarna.",
    source: "Postman, The 90-day AI Readiness Playbook",
  },
  info: {
    text: "Rekommendationer som förbättrar agent-upplevelsen men inte blockerar.",
    source: null,
  },
} as const;
