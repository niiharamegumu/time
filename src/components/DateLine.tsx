import { formatDate } from "../lib/datetime/formatDate";
import { formatWeekday } from "../lib/datetime/formatWeekday";

type DateLineProps = {
  now: Date;
};

export function DateLine({ now }: DateLineProps) {
  return (
    <p className="clock-line clock-line--date" aria-label="Current date">
      {`${formatDate(now)}（${formatWeekday(now)}）`}
    </p>
  );
}
