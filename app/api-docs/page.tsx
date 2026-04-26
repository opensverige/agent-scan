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
    "OpenAPI 3.1 reference for the agent.opensverige scanner API. Endpoints, auth, error codes.",
  robots: { index: true, follow: true },
};

export default function ApiDocsPage() {
  return (
    <>
      <Nav />
      <ScalarReference />
      <Footer />
    </>
  );
}
