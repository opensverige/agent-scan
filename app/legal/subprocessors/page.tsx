// app/legal/subprocessors/page.tsx
import type { Metadata } from "next";
import Nav from "../../scan/_components/Nav";
import Footer from "../../scan/_components/Footer";
import SubprocessorsContent from "./_components/SubprocessorsContent";

export const metadata: Metadata = {
  title: "Underleverantörer — agent.opensverige",
  description:
    "Tredje parter som behandlar data å OpenSveriges vägnar. Adekvansbeslut + DPA-status per leverantör.",
  robots: { index: true, follow: true },
};

export default function SubprocessorsPage() {
  return (
    <>
      <Nav />
      <SubprocessorsContent />
      <Footer />
    </>
  );
}
