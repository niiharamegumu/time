import { formatDate } from "../lib/datetime/formatDate";
import { formatTime } from "../lib/datetime/formatTime";
import { formatWeekday } from "../lib/datetime/formatWeekday";
import { getCalendarProgress } from "../lib/datetime/getCalendarProgress";
import { getWorkProgress } from "../lib/datetime/getWorkProgress";
import type { AppSettings } from "../lib/settings/settings.types";
import { DotGrid } from "./DotGrid";
import { DotRow } from "./DotRow";

type ClockPanelProps = {
  now: Date;
  settings: AppSettings;
};

export function ClockPanel({ now, settings }: ClockPanelProps) {
  const {
    dayDotCount,
    daysInMonth,
    daysInYear,
    filledDayDots,
    filledMonthDots,
    filledYearDots,
  } = getCalendarProgress(now);
  const { showWorkProgress, workDotCount, filledWorkDots } = getWorkProgress(
    now,
    settings,
  );
  const [hours, minutes, seconds] = formatTime(now).split(":");

  return (
    <section aria-label="Clock panel" className="clock-panel">
      <div className="clock-panel__frame">
        <section className="clock-section">
          <p className="clock-section__label">年月日</p>
          <div className="clock-section__date-row">
            <p className="clock-section__date">{formatDate(now)}</p>
            <p className="clock-section__weekday">{formatWeekday(now)}</p>
          </div>
        </section>

        <section className="clock-section">
          <p className="clock-section__label">時分秒</p>
          <div className="clock-section__time-row">
            <p className="clock-section__time-main">{`${hours}:${minutes}`}</p>
            <p className="clock-section__time-seconds">{seconds}</p>
          </div>
        </section>

        {showWorkProgress ? (
          <section className="clock-section">
            <p className="clock-section__label">仕事</p>
            <DotRow
              count={workDotCount}
              filledCount={filledWorkDots}
              label="仕事 progress dots"
              size="work"
            />
          </section>
        ) : null}

        <section className="clock-section">
          <p className="clock-section__label">日</p>
          <DotRow
            count={dayDotCount}
            filledCount={filledDayDots}
            label="1日 progress dots"
            size="day"
          />
        </section>

        <section className="clock-section">
          <p className="clock-section__label">月</p>
          <DotRow
            count={daysInMonth}
            filledCount={filledMonthDots}
            label="ひと月 progress dots"
            size="month"
            wrap
          />
        </section>

        <section className="clock-section">
          <p className="clock-section__label">年</p>
          <DotGrid
            count={daysInYear}
            filledCount={filledYearDots}
            label="1年 progress dots"
          />
        </section>
      </div>
    </section>
  );
}
