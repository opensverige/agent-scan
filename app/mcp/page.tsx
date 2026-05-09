// app/mcp/page.tsx
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "MCP server (planned) — agent.opensverige",
  description:
    "Planned Model Context Protocol server for agent.opensverige.se. Lets Claude, Cursor, Windsurf and any MCP-capable agent run scan_domain, get_scan, compare_scans against the EU-jurisdiction scanner directly. Discovery card at /.well-known/mcp.json.",
  alternates: {
    canonical: "https://agent.opensverige.se/mcp",
  },
};

const mcpSoftwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://agent.opensverige.se/#mcp-server",
  name: "agent.opensverige MCP Server",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform (Node.js)",
  url: "https://agent.opensverige.se/mcp",
  description:
    "Planned MCP server that exposes the agent.opensverige.se EU-jurisdiction scanner as Model Context Protocol tools (scan_domain, get_scan, compare_scans) for Claude, Cursor, Windsurf and other MCP-capable agents.",
  releaseNotes: "Planned. Discovery card published at /.well-known/mcp.json.",
  publisher: { "@id": "https://opensverige.se/#organization" },
  featureList: [
    "scan_domain — synchronous scan of any public domain (17 checks)",
    "get_scan — fetch a previous scan by UUID",
    "compare_scans — diff two scans for regression tracking",
  ],
  isAccessibleForFree: true,
  countryOfOrigin: { "@type": "Country", name: "Sweden" },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "agent.opensverige",
      item: "https://agent.opensverige.se",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "MCP server",
      item: "https://agent.opensverige.se/mcp",
    },
  ],
};

export default function McpPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mcpSoftwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Badge className="mb-4">Kommer snart · Discovery card live</Badge>
        <h1 className="text-2xl font-bold mb-2">MCP server</h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          A Model Context Protocol server that lets Claude, Cursor, Windsurf
          and any MCP-capable agent run agent.opensverige.se scans directly,
          without leaving the editor. EU-jurisdiction. Inline EU AI Act Art. 50
          disclosure on every result.
        </p>
        <Card className="text-left bg-muted/30 mb-6">
          <CardContent className="py-4 font-mono text-sm space-y-1">
            <p className="text-muted-foreground"># planned, ~Q3 2026</p>
            <p>npx agent-opensverige-mcp</p>
            <p className="text-muted-foreground"># Tools: scan_domain, get_scan, compare_scans</p>
          </CardContent>
        </Card>
        <Card className="text-left bg-muted/30 mb-6">
          <CardContent className="py-4 text-sm space-y-2">
            <p className="font-semibold">Already discoverable today</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>
                <code className="text-foreground">/.well-known/mcp.json</code>
                {" "}— server card with planned tool list
              </li>
              <li>
                <code className="text-foreground">/.well-known/ai-plugin.json</code>
                {" "}— OpenAI plugin manifest
              </li>
              <li>
                <code className="text-foreground">/skills/scan-api.md</code>
                {" "}— LLM-friendly capability spec
              </li>
              <li>
                <code className="text-foreground">/openapi.yaml</code>
                {" "}— OpenAPI 3.1 you can wrap as an MCP server today
              </li>
            </ul>
          </CardContent>
        </Card>
        <Button asChild>
          <a
            href="https://discord.gg/CSphbTk8En"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get an alpha API key in Discord →
          </a>
        </Button>
      </div>
    </>
  );
}
