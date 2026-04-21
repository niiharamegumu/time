import { formatTime } from "../lib/datetime/formatTime";

type TimeLineProps = {
  now: Date;
};

export function TimeLine({ now }: TimeLineProps) {
  const parts = formatTime(now).split(" : ");

  return (
    <p className="clock-line clock-line--time" aria-label="Current time">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="clock-line__time-part">
          <span className="clock-line__time-digit">{part}</span>
          {index < parts.length - 1 ? (
            <span aria-hidden="true" className="clock-line__time-separator">
              :
            </span>
          ) : null}
        </span>
      ))}
    </p>
  );
}
