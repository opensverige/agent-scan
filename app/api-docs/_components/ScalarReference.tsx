// app/api-docs/_components/ScalarReference.tsx
"use client";

import { useEffect, useRef } from "react";

/**
 * Mounts Scalar's API reference into a div via their CDN-hosted bundle.
 * Loaded client-side only to avoid bundling Scalar's React lib (~1 MB).
 *
 * Updates spec via `data-url` attribute. Dark theme matches our brand.
 * If you want to test against a different spec while developing, change
 * the data-url in this file.
 */
export default function ScalarReference() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Spec target
    const target = document.createElement("script");
    target.id = "api-reference";
    target.dataset.url = "/openapi.yaml";
    target.dataset.configuration = JSON.stringify({
      darkMode: true,
      theme: "purple",
      layout: "modern",
      hideDownloadButton: false,
      metaData: {
        title: "agent.opensverige API",
        description: "AI-agent-readiness scanner",
      },
    });

    // 2. Loader script
    const loader = document.createElement("script");
    loader.src = "https://cdn.jsdelivr.net/npm/@scalar/api-reference";
    loader.async = true;

    container.appendChild(target);
    container.appendChild(loader);

    return () => {
      // Best-effort cleanup. Scalar mounts globally so a true unmount is
      // harder; on navigation the component will rebuild fresh.
      target.remove();
      loader.remove();
    };
  }, []);

  return <div ref={containerRef} className="min-h-screen" />;
}
