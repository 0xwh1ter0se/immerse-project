import { MersiPose, MersiPoseName } from "./MersiPose";

interface MersiStickerProps {
  pose?: MersiPoseName;
  label?: string;
  className?: string;
}

export function MersiSticker({ pose = "wink", label, className = "" }: MersiStickerProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-pill border border-border bg-bg-surface/90 px-3 py-1 text-xs font-semibold text-text-primary shadow-sm backdrop-blur transition-transform duration-fast hover:scale-105 ${className}`}
    >
      <MersiPose name={pose} size="xs" />
      {label && <span>{label}</span>}
    </div>
  );
}
