"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Wraps page content and plays `.animate-page-enter` on every route change.
 * Re-keying by pathname causes React to unmount/remount, triggering the CSS
 * animation fresh. The Navbar lives outside this wrapper so it never flickers.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-page-enter"
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </div>
  );
}
