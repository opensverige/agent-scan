// app/api-docs/page.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "API — Kommer snart | agent.opensverige",
  description: "Programmatisk åtkomst till AI Readiness Scanner. Scanna domäner, hämta scores, jämför system.",
};

export default function ApiDocsPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <Badge className="mb-4">Kommer snart</Badge>
      <h1 className="text-2xl font-bold mb-2">agent.opensverige API</h1>
      <p className="text-muted-foreground mb-6">
        Programmatisk åtkomst till AI Readiness Scanner. Scanna domäner,
        hämta scores, jämför system.
      </p>
      <Card className="text-left bg-muted/30">
        <CardContent className="py-4 font-mono text-sm space-y-1">
          <p className="text-muted-foreground"># Kommer snart</p>
          <p>GET /api/v1/scan?domain=fortnox.se</p>
          <p>GET /api/v1/score/fortnox.se</p>
          <p>GET /api/v1/compare?a=fortnox.se&amp;b=visma.net</p>
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
