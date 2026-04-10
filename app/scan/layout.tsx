// app/scan/layout.tsx
// Wraps all scanner pages in [data-scan] to activate the light theme tokens
import { LanguageProvider } from "@/lib/language-context";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div data-scan className="min-h-screen bg-background text-foreground font-sans antialiased">
        {children}
      </div>
    </LanguageProvider>
  );
}
