// app/legal/ai-disclosure/page.tsx
import type { Metadata } from "next";
import Nav from "../../scan/_components/Nav";
import Footer from "../../scan/_components/Footer";
import AIDisclosureContent from "./_components/AIDisclosureContent";

export const metadata: Metadata = {
  title: "AI-disclosure — agent.opensverige",
  description:
    "Vilken AI vi använder, vad den genererar, hur den märks. EU AI Act Art. 50-information.",
  robots: { index: true, follow: true },
};

export default function AIDisclosurePage() {
  return (
    <>
      <Nav />
      <AIDisclosureContent />
      <Footer />
    </>
  );
}
