import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, unknown>;

  const trigger = (body.triggerEvent ?? body.trigger ?? "UNKNOWN") as string;
  const payload = (body.payload ?? body) as Record<string, unknown>;

  const title = (payload.title ?? payload.eventTitle ?? "Nytt möte") as string;
  const start = payload.startTime as string | undefined;
  const attendees = payload.attendees as Array<{ name?: string }> | undefined;
  const attendee = attendees?.[0]?.name ?? "Okänd";
  const location = payload.location as string | undefined;

  const content =
    `**${title}**\n` +
    `${attendee}\n` +
    (start ? `${new Date(start).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}\n` : "") +
    (location ? `${location}\n` : "") +
    `Event: ${trigger}`;

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "DISCORD_WEBHOOK_URL not set" }, { status: 500 });
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  return NextResponse.json({ ok: true });
}
