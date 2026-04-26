import Footer from "@/components/layout/Footer";
import SupportTicketSubmitSection from "@/components/user/shared/SupportTicketSubmitSection";

export const metadata = {
  title: "Help & FAQ – Bedouin",
};

const faqs = [
  {
    q: "How do I book an experience?",
    a: "Browse experiences, select your dates and guest count, then proceed to checkout. You will receive instant confirmation after payment.",
  },
  {
    q: "Are all listings verified?",
    a: "Yes. Every listing goes through admin review before it appears publicly. We verify host identity and listing accuracy.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Most listings offer flexible cancellation. Check the specific cancellation policy on each listing page before booking.",
  },
  {
    q: "How do I become a host?",
    a: "Visit the Become a Host page, create your listing, and submit it for review. Our team approves listings within 2 business days.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept Visa, Mastercard, Apple Pay, PayPal, and local Saudi payment options including mada.",
  },
  {
    q: "Is the platform available in Arabic?",
    a: "Arabic support is coming soon. The platform currently operates in English.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <main className="pt-[72px]">
        <div className="max-w-[720px] mx-auto px-6 lg:px-0 py-16 flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-6 bg-[#c49a4f]" />
              <p className="text-[#c49a4f] text-xs font-bold uppercase tracking-[0.16em]">
                Support
              </p>
            </div>
            <h1 className="font-display font-extrabold text-[#1a0e02] text-4xl leading-tight">
              Help &amp; FAQ
            </h1>
            <p className="text-[#64707d]">
              Answers to the most common questions about Bedouin.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {faqs.map(({ q, a }) => (
              <div
                key={q}
                className="bg-white rounded-2xl border border-[#e8dfd4] p-6 shadow-sm"
              >
                <h3 className="font-display font-semibold text-[#1a0e02] mb-2">{q}</h3>
                <p className="text-[#64707d] text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>

          {/* Still need help? — Support ticket form */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-[#e8dfd4]" />
              <p className="text-xs text-[#8b94a4] font-semibold uppercase tracking-wide shrink-0">Still need help?</p>
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
