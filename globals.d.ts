// Side-effect CSS imports — required for TypeScript 6, harmless on 5.x.
// Next.js loads `./globals.css` via `import "./globals.css"` in app/layout.tsx.
// TS 6 needs an explicit module declaration for these unresolved imports.
declare module "*.css";
