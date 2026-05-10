import { MetadataRoute } from "next";
import { listArticles } from "@/lib/methodology/load";

const BASE = "https://agent.opensverige.se";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const methodologyArticles = await listArticles();

  return [
    { url: `${BASE}/scan`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/api-docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/mcp`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/methodology`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...methodologyArticles.map((a) => ({
      url: `${BASE}/methodology/${a.slug}`,
      lastModified: new Date(a.lastUpdated),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${BASE}/integritetspolicy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/legal/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/legal/aup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/legal/ai-disclosure`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/legal/subprocessors`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
