import { Dot } from "./Dot";

type DotRowProps = {
  count: number;
  label: string;
  progress: number;
  size: "day" | "month" | "work";
  wrap?: boolean;
};

function getDotFillRatio(index: number, progress: number) {
  return Math.min(1, Math.max(0, progress - index));
}

export function DotRow({
  count,
  label,
  progress,
  size,
  wrap = false,
}: DotRowProps) {
  return (
    <div
      aria-label={label}
      className={`dot-row dot-row--${size}${wrap ? " dot-row--wrap" : ""}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <Dot
          key={`${size}-${index}`}
          fillRatio={getDotFillRatio(index, progress)}
          size={size}
        />
      ))}
    </div>
  );
}
