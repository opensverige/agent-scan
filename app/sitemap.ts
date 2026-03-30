import { MetadataRoute } from "next";

const BASE = "https://agent.opensverige.se";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/scan`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/api-docs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/mcp`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
