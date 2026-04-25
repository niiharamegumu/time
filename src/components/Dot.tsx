import type { CSSProperties } from "react";

type DotSize = "day" | "month" | "work" | "year";

type DotProps = {
  fillRatio: number;
  size: DotSize;
};

function clampFillRatio(fillRatio: number) {
  return Math.min(1, Math.max(0, fillRatio));
}

export function Dot({ fillRatio, size }: DotProps) {
  const clampedFillRatio = clampFillRatio(fillRatio);
  const state =
    clampedFillRatio >= 1 ? "full" : clampedFillRatio > 0 ? "partial" : "empty";

  return (
    <span
      aria-hidden="true"
      className={`progress-dot progress-dot--${size}`}
      data-fill-state={state}
      style={
        {
          "--dot-fill-angle": `${clampedFillRatio * 360}deg`,
        } as CSSProperties
      }
    />
  );
}
