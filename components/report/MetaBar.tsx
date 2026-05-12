// components/report/MetaBar.tsx
//
// End-of-article meta block: authors, license, DOI, version, last
// reviewed, citation. Tightens the document with a "this is published"
// signal.

import { Eyebrow } from "./Eyebrow";

interface MetaBarProps {
  authors: { name: string; href?: string }[];
  publishedAt: string;
  lastReviewed: string;
  version: string;
  license: string;
  doi?: string;
  citationApa: string;
  repoUrl?: string;
}

export function MetaBar({
  authors,
  publishedAt,
  lastReviewed,
  version,
  license,
  doi,
  citationApa,
  repoUrl,
}: MetaBarProps) {
  return (
    <section
      aria-labelledby="meta-heading"
      className="mx-auto mt-32 w-full max-w-[760px] border-t border-[hsl(var(--hairline))] px-5 pt-12 sm:px-8 md:pt-16"
    >
      <Eyebrow>Om publikationen</Eyebrow>
      <h2 id="meta-heading" className="sr-only">
        Om publikationen
      </h2>

      <dl className="mt-8 grid gap-y-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-x-8 sm:gap-y-4">
        <Row label="Författare">
          {authors.map((a, idx) => (
            <span key={a.name}>
              {a.href ? (
                <a
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(var(--foreground))] underline decoration-[hsl(var(--hairline))] underline-offset-[3px] hover:decoration-[hsl(var(--primary))]"
                >
                  {a.name}
                </a>
              ) : (
                <span>{a.name}</span>
              )}
              {idx < authors.length - 1 && (
                <span aria-hidden className="text-[hsl(var(--muted-foreground))]">
                  {" och "}
                </span>
              )}
            </span>
          ))}
        </Row>
        <Row label="Publicerad">{publishedAt}</Row>
        <Row label="Senast granskad">{lastReviewed}</Row>
        <Row label="Version">{version}</Row>
        <Row label="Licens">{license}</Row>
        {doi && <Row label="DOI">{doi}</Row>}
        {repoUrl && (
          <Row label="Källkod">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[hsl(var(--foreground))] underline decoration-[hsl(var(--hairline))] underline-offset-[3px] hover:decoration-[hsl(var(--primary))]"
            >
              {repoUrl.replace(/^https?:\/\//, "")}
            </a>
          </Row>
        )}
      </dl>

      <div className="mt-12 rounded-lg border border-[hsl(var(--hairline))] bg-[hsl(var(--surface-card))] p-5 md:p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
          Citera så här
        </p>
        <p className="mt-3 font-sans text-[14.5px] leading-[1.6] text-[hsl(var(--foreground))]">
          {citationApa}
        </p>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
        {label}
      </dt>
      <dd className="font-sans text-[14.5px] leading-[1.5] text-[hsl(var(--foreground-soft))]">
        {children}
      </dd>
    </>
  );
}
