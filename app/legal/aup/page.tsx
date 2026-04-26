// app/legal/aup/page.tsx
import type { Metadata } from "next";
import Nav from "../../scan/_components/Nav";
import Footer from "../../scan/_components/Footer";
import AupContent from "./_components/AupContent";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — agent.opensverige",
  description:
    "Regler för hur agent.opensverige.se och vårt API får användas. Brott leder till avstängning av nyckel.",
  robots: { index: true, follow: true },
};

export default function AupPage() {
  return (
    <>
      <Nav />
      <AupContent />
      <Footer />
    </>
  );
}
