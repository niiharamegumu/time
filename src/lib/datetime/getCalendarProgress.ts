const HOURS_IN_DAY = 24;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type CalendarProgress = {
  dayDotCount: number;
  daysInMonth: number;
  daysInYear: number;
  dayOfMonth: number;
  dayOfYear: number;
  filledDayDots: number;
  filledMonthDots: number;
  filledYearDots: number;
};

function getStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDaysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function getDaysInYear(date: Date) {
  const year = date.getFullYear();
  return new Date(year, 1, 29).getMonth() === 1 ? 366 : 365;
}

export function getDayOfYear(date: Date) {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const currentDay = getStartOfDay(date);
  return Math.floor((currentDay.getTime() - startOfYear.getTime()) / MS_PER_DAY) + 1;
}

export function getCalendarProgress(now: Date): CalendarProgress {
  const dayOfMonth = now.getDate();
  const dayOfYear = getDayOfYear(now);
  const daysInMonth = getDaysInMonth(now);
  const daysInYear = getDaysInYear(now);

  return {
    dayDotCount: HOURS_IN_DAY,
    daysInMonth,
    daysInYear,
    dayOfMonth,
    dayOfYear,
    filledDayDots: now.getHours(),
    filledMonthDots: dayOfMonth,
    filledYearDots: dayOfYear,
  };
}
