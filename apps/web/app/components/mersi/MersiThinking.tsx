"use client";

import { useEffect, useState } from "react";
import { MersiPose } from "./MersiPose";

export function MersiThinking() {
  const thoughts = ["Membaca pertanyaanmu…", "Mencari konteks adegan…", "Hampir selesai!"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % thoughts.length);
    }, 1500);
    return () => clearInterval(timer);
  }, [thoughts.length]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-xl border border-border bg-bg-surface px-4 py-3 shadow-sm"
    >
      <div className="animate-[wiggle_1.2s_ease-in-out_infinite]">
        <MersiPose name="book" size="sm" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold text-text-primary">{thoughts[index]}</p>
        <div className="flex gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue [animation-delay:200ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
}
