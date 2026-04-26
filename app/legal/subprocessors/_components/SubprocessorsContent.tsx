// app/legal/subprocessors/_components/SubprocessorsContent.tsx
"use client";

import Link from "next/link";
import { useLang } from "@/lib/language-context";

export default function SubprocessorsContent() {
  const { t } = useLang();
  const tt = t.subprocessors;

  return (
    <main className="mx-auto max-w-[820px] px-6 py-14">
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground mb-4">
        {tt.lastUpdated.toUpperCase()}
      </p>
      <h1 className="font-serif text-[clamp(32px,6vw,52px)] font-normal leading-[1.05] tracking-[-1.5px] mb-6">
        {tt.title}
      </h1>
      <p className="text-base text-muted-foreground leading-relaxed mb-10">
        {tt.intro}
      </p>

      <div className="overflow-x-auto rounded-lg border border-border/60">
        <table className="min-w-full text-sm">
          <thead className="bg-card/50 text-muted-foreground">
            <tr className="font-mono text-[10px] tracking-widest uppercase">
              <th className="px-4 py-3 text-left font-normal">{tt.tableHeaders.provider}</th>
              <th className="px-4 py-3 text-left font-normal">{tt.tableHeaders.purpose}</th>
              <th className="px-4 py-3 text-left font-normal">{tt.tableHeaders.location}</th>
              <th className="px-4 py-3 text-left font-normal">{tt.tableHeaders.dpf}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {tt.providers.map((p) => (
              <tr key={p.name} className="align-top">
                <td className="px-4 py-3 font-medium">
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors underline-offset-2 hover:underline"
                  >
                    {p.name}
                  </a>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.purpose}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.location}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.dpf}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-muted-foreground leading-relaxed">
        {tt.footnote}
      </p>

      <div className="mt-12">
        <Link
          href="/integritetspolicy"
          className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {tt.backLink}
        </Link>
      </div>
    </main>
  );
}
