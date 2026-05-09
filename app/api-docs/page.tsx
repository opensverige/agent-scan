// app/api-docs/page.tsx
//
// API reference UI for the public scanner API. Renders /openapi.yaml via
// Scalar — modern dark-mode-friendly OpenAPI viewer.
//
// We use a tiny client component (ScalarReference) to load Scalar from
// their CDN. Keeping it client-side avoids bundling the (large) Scalar
// React lib while still giving us a fully-functional reference UI.

import type { Metadata } from "next";
import Nav from "../scan/_components/Nav";
import Footer from "../scan/_components/Footer";
import ScalarReference from "./_components/ScalarReference";

export const metadata: Metadata = {
  title: "API reference — agent.opensverige",
  description:
    "OpenAPI 3.1 reference for the EU-jurisdiction agent.opensverige scanner API. POST /api/v1/scan, GET /api/v1/scan/{id}. Bearer auth. Synchronous in 10-30 s. Hobby tier free. Inline EU AI Act Art. 50 disclosure on every response.",
  alternates: {
    canonical: "https://agent.opensverige.se/api-docs",
    types: {
      "application/yaml": "https://agent.opensverige.se/openapi.yaml",
      "text/markdown": "https://agent.opensverige.se/api-docs",
    },
  },
  robots: { index: true, follow: true },
};

const webApiSchema = {
  "@context": "https://schema.org",
  "@type": "WebAPI",
  "@id": "https://agent.opensverige.se/#scanner-api",
  name: "agent.opensverige Scanner API",
  description:
    "Public REST API that scans any public domain for 17 AI-readiness checks across discovery, EU AI Act compliance, and developer surface. EU-only data plane. Inline ai_disclosure per EU AI Act Art. 50.",
  url: "https://agent.opensverige.se/api-docs",
  endpointURL: "https://agent.opensverige.se/api/v1/scan",
  documentation: "https://agent.opensverige.se/api-docs",
  termsOfService: "https://agent.opensverige.se/legal/terms",
  inLanguage: "en-US",
  encodingFormat: "application/json",
  isAccessibleForFree: true,
  provider: { "@id": "https://opensverige.se/#organization" },
  potentialAction: {
    "@type": "ConsumeAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://agent.opensverige.se/api/v1/scan",
      httpMethod: "POST",
      contentType: "application/json",
    },
  },
  license: "https://github.com/opensverige/agent-scan/blob/main/LICENSE",
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
      name: "API reference",
      item: "https://agent.opensverige.se/api-docs",
    },
  ],
};

export default function ApiDocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApiSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Nav />
      <ScalarReference />
      <Footer />
    </>
  );
}
