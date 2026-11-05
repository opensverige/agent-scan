// app/synlighet/_components/VisibilityChecker.tsx
"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toolById } from "@/lib/community-tools";
import { cn } from "@/lib/utils";
import type { Analysis, AnswerRun, QuestionResult } from "@/lib/visibility/ask";
import type { TechCheck } from "@/lib/visibility/site";
import { formatInterval, summarize, type VisibilitySummary } from "@/lib/visibility/stats";

interface PlanView {
  company: string;
  offering: string;
  market: string;
  facts: string[];
  questions: string[];
  /** Answer runs per question (index 0 is the entity question). */
  runs: number[];
}

interface PlanResponse {
  domain: string;
  checks: TechCheck[];
  plan: PlanView | null;
  notice?: string;
  token?: string;
  engine?: { model: string; label: string };
  checkedAt?: string;
  error?: string;
}

type Phase = "idle" | "planning" | "asking" | "done" | "error";
type Slot = { status: "pending" } | { status: "done"; result: QuestionResult } | { status: "failed" };

const CONSENT_TEXT =
  "Jag vill att OpenSverige sparar min e-postadress för att skicka resultatet och, om jag kryssat i det, köra om mätningen under 30 dagar eller kontakta mig. Jag kan när som helst be er radera den.";

function cleanDomain(input: string): string {
  return input.trim().replace(/^https?:\/\//i, "").replace(/[/?#].*$/, "").toLowerCase();
}

function looksLikeDomain(d: string): boolean {
  return /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(d);
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const STATUS_STYLE: Record<TechCheck["status"], { dot: string; label: string }> = {
  pass: { dot: "bg-success", label: "OK" },
  warn: { dot: "bg-warning", label: "Kolla" },
  fail: { dot: "bg-destructive", label: "Problem" },
  unknown: { dot: "bg-muted-foreground/40", label: "Okänt" },
};

function TechChecks({ checks }: { checks: TechCheck[] }) {
  return (
    <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
      {checks.map(c => (
        <li key={c.id} className="flex gap-3 px-4 py-3.5">
          <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", STATUS_STYLE[c.status].dot)} aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold leading-snug">
              <span className="sr-only">{STATUS_STYLE[c.status].label}: </span>
              {c.label}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function CommunityNudge() {
  const tool = toolById("openaudit");
  if (!tool) return null;
  return (
    <section className="rounded-2xl border border-border px-5 py-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Gratis · Open source · Från communityn
      </p>
      <h2 className="mt-2 font-serif text-[24px] leading-tight">
        Bygger ni sajten själva? Granska koden också.
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {tool.name} kollar säkerhetshål, läckta nycklar, fart och tillgänglighet. Sedan får er AI listan att åtgärda.
        Det körs på er egen dator.
      </p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Kom igång med {tool.name} →
        </a>
        <Link href="/verktyg" className="text-muted-foreground hover:text-foreground">
          Fler gratis verktyg →
        </Link>
      </div>
    </section>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary"
      aria-hidden="true"
    />
  );
}

function QuestionCard({ question, slot, isEntity }: { question: string; slot: Slot; isEntity: boolean }) {
  const result = slot.status === "done" ? slot.result : null;
  const mentionedRuns = result ? result.runs.filter(r => r.mentioned).length : 0;
  return (
    <li className="rounded-2xl border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-medium leading-snug">
          <span className="mr-1.5 font-mono text-xs text-muted-foreground">{isEntity ? "Om er" : "Kundfråga"}</span>
          {question}
        </p>
        <div className="shrink-0 pt-0.5 text-xs font-semibold">
          {slot.status === "pending" && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Spinner /> Frågar
            </span>
          )}
          {slot.status === "failed" && <span className="text-muted-foreground">Fick inget svar</span>}
          {result && !isEntity && (
            <span className={mentionedRuns > 0 ? "text-success" : "text-destructive"}>
              Nämnd {mentionedRuns} av {result.runs.length}
            </span>
          )}
          {result && isEntity && result.entity && (
            <span
              className={cn(
                result.entity.accuracy === "correct" && "text-success",
                result.entity.accuracy === "partly" && "text-warning",
                (result.entity.accuracy === "wrong" || result.entity.accuracy === "unknown") && "text-destructive",
              )}
            >
              {{ correct: "Stämmer", partly: "Delvis rätt", wrong: "Fel", unknown: "Känner inte till er" }[result.entity.accuracy]}
            </span>
          )}
        </div>
      </div>

      {result && result.recommended.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Nämnde:{" "}
          {result.recommended.slice(0, 6).map((c, i) => (
            <span key={c.name} className={cn(c.isTarget && "font-semibold text-foreground")}>
              {i > 0 && ", "}
              {c.name}
            </span>
          ))}
        </p>
      )}

      {result && result.entity && result.entity.issues.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
          {result.entity.issues.map(issue => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}

      {result && result.runs.length > 0 && (
        <details className="mt-3 group">
          <summary className="cursor-pointer select-none text-xs font-semibold text-primary">
            Läs svaren ({result.runs.length})
          </summary>
          <div className="mt-3 space-y-4">
            {result.runs.map((run, i) => (
              <div key={i} className="rounded-xl bg-muted/50 px-3 py-3">
                <p className="mb-1 font-mono text-[11px] text-muted-foreground">
                  Svar {i + 1} · {run.mentioned ? "nämner er" : "nämner inte er"} · {run.searched ? "sökte på webben" : "sökte inte"}
                </p>
                <p className="whitespace-pre-line text-sm leading-relaxed">{run.text}</p>
                {run.sources.length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Källor: {[...new Set(run.sources.map(hostOf))].slice(0, 6).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </li>
  );
}

function Headline({ summary, done, company }: { summary: VisibilitySummary; done: boolean; company: string }) {
  if (summary.answers === 0) {
    return (
      <p className="text-base text-muted-foreground">
        {done ? "Vi fick inga svar från AI just nu. Försök igen om en stund." : "Väntar på de första svaren..."}
      </p>
    );
  }
  const share = summary.mentioned / summary.answers;
  const verdict =
    summary.mentioned === 0
      ? `När kunder frågar efter det ni säljer nämns inte ${company} alls i det här stickprovet.`
      : share < 0.3
        ? `${company} dyker upp ibland, men oftast får kunden andra namn.`
        : share < 0.7
          ? `${company} nämns i ungefär hälften av svaren. Det finns mer att hämta.`
          : `${company} nämns i de flesta svaren. Bra läge.`;
  return (
    <div>
      <p className="font-serif text-[clamp(34px,7vw,52px)] leading-[1.05] tracking-[-1px]">
        Nämnd i {summary.mentioned} av {summary.answers} svar
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Osäkerhet: den verkliga andelen ligger troligen mellan {formatInterval(summary.interval)}.{" "}
        {!done && "Fler svar kommer."}
      </p>
      <p className="mt-4 text-lg leading-relaxed">{verdict}</p>
    </div>
  );
}

function LeadForm({ token, domain, resultLine }: { token?: string; domain: string; resultLine: string }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [wantsCall, setWantsCall] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/synlighet/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, wantsMonitoring: true, wantsCall, token, domain, resultLine }),
      });
      if (res.ok) {
        setState("sent");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setMessage(body.error ?? "Något gick fel.");
      setState("error");
    } catch {
      setMessage("Något gick fel. Mejla info@opensverige.se så hjälper vi dig.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border-2 border-foreground bg-card px-5 py-5">
        <p className="font-serif text-2xl">Tack, mätningen är bokad.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Vi bekräftar till {email} inom två arbetsdagar, kör sedan samma frågor dagligen i 30 dagar och mejlar
          rapporten när den är klar. Inget nyhetsbrev.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border-2 border-foreground bg-card px-5 py-5">
      <p className="font-serif text-[26px] leading-tight">En koll är en ögonblicksbild. Vill du veta på riktigt?</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        AI-svar ändras från gång till gång, så ett stickprov kan slå åt båda hållen. Vi kör samma frågor varje dag i 30
        dagar och mejlar dig andelen svar där ni nämns, vilka som nämns istället och vad ni kan göra åt det. Gratis.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor="lead-email">E-postadress</label>
        <input
          id="lead-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="namn@foretaget.se"
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-[15px] outline-none focus:border-primary/50"
        />
        <Button type="submit" size="lg" disabled={!consent || state === "sending"}>
          {state === "sending" ? "Skickar..." : "Starta 30-dagarsmätning"}
        </Button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <input type="checkbox" className="mt-0.5" checked={consent} onChange={e => setConsent(e.target.checked)} />
        <span>{CONSENT_TEXT}</span>
      </label>
      <label className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <input type="checkbox" className="mt-0.5" checked={wantsCall} onChange={e => setWantsCall(e.target.checked)} />
        <span>Kontakta mig gärna för en genomgång av resultatet.</span>
      </label>
      {state === "error" && <p className="mt-3 text-sm text-destructive" role="alert">{message}</p>}
      <p className="mt-3 text-[11px] text-muted-foreground">
        <a href="/integritetspolicy" className="underline underline-offset-2">Integritetspolicy</a>
      </p>
    </form>
  );
}

export function VisibilityChecker() {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<PlanResponse | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const runId = useRef(0);

  const domain = cleanDomain(input);
  const canSubmit = looksLikeDomain(domain) && phase !== "planning" && phase !== "asking";

  const start = useCallback(async () => {
    const d = cleanDomain(input);
    if (!looksLikeDomain(d)) return;
    const myRun = ++runId.current;
    setPhase("planning");
    setError("");
    setPlan(null);
    setSlots([]);

    let data: PlanResponse;
    try {
      const res = await fetch("/api/synlighet/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: d }),
      });
      data = (await res.json()) as PlanResponse;
      if (!res.ok) {
        setError(data.error ?? "Något gick fel. Försök igen.");
        setPhase("error");
        return;
      }
    } catch {
      setError("Kunde inte nå servern. Försök igen.");
      setPhase("error");
      return;
    }
    if (myRun !== runId.current) return;
    setPlan(data);

    if (!data.plan || !data.token) {
      setPhase("done");
      return;
    }

    const questions = data.plan.questions;
    const runsPer = data.plan.runs;
    const token = data.token;
    setSlots(questions.map(() => ({ status: "pending" })));
    setPhase("asking");

    async function post<T>(url: string, payload: unknown): Promise<T | null> {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        return res.ok ? ((await res.json()) as T) : null;
      } catch {
        return null;
      }
    }

    // Every answer is its own request; a question is analysed once all of
    // its answers are in.
    await Promise.all(
      questions.map(async (question, index) => {
        const answers = await Promise.all(
          Array.from({ length: runsPer[index] ?? 1 }, (_, run) =>
            post<{ answer: AnswerRun | null }>("/api/synlighet/ask", { token, index, run }).then(r => r?.answer ?? null),
          ),
        );
        const runs = answers.filter((a): a is AnswerRun => a !== null);
        let slot: Slot = { status: "failed" };
        if (runs.length > 0) {
          const analysis = await post<Analysis>("/api/synlighet/analyze", {
            token,
            index,
            answers: runs.map(r => ({ text: r.text })),
          });
          const result: QuestionResult = {
            index,
            kind: index === 0 ? "entity" : "category",
            question,
            runs,
            recommended: analysis?.recommended ?? [],
            entity: analysis?.entity ?? null,
            failed: false,
          };
          slot = { status: "done", result };
        }
        if (myRun !== runId.current) return;
        setSlots(prev => prev.map((s, i) => (i === index ? slot : s)));
      }),
    );
    if (myRun === runId.current) setPhase("done");
  }, [input]);

  const results = useMemo(
    () => slots.flatMap(s => (s.status === "done" ? [s.result] : [])),
    [slots],
  );
  const summary = useMemo(() => summarize(results), [results]);
  const entity = results.find(r => r.kind === "entity")?.entity ?? null;
  const company = plan?.plan?.company ?? plan?.domain ?? domain;
  const techProblems = plan ? plan.checks.filter(c => c.status === "fail" || c.status === "warn").length : 0;
  const resultLine = `Nämnd i ${summary.mentioned} av ${summary.answers} svar; AI om företaget: ${
    entity ? entity.accuracy : "okänt"
  }; tekniska anmärkningar: ${techProblems}`;

  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pb-24">
      {/* Hero + input */}
      <section className="pt-14 sm:pt-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          AI-synlighetskollen · gratis · ingen inloggning
        </p>
        <h1 className="mt-4 font-serif text-[clamp(38px,8vw,64px)] font-normal leading-[1.04] tracking-[-1.5px]">
          Rekommenderar AI ditt företag?
        </h1>
        <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-muted-foreground">
          Vi ställer frågorna dina kunder ställer till AI, på svenska och från Sverige, och visar om ni nämns och vilka
          som nämns istället. Plus de tekniska hinder som gör att AI inte kan läsa er sajt.
        </p>

        <form
          className="mt-8 flex flex-col gap-2 rounded-2xl border border-border bg-card p-2.5 shadow-xl sm:flex-row"
          onSubmit={e => {
            e.preventDefault();
            if (canSubmit) void start();
          }}
        >
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2.5 focus-within:border-primary/40">
            <span className="shrink-0 font-mono text-xs text-muted-foreground">https://</span>
            <label htmlFor="domain" className="sr-only">Din domän</label>
            <input
              id="domain"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="foretaget.se"
              autoComplete="url"
              spellCheck={false}
              className="min-w-0 flex-1 border-none bg-transparent font-mono text-[15px] font-medium outline-none placeholder:text-muted-foreground/40"
            />
          </div>
          <Button type="submit" size="lg" disabled={!canSubmit}>
            {phase === "planning" || phase === "asking" ? "Kollar..." : "Kör kollen"}
          </Button>
        </form>
        <p className="mt-3 font-mono text-[11px] text-muted-foreground">
          Tar ungefär en minut. Vi sparar domänen och en hashad IP i 90 dagar för att stoppa missbruk.
        </p>
      </section>

      {phase === "error" && (
        <p className="mt-8 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm" role="alert">
          {error}
        </p>
      )}

      {phase === "planning" && (
        <div className="mt-12 flex items-center gap-3 text-sm text-muted-foreground" role="status" aria-live="polite">
          <Spinner /> Läser {domain}, testar AI-bottarna och formulerar frågorna en kund skulle ställa...
        </div>
      )}

      {plan && (
        <div className="mt-14 space-y-14">
          {plan.notice && (
            <p className="rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm">{plan.notice}</p>
          )}

          {plan.plan && (
            <section aria-live="polite">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {plan.plan.company} · {plan.plan.offering} · {plan.plan.market}
              </p>
              <div className="mt-4">
                <Headline summary={summary} done={phase === "done"} company={plan.plan.company} />
              </div>

              {summary.competitors.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-semibold">Det här nämner AI istället</h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {summary.competitors.map(c => (
                      <li key={c.name} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm">
                        {c.name} <span className="font-mono text-xs text-muted-foreground">{c.answers}/{summary.answers}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.topSources.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-sm font-semibold">Källorna AI läste</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Synas där, så syns ni i svaren. Ofta är det jämförelsesajter, recensioner och kataloger snarare än
                    er egen sajt.
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {summary.topSources.map(s => (
                      <li key={s.host} className="rounded-full bg-muted px-3 py-1.5 font-mono text-xs">
                        {s.host} · {s.answers}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {plan.plan && (
            <section>
              <h2 className="font-serif text-[28px] leading-tight">Frågorna vi ställde</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Kundfrågorna ställdes {Math.max(...plan.plan.runs.slice(1), 1)} gånger var, eftersom AI svarar olika
                varje gång.
              </p>
              <ul className="mt-5 space-y-3">
                {plan.plan.questions.map((q, i) => (
                  <QuestionCard key={q} question={q} slot={slots[i] ?? { status: "pending" }} isEntity={i === 0} />
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-serif text-[28px] leading-tight">Kan AI läsa er sajt?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Förutsättningar med dokumenterad effekt. De garanterar inte att ni nämns, men om de fallerar nämns ni
              nästan säkert inte.
            </p>
            <div className="mt-5">
              <TechChecks checks={plan.checks} />
            </div>
          </section>

          {phase === "done" && plan.plan && (
            <LeadForm token={plan.token} domain={plan.domain} resultLine={resultLine} />
          )}

          <CommunityNudge />

          <section className="rounded-2xl bg-muted/50 px-5 py-5 text-sm leading-relaxed text-muted-foreground">
            <h2 className="mb-2 text-sm font-semibold text-foreground">Så här mäter vi, ärligt</h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Svaren kommer från {plan.engine?.label ?? "Claude med webbsök"}, med plats satt till Sverige
                {plan.checkedAt ? `, ${new Date(plan.checkedAt).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })}` : ""}.
                ChatGPT, Gemini och Perplexity kan svara annorlunda. Även samma motor svarar olika i app och API.
              </li>
              <li>
                AI-svar varierar mellan körningar. Därför visar vi antal svar och ett osäkerhetsintervall, aldrig ett
                betyg eller en placering.
              </li>
              <li>
                Det här mäter vi inte längre: llms.txt, MCP-kort och schema-märkning. Vi har inte hittat några belägg för
                att de påverkar vad AI rekommenderar.
              </li>
            </ul>
          </section>
        </div>
      )}

      {phase === "idle" && (
        <section className="mt-16 grid gap-8 sm:grid-cols-3">
          {[
            ["1", "Vi läser er startsida", "och formulerar fem frågor som en kund som inte känner till er skulle ställa till en AI-assistent."],
            ["2", "Vi frågar AI, flera gånger", "med webbsök och plats i Sverige, och räknar hur ofta ni nämns och vilka som nämns istället."],
            ["3", "Vi kollar det tekniska", "som faktiskt stänger ute AI: blockerade sökbottar, brandväggar, noindex och sidor som kräver JavaScript."],
          ].map(([n, title, text]) => (
            <div key={n}>
              <p className="font-mono text-xs text-primary">{n}</p>
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
