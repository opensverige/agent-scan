#!/usr/bin/env -S npx tsx
// scripts/issue-key.ts
//
// Issue a new API key for the alpha. Reads Supabase creds from process env
// (use `tsx --env-file=.env.local` to load .env.local automatically).
// Outputs the plaintext key ONCE — store it safely.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/issue-key.ts \
//     --name "Jane @ Acme" --email "jane@acme.com" --tier hobby \
//     [--env test|live] [--notes "..."]
//
// Output:
//   osv_test_xxxxxxxxxxxxxxxxxxxxxxxx
//   ↑ deliver this to the user via DM. We never see it again after this.

import { generateApiKey, type ApiKeyTier } from "../lib/api-keys";

interface Args {
  name: string;
  email?: string;
  tier: ApiKeyTier;
  env: "test" | "live";
  notes?: string;
}

function parseArgs(argv: string[]): Args {
  const out: Partial<Args> = { tier: "hobby", env: "test" };
  for (let i = 2; i < argv.length; i += 2) {
    const flag = argv[i];
    const val = argv[i + 1];
    if (!val) throw new Error(`Missing value for ${flag}`);
    if (flag === "--name") out.name = val;
    else if (flag === "--email") out.email = val;
    else if (flag === "--tier") {
      if (val !== "hobby" && val !== "builder" && val !== "pro") throw new Error(`Invalid tier: ${val}`);
      out.tier = val;
    } else if (flag === "--env") {
      if (val !== "test" && val !== "live") throw new Error(`Invalid env: ${val}`);
      out.env = val;
    } else if (flag === "--notes") out.notes = val;
    else throw new Error(`Unknown flag: ${flag}`);
  }
  if (!out.name) throw new Error("Missing --name");
  return out as Args;
}

async function main() {
  const args = parseArgs(process.argv);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY");
  }

  const issued = generateApiKey(args.env);

  const res = await fetch(`${supabaseUrl}/rest/v1/api_keys`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      key_hash: issued.hash,
      key_prefix: issued.prefix,
      tier: args.tier,
      name: args.name,
      email: args.email,
      notes: args.notes,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`Supabase insert failed: ${res.status} ${err.slice(0, 300)}`);
  }
  const rows = await res.json() as Array<{ id: string; created_at: string }>;
  const row = rows[0];

  console.log("");
  console.log(`Key issued for: ${args.name} (${args.tier})`);
  console.log(`Internal id:    ${row.id}`);
  console.log(`Created:        ${row.created_at}`);
  console.log("");
  console.log("PLAINTEXT KEY — copy now, we cannot recover it:");
  console.log(`  ${issued.plaintext}`);
  console.log("");
  console.log("Test it:");
  console.log(`  curl -X POST https://agent.opensverige.se/api/v1/scan \\`);
  console.log(`    -H "Authorization: Bearer ${issued.plaintext}" \\`);
  console.log(`    -H "Content-Type: application/json" \\`);
  console.log(`    -d '{"domain":"klarna.com"}'`);
  console.log("");
}

main().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
