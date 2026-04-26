// inngest/client.ts
//
// Single Inngest client instance. Required env vars (see .env.example):
//
//   INNGEST_EVENT_KEY    — for sending events to Inngest cloud
//   INNGEST_SIGNING_KEY  — for verifying incoming webhook calls
//
// In dev, Inngest runs locally via `npx inngest-cli dev` — no keys needed.
// In prod (Vercel), set both env vars.
//
// Functions registered with this client are exposed via the
// app/api/inngest/route.ts handler (Next.js route serving the function
// registry to Inngest).

import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "agent-opensverige",
  name: "agent.opensverige",
});
