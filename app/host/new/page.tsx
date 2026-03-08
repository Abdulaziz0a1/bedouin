import Navbar from "@/components/layout/Navbar";
import HostListingFlow from "@/components/host/HostListingFlow";

export const metadata = {
  title: "Add Your Listing – Bedouin",
  description: "List your Saudi property or experience on Bedouin. Guided step-by-step.",
};

export default function HostNewPage() {
  return (
    <div className="min-h-screen bg-[#f4efe6]">
      <Navbar />
      <main className="pt-[72px]">
        <HostListingFlow />
      </main>
    </div>
  );
}
