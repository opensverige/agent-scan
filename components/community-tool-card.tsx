// components/community-tool-card.tsx

import type { CommunityTool } from "@/lib/community-tools";

export function CommunityToolCard({ tool }: { tool: CommunityTool }) {
  return (
    <article className="rounded-2xl border border-border bg-card px-5 py-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-serif text-[26px] leading-tight">{tool.name}</h2>
        <span className="font-mono text-[11px] text-muted-foreground">Licens: {tool.licence}</span>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed">{tool.checks}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tool.forWho}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{tool.start}</p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Fakta">
        {tool.tags.map(tag => (
          <li key={tag} className="rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
            {tag}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
        <a href={tool.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Kom igång med {tool.name} →
        </a>
        {tool.url !== tool.repo && (
          <a href={tool.repo} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
            Källkoden →
          </a>
        )}
      </div>
    </article>
  );
}
