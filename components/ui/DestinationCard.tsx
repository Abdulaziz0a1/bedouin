import Image from "next/image";
import Link from "next/link";

interface DestinationCardProps {
  city: string;
  fromPrice: number;
  description: string;
  image: string;
  href?: string;
}

export default function DestinationCard({
  city, fromPrice, description, image, href = "/explore",
}: DestinationCardProps) {
  return (
    <Link
      href={href}
      className="relative w-[288px] h-[500px] rounded-2xl overflow-hidden shrink-0 block group
                 hover:shadow-[0_12px_40px_rgba(26,14,2,0.35)] transition-shadow duration-300"
    >
      <Image src={image} alt={city} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="288px"/>

      {/* Gradient */}
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(to bottom, rgba(26,14,2,0.05) 40%, rgba(26,14,2,0.88) 100%)" }}
      />

      {/* Gold accent stripe */}
      <div className="absolute top-4 left-4 w-8 h-[2px] bg-[#c49a4f]" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-6 flex flex-col gap-1.5">
        <h3 className="text-white font-display font-bold text-2xl leading-tight">{city}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-white/75 text-sm">From</span>
          <span className="text-[#c49a4f] text-base font-bold">SAR {fromPrice}</span>
          <span className="text-[#c49a4f] text-sm font-medium">/night</span>
        </div>
        <p className="text-white/75 text-sm leading-snug mt-0.5">{description}</p>
      </div>
    </Link>
  );
}
