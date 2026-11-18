"use client";

import { useState } from "react";
import { MersiPose, MersiPoseName } from "./MersiPose";

export function MersiInteractiveHero() {
  const [currentPose, setCurrentPose] = useState<MersiPoseName>("front");

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Speech Bubble */}
      <div className="animate-[fade-in_300ms_ease-out] z-10 mb-2">
        <div className="relative rounded-2xl border border-border bg-bg-surface px-4 py-2.5 text-xs font-semibold leading-relaxed text-text-primary shadow-elevated">
          ✨ Aku bantu kamu mulai dari sini!
          <span
            className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border-b border-r border-border bg-bg-surface"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Mersi Character Stage */}
      <div
        className="group relative flex cursor-pointer flex-col items-center select-none"
        onClick={() => {
          const poses: MersiPoseName[] = ["front", "wink", "happy", "surprise"];
          const next = poses[(poses.indexOf(currentPose) + 1) % poses.length];
          setCurrentPose(next);
        }}
        title="Ketuk Mersi untuk berinteraksi"
      >
        <div className="transition-transform duration-fast ease-out group-hover:scale-105 active:scale-95">
          <MersiPose
            name={currentPose}
            size="hero"
            priority
            className="animate-[breathe_3s_ease-in-out_infinite]"
          />
        </div>

        {/* Soft shadow under feet */}
        <div
          className="mt-[-1rem] h-4 w-40 sm:w-48 rounded-[100%] bg-text-primary/10 blur-[4px]"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
