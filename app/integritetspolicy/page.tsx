// app/integritetspolicy/page.tsx
import type { Metadata } from "next";
import Nav from "../scan/_components/Nav";
import Footer from "../scan/_components/Footer";
import PrivacyContent from "./_components/PrivacyContent";

export const metadata: Metadata = {
  title: "Integritet · agent.opensverige",
  description:
    "Vad vi samlar in när du scannar en domän, och varför. Kort, ärligt och utan juristprosa.",
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <PrivacyContent />
      <Footer />
    </>
  );
}
