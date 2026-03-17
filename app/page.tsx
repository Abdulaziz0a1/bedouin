import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TrustSection from "@/components/home/TrustSection";
import TrendingDestinations from "@/components/home/TrendingDestinations";
import WeekendDeals from "@/components/home/WeekendDeals";
import TopSights from "@/components/home/TopSights";
import TopThingsToDo from "@/components/home/TopThingsToDo";
import FarmsSection from "@/components/home/FarmsSection";
import BecomeHostCTA from "@/components/home/BecomeHostCTA";
import ProvideServiceCTA from "@/components/home/ProvideServiceCTA";
import SearchSection from "@/components/home/SearchSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <Navbar />

      {/* Hero + search card overlap */}
      <div className="pt-[72px]">
        <HeroSection />
      </div>
      {/* SearchSection overlaps hero bottom via negative margin */}
      <div className="relative z-20 -mt-24 px-6 pb-10">
        <SearchSection />
      </div>

      <main className="flex flex-col gap-4 py-6">
        <TrustSection />
        <TrendingDestinations />
        <WeekendDeals />
        <TopSights />
        <TopThingsToDo />
        <FarmsSection />
        <ProvideServiceCTA />
        <BecomeHostCTA />
      </main>

      <Footer />
    </div>
  );
}
