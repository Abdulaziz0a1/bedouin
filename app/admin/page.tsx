import type { Metadata } from "next";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin · Listing Approval — Bedouin",
  description: "Internal moderation queue for Bedouin listing submissions.",
};

/*
  Production: protect this route with Firebase Admin SDK + middleware
  ─────────────────────────────────────────────────────────────────────────────
  // middleware.ts
  export async function middleware(req: NextRequest) {
    const session = await getSession(req);
    if (!session?.user?.role === "admin") return NextResponse.redirect("/");
    return NextResponse.next();
  }
  export const config = { matcher: ["/admin/:path*"] };
  ─────────────────────────────────────────────────────────────────────────────
*/

export default function AdminPage() {
  return <AdminDashboard />;
}
