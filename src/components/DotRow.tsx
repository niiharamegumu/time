import { Dot } from "./Dot";

type DotRowProps = {
  count: number;
  filledCount: number;
  label: string;
  size: "day" | "month" | "work";
  wrap?: boolean;
};

export function DotRow({
  count,
  filledCount,
  label,
  size,
  wrap = false,
}: DotRowProps) {
  return (
    <div
      aria-label={label}
      className={`dot-row dot-row--${size}${wrap ? " dot-row--wrap" : ""}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <Dot key={`${size}-${index}`} filled={index < filledCount} size={size} />
      ))}
    </div>
  );
}
