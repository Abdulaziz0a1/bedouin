"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageProvider";

const COLUMNS = [
  {
    titleKey: "footer.company",
    links: [
      { href: "/about",    labelKey: "footer.link.about" },
      { href: "/careers",  labelKey: "footer.link.careers" },
      { href: "/press",    labelKey: "footer.link.press" },
      { href: "/blog",     labelKey: "footer.link.blog" },
    ],
  },
  {
    titleKey: "footer.hosting",
    links: [
      { href: "/host/onboarding", labelKey: "footer.link.host_home" },
      { href: "/host",            labelKey: "footer.link.host_resources" },
      { href: "/cohost",          labelKey: "footer.link.cohost" },
      { href: "/provide-service", labelKey: "footer.link.provide" },
    ],
  },
  {
    titleKey: "footer.support",
    links: [
      { href: "/faq", labelKey: "footer.link.help" },
      { href: "/faq", labelKey: "footer.link.safety" },
      { href: "/faq", labelKey: "footer.link.cancellation" },
      { href: "/",    labelKey: "footer.link.contact" },
    ],
  },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      className="relative text-[#f0f3f4] pt-16 pb-8 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #1a0e02 0%, #140b01 100%)",
        borderTop: "1px solid rgba(196,154,79,0.15)",
      }}
    >
      {/* Ambient top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 800,
          height: 1,
          boxShadow: "0 0 120px 40px rgba(196,154,79,0.08)",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-[1232px] mx-auto px-6 lg:px-0">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                style={{
                  border: "1px solid rgba(196,154,79,0.22)",
                }}
              >
                <Image src="/images/bedouin-logo-symbol.jpeg" alt="Bedouin" width={36} height={36} className="object-cover scale-[1.42] origin-center" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Bedouin
              </span>
            </div>
            <p className="text-sm text-[#8b7055] leading-relaxed max-w-[210px]" style={{ lineHeight: "1.7" }}>
              {t("footer.tagline")}
            </p>
            {/* Gold accent line */}
            <div
              className="mt-6 h-[1.5px] w-12 rounded-full"
              style={{ background: "linear-gradient(90deg, #c49a4f, rgba(196,154,79,0.20))" }}
            />
          </div>

          {COLUMNS.map(({ titleKey, links }) => (
            <div key={titleKey}>
              <h4 className="text-[10px] font-bold text-[#c49a4f] uppercase tracking-[0.22em] mb-5">
                {t(titleKey)}
              </h4>
              <ul className="space-y-3.5">
                {links.map(({ href, labelKey }) => (
                  <li key={labelKey}>
                    <Link
                      href={href}
                      className="text-sm text-[#9b8470] hover:text-[#c4b49a] transition-colors duration-200"
                    >
                      {t(labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-7 flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-xs text-[#6b5440]">
            {t("footer.copy")}
          </p>

          {/* Payment pills */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {["Visa", "Mastercard", "Apple Pay", "PayPal", "mada"].map((m) => (
              <div
                key={m}
                className="h-[22px] px-2.5 rounded-[5px] text-[9.5px] font-semibold flex items-center tracking-wide"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "#8b7055",
                }}
              >
                {m}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#6b5440]">
            <Link href="/" className="hover:text-[#c49a4f] transition-colors duration-200">{t("footer.terms")}</Link>
            <span className="text-[#3a2010]">&middot;</span>
            <Link href="/" className="hover:text-[#c49a4f] transition-colors duration-200">{t("footer.privacy")}</Link>
            <span className="text-[#3a2010]">&middot;</span>
            <Link href="/" className="hover:text-[#c49a4f] transition-colors duration-200">{t("footer.sitemap")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
