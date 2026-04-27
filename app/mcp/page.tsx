// app/mcp/page.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "MCP-server · Kommer snart | agent.opensverige",
  description: "Koppla AI Readiness Scanner direkt till Claude, Cursor eller Windsurf via Model Context Protocol.",
};

export default function McpPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <Badge className="mb-4">Kommer snart</Badge>
      <h1 className="text-2xl font-bold mb-2">MCP-server</h1>
      <p className="text-muted-foreground mb-6">
        Koppla AI Readiness Scanner direkt till Claude, Cursor eller Windsurf
        via Model Context Protocol.
      </p>
      <Card className="text-left bg-muted/30">
        <CardContent className="py-4 font-mono text-sm space-y-1">
          <p className="text-muted-foreground"># Kommer snart</p>
          <p>npx agent-opensverige-mcp</p>
          <p className="text-muted-foreground"># Tools: scan_domain, get_score, compare_systems</p>
        </CardContent>
      </Card>
      <Button className="mt-6" asChild>
        <a href="https://discord.gg/CSphbTk8En" target="_blank" rel="noopener noreferrer">
          Ge input i Discord →
        </a>
      </Button>
    </div>
  );
}
