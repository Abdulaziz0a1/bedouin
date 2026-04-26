import SignupForm from "@/components/auth/SignupForm";

export const metadata = {
  title: "Sign Up – Bedouin",
};

export default function SignupPage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #f4efe6 0%, #fef9f3 50%, #ede4d6 100%)",
      }}
    >

      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(196,154,79,0.07) 0%, transparent 70%)",
            top: "10%",
            right: "5%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(177,122,80,0.06) 0%, transparent 70%)",
            bottom: "15%",
            left: "8%",
          }}
        />
      </div>

      <main className="relative pt-[72px] flex items-center justify-center min-h-screen px-6 py-12">
        <div
          className="w-full max-w-[440px] rounded-3xl p-8"
          style={{
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(24px) saturate(1.6)",
            WebkitBackdropFilter: "blur(24px) saturate(1.6)",
            border: "1px solid rgba(255,255,255,0.85)",
            boxShadow: "0 20px 80px rgba(26,14,2,0.14), 0 4px 20px rgba(26,14,2,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div
              className="h-px w-8"
              style={{ background: "linear-gradient(90deg, transparent, #c49a4f)" }}
            />
            <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.20em]">
              Bedouin
            </p>
          </div>

          <SignupForm />
        </div>
      </main>
    </div>
  );
}
