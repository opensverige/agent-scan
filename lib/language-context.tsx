"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Lang } from "./i18n";
import { I18N } from "./i18n";

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: typeof I18N.sv;
}

const LanguageContext = createContext<LangCtx>({
  lang: "sv",
  setLang: () => {},
  t: I18N.sv,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("sv");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "en" || stored === "sv") setLangState(stored);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: I18N[lang] as typeof I18N.sv }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
