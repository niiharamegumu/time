const HOURS_IN_DAY = 24;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const SECONDS_IN_DAY = 24 * 60 * 60;

export type CalendarProgress = {
  dayDotCount: number;
  daysInMonth: number;
  daysInYear: number;
  yearDotCount: number;
  dayOfMonth: number;
  dayOfYear: number;
  dayUnitCount: number;
  monthUnitCount: number;
  yearUnitCount: number;
  dayDotProgress: number;
  monthDotProgress: number;
  yearDotProgress: number;
  dayPercent: number;
  yearPercent: number;
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

function getElapsedSecondsSince(start: Date, now: Date) {
  return Math.max(0, (now.getTime() - start.getTime()) / 1000);
}

export function getCalendarProgress(now: Date): CalendarProgress {
  const dayOfMonth = now.getDate();
  const dayOfYear = getDayOfYear(now);
  const daysInMonth = getDaysInMonth(now);
  const daysInYear = getDaysInYear(now);
  const yearDotCount = Math.ceil(daysInYear / 7);
  const startOfDay = getStartOfDay(now);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const elapsedSecondsOfDay = getElapsedSecondsSince(startOfDay, now);
  const elapsedSecondsOfMonth = getElapsedSecondsSince(startOfMonth, now);
  const elapsedSecondsOfYear = getElapsedSecondsSince(startOfYear, now);
  const totalSecondsOfMonth = daysInMonth * SECONDS_IN_DAY;
  const totalSecondsOfYear = daysInYear * SECONDS_IN_DAY;
  const dayProgress = elapsedSecondsOfDay / SECONDS_IN_DAY;
  const yearProgress = elapsedSecondsOfYear / totalSecondsOfYear;

  return {
    dayDotCount: HOURS_IN_DAY,
    daysInMonth,
    daysInYear,
    yearDotCount,
    dayOfMonth,
    dayOfYear,
    dayUnitCount: Math.floor(dayProgress * HOURS_IN_DAY),
    monthUnitCount: dayOfMonth,
    yearUnitCount: Math.ceil(dayOfYear / 7),
    dayDotProgress: dayProgress * HOURS_IN_DAY,
    monthDotProgress: (elapsedSecondsOfMonth / totalSecondsOfMonth) * daysInMonth,
    yearDotProgress: yearProgress * yearDotCount,
    dayPercent: Math.floor(dayProgress * 100),
    yearPercent: Math.floor(yearProgress * 100),
  };
}
