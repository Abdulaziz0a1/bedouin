import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1a0e02] text-[#f0f3f4] pt-14 pb-8 border-t border-[#2d1a08]">
      <div className="max-w-[1232px] mx-auto px-6 lg:px-0">

        {/* Top grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="Bedouin"
                width={36}
                height={27}
                className="object-contain"
              />
              <span className="font-display font-bold text-lg text-white tracking-tight">
                Bedouin
              </span>
            </div>
            <p className="text-sm text-[#8b7355] leading-relaxed">
              Connecting tourists with authentic Saudi farm and desert
              experiences.
            </p>
            {/* Gold accent line */}
            <div className="mt-5 h-[2px] w-10 bg-[#c49a4f] rounded-full" />
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#c49a4f] uppercase tracking-[0.14em] mb-4">
              Explore
            </h4>
            <ul className="space-y-3 text-sm text-[#8b7355]">
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Browse Experiences
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Farm Stays
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Desert Activities
                </Link>
              </li>
              <li>
                <Link href="/explore" className="hover:text-white transition-colors">
                  Camel Herding
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#c49a4f] uppercase tracking-[0.14em] mb-4">
              Hosting
            </h4>
            <ul className="space-y-3 text-sm text-[#8b7355]">
              <li>
                <Link href="/host" className="hover:text-white transition-colors">
                  Become a Host
                </Link>
              </li>
              <li>
                <Link href="/host" className="hover:text-white transition-colors">
                  Host Dashboard
                </Link>
              </li>
              <li>
                <Link href="/host/listing" className="hover:text-white transition-colors">
                  Add a Listing
                </Link>
              </li>
              <li>
                <Link href="/host" className="hover:text-white transition-colors">
                  Co-host Program
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-[#c49a4f] uppercase tracking-[0.14em] mb-4">
              Support
            </h4>
            <ul className="space-y-3 text-sm text-[#8b7355]">
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Safety Info
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#5a3e28]">
            &copy; {new Date().getFullYear()} Bedouin. All rights reserved.
          </p>

          {/* Payment pills */}
          <div className="flex items-center gap-2">
            {["VISA", "MC", "Apple Pay", "PayPal", "mada"].map((m) => (
              <div
                key={m}
                className="h-6 px-2.5 bg-white/5 border border-white/10 rounded text-[10px] text-[#8b7355] flex items-center font-semibold"
              >
                {m}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-[#5a3e28]">
            <Link href="/" className="hover:text-[#c49a4f] transition-colors">
              Terms
            </Link>
            <span>&middot;</span>
            <Link href="/" className="hover:text-[#c49a4f] transition-colors">
              Privacy
            </Link>
            <span>&middot;</span>
            <Link href="/" className="hover:text-[#c49a4f] transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
