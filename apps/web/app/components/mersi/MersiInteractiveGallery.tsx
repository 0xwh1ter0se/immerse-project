"use client";

import { useState } from "react";
import { MersiPose, MersiPoseName } from "./MersiPose";

export function MersiInteractiveGallery() {
  const views: { label: string; pose: MersiPoseName }[] = [
    { label: "Tampak Depan", pose: "front" },
    { label: "Tampak Samping", pose: "side" },
    { label: "Tampak Belakang", pose: "back" },
  ];

  const expressions: { label: string; pose: MersiPoseName }[] = [
    { label: "Senang", pose: "happy" },
    { label: "Kaget", pose: "surprise" },
    { label: "Wink", pose: "wink" },
    { label: "Sedih", pose: "sad" },
  ];

  const [activePose, setActivePose] = useState<MersiPoseName>("front");

  return (
    <div className="space-y-6">
      {/* 3 Main Angles */}
      <div className="grid grid-cols-3 gap-3">
        {views.map((item) => {
          const isSelected = activePose === item.pose;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActivePose(item.pose)}
              className={`flex flex-col items-center rounded-xl border p-3 text-center transition-all duration-fast ${
                isSelected
                  ? "border-blue bg-bg-surface shadow-elevated scale-105"
                  : "border-border bg-bg-elevated hover:bg-bg-surface"
              }`}
            >
              <div className="aspect-square w-full flex items-center justify-center">
                <MersiPose name={item.pose} size="lg" />
              </div>
              <span className="mt-2 text-xs font-semibold text-text-primary">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Expression Switchers */}
      <div className="rounded-xl border border-border bg-bg-elevated p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
          Coba ganti ekspresi Mersi:
        </p>
        <div className="flex flex-wrap gap-2">
          {expressions.map((exp) => (
            <button
              key={exp.label}
              type="button"
              onClick={() => setActivePose(exp.pose)}
              className={`inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-xs font-semibold transition-all duration-fast ${
                activePose === exp.pose
                  ? "border-blue bg-blue text-text-inverse"
                  : "border-border bg-bg-surface text-text-primary hover:bg-bg-elevated"
              }`}
            >
              <MersiPose name={exp.pose} size="xs" />
              <span>{exp.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
