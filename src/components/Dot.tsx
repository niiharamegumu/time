type DotSize = "day" | "month" | "work" | "year";

type DotProps = {
  filled: boolean;
  size: DotSize;
};

export function Dot({ filled, size }: DotProps) {
  return (
    <span
      aria-hidden="true"
      className={`progress-dot progress-dot--${size}`}
      data-filled={filled ? "true" : "false"}
    />
  );
}
