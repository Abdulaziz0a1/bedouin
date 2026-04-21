/**
 * UserAvatar — renders a profile image or an initials-based fallback.
 *
 * When `src` is empty/null, shows a colored circle with the user's initials.
 * The background color is derived deterministically from the name so it is
 * always the same for the same person (no random color on each render).
 *
 * Usage:
 *   <UserAvatar src={profile.avatar_url} name="Abdulaziz Hassan" size={36} />
 */

const PALETTE = [
  "#8b5e38", // warm brown
  "#461e00", // dark brown
  "#049153", // green
  "#0046cc", // blue
  "#c49a4f", // gold
  "#5a2800", // deep sienna
  "#2d6a4f", // forest
  "#6a3d9a", // purple
];

function bgFromName(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return PALETTE[sum % PALETTE.length];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

interface UserAvatarProps {
  src?:       string | null;
  name:       string;
  size?:      number;   // px — applied as width + height inline style
  className?: string;
}

export default function UserAvatar({ src, name, size = 36, className = "" }: UserAvatarProps) {
  const hasSrc = Boolean(src && src.trim());
  const dim    = `${size}px`;

  if (hasSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src!}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: dim, height: dim }}
      />
    );
  }

  const label   = initials(name) || "?";
  const bgColor = bgFromName(name);
  const fontSize = Math.max(10, Math.round(size * 0.38));

  return (
    <div
      className={`rounded-full flex items-center justify-center shrink-0 select-none font-bold text-white ${className}`}
      style={{ width: dim, height: dim, backgroundColor: bgColor, fontSize }}
      aria-label={name}
    >
      {label}
    </div>
  );
}
