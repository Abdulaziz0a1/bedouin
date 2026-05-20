"use client";

import { useLanguage } from "@/context/LanguageProvider";

interface Props {
  /** transparent = over hero (white text), scrolled = on cream bg (dark text) */
  transparent?: boolean;
}

export default function LanguageSwitcher({ transparent = false }: Props) {
  const { lang, setLang } = useLanguage();

  const isAr = lang === "ar";

  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0",
    borderRadius: "10px",
    overflow: "hidden",
    border: transparent
      ? "1px solid rgba(255,255,255,0.22)"
      : "1px solid rgba(196,154,79,0.28)",
    fontSize: "11.5px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    userSelect: "none",
    flexShrink: 0,
  };

  const activeStyle: React.CSSProperties = {
    background: transparent
      ? "rgba(255,255,255,0.22)"
      : "linear-gradient(135deg, #c49a4f 0%, #a87c38 100%)",
    color: transparent ? "rgba(255,255,255,0.95)" : "#fff",
    padding: "5px 10px",
    cursor: "default",
    transition: "background 0.2s",
  };

  const inactiveStyle: React.CSSProperties = {
    background: "transparent",
    color: transparent ? "rgba(255,255,255,0.55)" : "#8b7055",
    padding: "5px 10px",
    cursor: "pointer",
    transition: "color 0.2s",
  };

  return (
    <div style={baseStyle} role="group" aria-label="Language switcher">
      <button
        onClick={() => setLang("en")}
        style={isAr ? inactiveStyle : activeStyle}
        aria-pressed={!isAr}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span
        style={{
          width: "1px",
          alignSelf: "stretch",
          background: transparent
            ? "rgba(255,255,255,0.18)"
            : "rgba(196,154,79,0.22)",
        }}
      />
      <button
        onClick={() => setLang("ar")}
        style={isAr ? activeStyle : inactiveStyle}
        aria-pressed={isAr}
        aria-label="التبديل إلى العربية"
      >
        ع
      </button>
    </div>
  );
}
