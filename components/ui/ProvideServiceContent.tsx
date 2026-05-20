"use client";

import AlertBanner from "@/components/ui/AlertBanner";
import CohostApplicationForm from "@/components/cohost/CohostApplicationForm";
import { useLanguage } from "@/context/LanguageProvider";

const SERVICES = [
  { icon: "🔑", key: "service.svc.checkin"    },
  { icon: "🧹", key: "service.svc.cleaning"   },
  { icon: "🗺️", key: "service.svc.guide"       },
  { icon: "📷", key: "service.svc.photo"       },
  { icon: "🔧", key: "service.svc.maintenance" },
  { icon: "💬", key: "service.svc.support"     },
];

const TRUST = [
  { icon: "✅", key: "service.trust.reviewed"    },
  { icon: "🌍", key: "service.trust.saudi"        },
  { icon: "⏱️", key: "service.trust.review_time"  },
];

interface ProvideServiceContentProps {
  isRejected: boolean;
  userId:     string;
}

export default function ProvideServiceContent({ isRejected, userId }: ProvideServiceContentProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-[1232px] mx-auto px-6 lg:px-0 py-12">

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="h-px w-8 bg-[#c49a4f]" />
          <span className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
            {t("service.eyebrow")}
          </span>
          <div className="h-px w-8 bg-[#c49a4f]" />
        </div>
        <h1 className="font-display font-extrabold text-[#1a0e02] text-3xl mb-3">
          {isRejected ? t("service.heading_reapply") : t("service.heading")}
        </h1>
        <p className="text-[#64707d] text-base max-w-lg mx-auto leading-relaxed">
          {t("service.subtitle")}
        </p>

        {isRejected && (
          <AlertBanner
            variant="error"
            title={t("service.alert")}
            compact
            dismissible
            storageKey={`bdw:alert:sp-rejected:${userId}`}
            className="mt-4 mx-auto"
          />
        )}
      </div>

      {/* Services overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
        {SERVICES.map(({ icon, key }) => (
          <div key={key} className="bg-white border border-[#e8dfd4] rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-semibold text-[#1a0e02]">{t(key)}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-[#e8dfd4] shadow-sm p-8">
        <CohostApplicationForm />
      </div>

      {/* Trust note */}
      <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
        {TRUST.map(({ icon, key }) => (
          <div key={key} className="flex items-center gap-2 text-[#8b94a4] text-sm">
            <span>{icon}</span>
            {t(key)}
          </div>
        ))}
      </div>
    </div>
  );
}
