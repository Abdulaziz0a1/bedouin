import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: "500px" }}>
      {/* Background image */}
      <Image
        src="https://picsum.photos/seed/bedouin-desert-night/1440/500"
        alt=""
        fill
        className="object-cover object-center"
        priority
        aria-hidden="true"
      />

      {/* Layered dark overlay — bottom-heavy for search card contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,3,0,0.38) 0%, rgba(8,3,0,0.20) 35%, rgba(8,3,0,0.62) 80%, rgba(10,4,0,0.88) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Centered hero text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pb-24">
        <h1
          className="font-display font-extrabold text-white leading-tight mb-3"
          style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)" }}
        >
          Your Bedouin Starts Here
        </h1>
        <p
          className="text-white/80 leading-relaxed max-w-md"
          style={{ fontSize: "clamp(1rem, 1.6vw, 1.125rem)" }}
        >
          Find unique stays across Farms, villas, and more.
        </p>
      </div>
    </section>
  );
}
