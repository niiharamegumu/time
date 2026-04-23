import { Dot } from "./Dot";

type DotGridProps = {
  count: number;
  filledCount: number;
  label: string;
};

export function DotGrid({ count, filledCount, label }: DotGridProps) {
  return (
    <div aria-label={label} className="dot-grid">
      {Array.from({ length: count }, (_, index) => (
        <Dot key={`year-${index}`} filled={index < filledCount} size="year" />
      ))}
    </div>
  );
}
