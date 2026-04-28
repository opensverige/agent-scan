"use client";

import { createContext, useContext, useState, useEffect } from "react";
import type { Lang } from "./i18n";
import { I18N } from "./i18n";
import { LANG_COOKIE_NAME } from "./detect-lang";

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

interface LanguageProviderProps {
  children: React.ReactNode;
  /** Initial language detected on the server (cookie / Accept-Language /
   *  geo). Defaults to "sv" so legacy callers without server detection
   *  still work. */
  initialLang?: Lang;
}

export function LanguageProvider({ children, initialLang = "sv" }: LanguageProviderProps) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  // localStorage is a legacy fallback for users who toggled before we
  // shipped cookie persistence. Only consulted if no cookie exists —
  // the cookie is the canonical source of truth going forward.
  useEffect(() => {
    if (document.cookie.includes(`${LANG_COOKIE_NAME}=`)) return;
    const stored = localStorage.getItem("lang");
    if (stored === "en" || stored === "sv") {
      setLangState(stored);
      writeLangCookie(stored);
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem("lang", l); } catch { /* private browsing */ }
    writeLangCookie(l);
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

function writeLangCookie(l: Lang) {
  // 1 year, root path, Lax (works on link click from LinkedIn DM).
  // Not HttpOnly because the client also reads it. Secure only in prod
  // since localhost dev wouldn't accept Secure cookies over http.
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LANG_COOKIE_NAME}=${l}; path=/; max-age=31536000; SameSite=Lax${secure}`;
}
