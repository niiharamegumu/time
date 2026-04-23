import { describe, expect, it } from "vitest";
import {
  getCalendarProgress,
  getDayOfYear,
  getDaysInMonth,
  getDaysInYear,
} from "./getCalendarProgress";

describe("getCalendarProgress", () => {
  it("uses the current hour for filled day dots", () => {
    expect(getCalendarProgress(new Date(2026, 3, 22, 0, 0, 0)).filledDayDots).toBe(0);
    expect(getCalendarProgress(new Date(2026, 3, 22, 16, 8, 32)).filledDayDots).toBe(16);
  });

  it("matches the number of days in a 30-day month", () => {
    const progress = getCalendarProgress(new Date(2026, 3, 22, 16, 8, 32));

    expect(progress.daysInMonth).toBe(30);
    expect(progress.filledMonthDots).toBe(22);
  });

  it("matches the number of days in a 31-day month", () => {
    const progress = getCalendarProgress(new Date(2026, 6, 31, 12, 0, 0));

    expect(progress.daysInMonth).toBe(31);
    expect(progress.filledMonthDots).toBe(31);
  });

  it("handles February in a leap year", () => {
    const progress = getCalendarProgress(new Date(2028, 1, 29, 9, 0, 0));

    expect(progress.daysInMonth).toBe(29);
    expect(progress.daysInYear).toBe(366);
    expect(progress.filledMonthDots).toBe(29);
    expect(progress.filledYearDots).toBe(60);
  });
});

describe("calendar helpers", () => {
  it("returns the correct days in month", () => {
    expect(getDaysInMonth(new Date(2026, 1, 1))).toBe(28);
    expect(getDaysInMonth(new Date(2028, 1, 1))).toBe(29);
  });

  it("returns the correct days in year", () => {
    expect(getDaysInYear(new Date(2026, 0, 1))).toBe(365);
    expect(getDaysInYear(new Date(2028, 0, 1))).toBe(366);
  });

  it("returns the day of year from the local calendar day", () => {
    expect(getDayOfYear(new Date(2026, 0, 1, 23, 59, 59))).toBe(1);
    expect(getDayOfYear(new Date(2026, 11, 31, 12, 0, 0))).toBe(365);
  });
});
