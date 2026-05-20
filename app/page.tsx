export const dynamic = "force-dynamic";

import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import FeaturedExperience from "@/components/home/FeaturedExperience";
import ExperienceCategories from "@/components/home/ExperienceCategories";
import RecentlyAdded from "@/components/home/RecentlyAdded";
import WhyBedouin from "@/components/home/WhyBedouin";
import DiscoverRegions from "@/components/home/DiscoverRegions";
import BecomeHostCTA from "@/components/home/BecomeHostCTA";
import Testimonials from "@/components/home/Testimonials";

import {
  getMarketplaceListings,
  selectRecent,
  getCategoryCounts,
} from "@/lib/server/homepage/getMarketplaceListings";

export default async function Home() {
  const listings  = await getMarketplaceListings();
  const recent    = selectRecent(listings, 6);
  const catCounts = getCategoryCounts(listings);

  return (
    <div className="min-h-screen bg-[#f4efe6]">

      {/* Full-screen cinematic hero */}
      <div className="relative h-screen min-h-[700px]">
        <HeroSection />
        {/* Search bar floats 52px below the hero fold on desktop, sits inside on mobile */}
        <div className="absolute left-0 right-0 z-20 px-4 sm:px-6 bottom-6 md:bottom-[60px]">
          <SearchSection />
        </div>
      </div>

      <main className="flex flex-col">
        {/* Featured experience — cinematic brand showcase */}
        <FeaturedExperience />

        {/* Browse by experience type — all 6 categories always shown */}
        <ExperienceCategories counts={catCounts} />

        {/* Recently added — real listings only, hidden if none */}
        <RecentlyAdded listings={recent} />

        {/* Why Bedouin — static value section */}
        <WhyBedouin />

        {/* Discover Saudi Regions — editorial destination section */}
        <DiscoverRegions />

        {/* Become a Host CTA banner */}
        <BecomeHostCTA />

        {/* Platform testimonials */}
        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}
