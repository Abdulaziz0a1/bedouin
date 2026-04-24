import Image from "next/image";
import Link from "next/link";

export default function Footer() {
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
                className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <Image src="/logo.png" alt="Bedouin" width={32} height={32} className="object-contain" />
              </div>
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Bedouin
              </span>
            </div>
            <p className="text-sm text-[#6b5640] leading-relaxed max-w-[200px]">
              Connecting tourists with authentic Saudi farm and desert experiences.
            </p>
            {/* Gold accent line */}
            <div
              className="mt-6 h-[2px] w-10 rounded-full"
              style={{ background: "linear-gradient(90deg, #c49a4f, #f0c84a)" }}
            />
          </div>

          {[
            {
              title: "Explore",
              links: [
                { href: "/explore", label: "Browse Experiences" },
                { href: "/explore", label: "Farm Stays" },
                { href: "/explore", label: "Desert Activities" },
                { href: "/explore", label: "Camel Herding" },
              ],
            },
            {
              title: "Hosting",
              links: [
                { href: "/host",     label: "Become a Host" },
                { href: "/dashboard",label: "Host Dashboard" },
                { href: "/host/new", label: "Add a Listing" },
                { href: "/host",     label: "Co-host Program" },
              ],
            },
            {
              title: "Support",
              links: [
                { href: "/faq", label: "Help Center" },
                { href: "/faq", label: "Safety Info" },
                { href: "/",   label: "Contact Us" },
                { href: "/",   label: "Privacy Policy" },
              ],
            },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-[10px] font-bold text-[#c49a4f] uppercase tracking-[0.20em] mb-5">
                {title}
              </h4>
              <ul className="space-y-3 text-sm text-[#6b5640]">
                {links.map(({ href, label }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="hover:text-[#c4b49a] transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="pt-7 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#4a3020]">
            &copy; {new Date().getFullYear()} Bedouin. All rights reserved.
          </p>

          {/* Payment pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["VISA", "MC", "Apple Pay", "PayPal", "mada"].map((m) => (
              <div
                key={m}
                className="h-6 px-2.5 rounded text-[10px] font-semibold flex items-center"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#6b5640",
                }}
              >
                {m}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-[#4a3020]">
            <Link href="/" className="hover:text-[#c49a4f] transition-colors">Terms</Link>
            <span className="text-[#3a2010]">&middot;</span>
            <Link href="/" className="hover:text-[#c49a4f] transition-colors">Privacy</Link>
            <span className="text-[#3a2010]">&middot;</span>
            <Link href="/" className="hover:text-[#c49a4f] transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
