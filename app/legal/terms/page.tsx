// app/legal/terms/page.tsx
import type { Metadata } from "next";
import Nav from "../../scan/_components/Nav";
import Footer from "../../scan/_components/Footer";
import TermsContent from "./_components/TermsContent";

export const metadata: Metadata = {
  title: "Användarvillkor — agent.opensverige",
  description:
    "Juridiska villkor för agent.opensverige.se och dess publika API. Skrivna i klartext utan jurist-jargong.",
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <TermsContent />
      <Footer />
    </>
  );
}
