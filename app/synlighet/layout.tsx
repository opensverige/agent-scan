// app/synlighet/layout.tsx
// Same light theme wrapper as /scan.

export default function SynlighetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-scan className="min-h-screen bg-background text-foreground font-sans antialiased">
      {children}
    </div>
  );
}
