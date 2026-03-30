// app/api/notify/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, domain } = await req.json() as { email?: string; domain?: string };
    if (!email || !domain) {
      return NextResponse.json({ error: "email and domain required" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && key) {
      await fetch(`${url}/rest/v1/notify_signups`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ email, domain, created_at: new Date().toISOString() }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // always succeed client-side
  }
}
