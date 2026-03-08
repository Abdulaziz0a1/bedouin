import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WishlistClient from "@/components/wishlist/WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist · Bedouin",
  description: "Your saved Saudi farm, desert, and Bedouin experiences.",
};

export default function WishlistPage() {
  return (
    <>
      <Navbar />
      <div className="pt-[72px]">
        <WishlistClient />
      </div>
      <Footer />
    </>
  );
}
