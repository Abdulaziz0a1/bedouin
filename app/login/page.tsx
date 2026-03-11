import Navbar from "@/components/layout/Navbar";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Log In – Bedouin",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <Navbar />
      <main className="pt-[72px] flex items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-[440px] bg-white rounded-2xl border border-[#e8dfd4] p-8 shadow-sm">
          {/* Brand mark */}
          <div className="flex items-center gap-2 mb-7">
            <div className="h-[2px] w-5 bg-[#c49a4f]" />
            <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.14em]">
              Bedouin
            </p>
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}
