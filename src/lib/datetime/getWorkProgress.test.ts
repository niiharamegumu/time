import { describe, expect, it } from "vitest";
import { getWorkProgress } from "./getWorkProgress";

describe("getWorkProgress", () => {
  const schedule = {
    workProgressEnabled: true,
    workStartTime: "09:00",
    workEndTime: "13:00",
  } as const;

  it("returns the correct total dot count", () => {
    expect(getWorkProgress(new Date(2026, 3, 23, 9, 0, 0), schedule)).toEqual({
      showWorkProgress: true,
      workDotCount: 8,
      filledWorkDots: 0,
    });
  });

  it("shows zero progress before work starts", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 23, 8, 59, 0), schedule).filledWorkDots,
    ).toBe(0);
  });

  it("counts elapsed 30 minute blocks with floor semantics", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 23, 10, 15, 0), schedule).filledWorkDots,
    ).toBe(2);
    expect(
      getWorkProgress(new Date(2026, 3, 23, 10, 30, 0), schedule).filledWorkDots,
    ).toBe(3);
  });

  it("caps progress at the total after work ends", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 23, 13, 0, 0), schedule).filledWorkDots,
    ).toBe(8);
    expect(
      getWorkProgress(new Date(2026, 3, 23, 15, 0, 0), schedule).filledWorkDots,
    ).toBe(8);
  });

  it("hides the section when the schedule is unset or invalid", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 23, 10, 0, 0), {
        workProgressEnabled: false,
        workStartTime: null,
        workEndTime: null,
      }),
    ).toEqual({
      showWorkProgress: false,
      workDotCount: 0,
      filledWorkDots: 0,
    });
  });

  it("hides the section when work progress is turned off", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 23, 10, 0, 0), {
        workProgressEnabled: false,
        workStartTime: "09:00",
        workEndTime: "13:00",
      }),
    ).toEqual({
      showWorkProgress: false,
      workDotCount: 0,
      filledWorkDots: 0,
    });
  });
});
