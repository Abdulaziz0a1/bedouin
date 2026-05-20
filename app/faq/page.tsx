"use client";

import Footer from "@/components/layout/Footer";
import SupportTicketSubmitSection from "@/components/user/shared/SupportTicketSubmitSection";
import { useLanguage } from "@/context/LanguageProvider";

const FAQ_KEYS = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
  { qKey: "faq.q6", aKey: "faq.a6" },
];

export default function FaqPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <main className="pt-[72px]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-0 py-16 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-6 bg-[#c49a4f]" />
              <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
                {t("faq.eyebrow")}
              </p>
            </div>
            <h1 className="font-display font-extrabold text-[#1a0e02] text-4xl leading-tight">
              {t("faq.title")}
            </h1>
            <p className="text-[#64707d]">
              {t("faq.subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {FAQ_KEYS.map(({ qKey, aKey }) => (
              <div
                key={qKey}
                className="bg-white rounded-2xl border border-[#e8dfd4] p-6 shadow-sm"
              >
                <h3 className="font-display font-semibold text-[#1a0e02] mb-2">{t(qKey)}</h3>
                <p className="text-[#64707d] text-sm leading-relaxed">{t(aKey)}</p>
              </div>
            ))}
          </div>

          {/* Still need help? — Support ticket form */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-[#e8dfd4]" />
              <p className="text-xs text-[#8b94a4] font-semibold uppercase tracking-wide shrink-0">{t("faq.still_need_help")}</p>
              <div className="flex-1 h-[1px] bg-[#e8dfd4]" />
            </div>
            <SupportTicketSubmitSection />
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}
