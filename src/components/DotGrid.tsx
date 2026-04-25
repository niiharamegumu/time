import { Dot } from "./Dot";

type DotGridProps = {
  count: number;
  label: string;
  progress: number;
};

function getDotFillRatio(index: number, progress: number) {
  return Math.min(1, Math.max(0, progress - index));
}

export function DotGrid({ count, label, progress }: DotGridProps) {
  return (
    <div aria-label={label} className="dot-grid">
      {Array.from({ length: count }, (_, index) => (
        <Dot
          key={`year-${index}`}
          fillRatio={getDotFillRatio(index, progress)}
          size="year"
        />
      ))}
    </div>
  );
}
