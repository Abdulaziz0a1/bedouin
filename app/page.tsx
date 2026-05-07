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

      {/* Full-screen cinematic hero — navbar overlays from absolute top */}
      <div className="relative h-screen min-h-[700px]">
        <HeroSection />
        {/* Search card docked inside the hero, floating above the fold line */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 sm:px-6 pb-14 sm:pb-16">
          <SearchSection />
        </div>
      </div>

      <main className="flex flex-col">
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
