// app/api/inngest/route.ts
//
// Inngest function registry handler. This is the URL Inngest calls to
// (a) discover which functions exist, and (b) deliver events that trigger
// them. Each function we want Inngest to manage is imported and passed to
// the `serve` adapter.
//
// In Vercel: set INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY in env vars,
// then add the Inngest "Vercel Integration" so it knows our deploy URL.

import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { retentionCleanup } from "@/inngest/cron-retention";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [retentionCleanup],
});
