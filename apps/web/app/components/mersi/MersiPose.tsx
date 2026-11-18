import Image from "next/image";

export type MersiPoseName =
  | "front"
  | "side"
  | "back"
  | "happy"
  | "surprise"
  | "wink"
  | "sad"
  | "run"
  | "fish"
  | "book"
  | "jump";

interface MersiPoseProps {
  name: MersiPoseName;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  alt?: string;
  className?: string;
  priority?: boolean;
}

const SIZE_MAP = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-20 h-20",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
  hero: "w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96",
};

const ALT_MAP: Record<MersiPoseName, string> = {
  front: "Maskot Mersi tampak depan, kucing oranye bertopi biru terbalik",
  side: "Maskot Mersi tampak samping",
  back: "Maskot Mersi tampak belakang dengan ransel kuning",
  happy: "Maskot Mersi ekspresi senang tersenyum ceria",
  surprise: "Maskot Mersi ekspresi kaget antusias",
  wink: "Maskot Mersi ekspresi wink mengedipkan mata",
  sad: "Maskot Mersi ekspresi sedih ringan",
  run: "Maskot Mersi pose berlari semangat",
  fish: "Maskot Mersi memegang ikan kesukaannya",
  book: "Maskot Mersi sedang membaca buku panduan belajar",
  jump: "Maskot Mersi melompat gembira merayakan pencapaian",
};

export function MersiPose({
  name,
  size = "md",
  alt,
  className = "",
  priority = false,
}: MersiPoseProps) {
  const file = `/assets/mersi/${name}.webp`;
  const computedAlt = alt || ALT_MAP[name];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${SIZE_MAP[size]} ${className}`}
    >
      <Image
        src={file}
        alt={computedAlt}
        width={380}
        height={380}
        priority={priority}
        className="h-full w-full object-contain pointer-events-none drop-shadow-sm"
      />
    </div>
  );
}
