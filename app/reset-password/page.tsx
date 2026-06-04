import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase-server";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Set New Password – Bedouin",
};

/**
 * Server Component — validates the session that was set by /auth/callback.
 *
 * The flow is:
 *   email link → /auth/callback (exchanges code → sets cookie) → here
 *
 * If there is no session (user navigated here directly, or the link expired
 * before /auth/callback could exchange the code), redirect to
 * /forgot-password?error=link_expired so they can request a fresh link.
 */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/forgot-password?error=link_expired");
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #fef9f3 0%, #f4efe6 45%, #ede4d6 100%)",
      }}
    >
      {/* Background layers — identical to login page */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-pattern-diamonds opacity-70" />
        <div className="absolute inset-0 bg-pattern-dots opacity-40" />

        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(196,154,79,0.10) 0%, transparent 65%)",
            top: "-8%",
            right: "-5%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(177,122,80,0.08) 0%, transparent 65%)",
            bottom: "10%",
            left: "-5%",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "40%",
            background:
              "linear-gradient(to top, rgba(196,154,79,0.04), transparent)",
          }}
        />
      </div>

      <main className="relative pt-[72px] flex items-center justify-center min-h-screen px-6 py-14">
        <div className="w-full max-w-[420px]">

          {/* Decorative top accent */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className="h-px flex-1 max-w-[3rem]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(196,154,79,0.5))",
              }}
            />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"
                fill="rgba(196,154,79,0.55)"
              />
            </svg>
            <div
              className="h-px flex-1 max-w-[3rem]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(196,154,79,0.5), transparent)",
              }}
            />
          </div>

          {/* Card */}
          <div
            className="rounded-[28px] px-8 py-9"
            style={{
              background:           "rgba(255,254,252,0.97)",
              backdropFilter:       "blur(28px) saturate(1.8)",
              WebkitBackdropFilter: "blur(28px) saturate(1.8)",
              border:               "1px solid rgba(232,223,212,0.80)",
              boxShadow:
                "0 24px 80px rgba(26,14,2,0.13), 0 8px 28px rgba(26,14,2,0.08), 0 2px 8px rgba(26,14,2,0.05), inset 0 1px 0 rgba(255,255,255,0.95)",
            }}
          >
            {/* Brand mark */}
            <div className="flex items-center gap-2.5 mb-7">
              <div
                className="h-px w-7"
                style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }}
              />
              <p
                className="text-[#c49a4f] font-bold uppercase"
                style={{ fontSize: "0.6875rem", letterSpacing: "0.22em" }}
              >
                Bedouin
              </p>
            </div>

            <Suspense>
              <ResetPasswordForm />
            </Suspense>
          </div>

          {/* Bottom trust line */}
          <p
            className="text-center text-[#a09080] text-xs mt-6"
            style={{ letterSpacing: "0.03em" }}
          >
            Authentic Saudi hospitality, secured
          </p>
        </div>
      </main>
    </div>
  );
}
