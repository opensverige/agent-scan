// app/verktyg/layout.tsx
// Same light theme wrapper as /scan and /synlighet.

export default function VerktygLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-scan className="min-h-screen bg-background text-foreground font-sans antialiased">
      {children}
    </div>
  );
}
