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
      workStatus: "active",
      workDotCount: 4,
      workDotProgress: 0,
      completedWorkHours: 0,
      totalWorkHours: 4,
    });
  });

  it("shows zero progress before work starts", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 23, 8, 59, 0), schedule).workDotProgress,
    ).toBe(0);
  });

  it("returns live dot progress and completed half-hour display values", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 23, 10, 15, 0), schedule).workDotProgress,
    ).toBe(1.25);
    expect(
      getWorkProgress(new Date(2026, 3, 23, 10, 15, 0), schedule).completedWorkHours,
    ).toBe(1);
    expect(
      getWorkProgress(new Date(2026, 3, 23, 10, 30, 0), schedule).completedWorkHours,
    ).toBe(1.5);
  });

  it("supports schedules that start on non-half-hour minutes", () => {
    const progress = getWorkProgress(new Date(2026, 3, 23, 9, 45, 0), {
      ...schedule,
      workStartTime: "08:45",
      workEndTime: "18:00",
    });

    expect(progress.totalWorkHours).toBe(9.25);
    expect(progress.workDotProgress).toBe(1);
    expect(progress.completedWorkHours).toBe(1);
  });

  it("caps progress at the total after work ends", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 23, 13, 0, 0), schedule).workDotProgress,
    ).toBe(4);
    expect(
      getWorkProgress(new Date(2026, 3, 23, 15, 0, 0), schedule).workDotProgress,
    ).toBe(4);
  });

  it("subtracts a configured break from total and elapsed work time", () => {
    const progress = getWorkProgress(new Date(2026, 3, 23, 14, 30, 0), {
      ...schedule,
      workEndTime: "18:00",
      breakEnabled: true,
      breakStartTime: "12:00",
      breakEndTime: "13:00",
    });

    expect(progress.totalWorkHours).toBe(8);
    expect(progress.workDotCount).toBe(8);
    expect(progress.completedWorkHours).toBe(4.5);
  });

  it("pauses progress status during the configured break", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 23, 12, 30, 0), {
        ...schedule,
        workEndTime: "18:00",
        breakEnabled: true,
        breakStartTime: "12:00",
        breakEndTime: "13:00",
      }).workStatus,
    ).toBe("break");
  });

  it("shows work as off outside configured work days", () => {
    expect(
      getWorkProgress(new Date(2026, 3, 25, 10, 0, 0), {
        ...schedule,
        workDays: ["mon", "tue", "wed", "thu", "fri"],
      }),
    ).toEqual({
      showWorkProgress: true,
      workStatus: "off",
      workDotCount: 0,
      workDotProgress: 0,
      completedWorkHours: 0,
      totalWorkHours: 0,
    });
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
      workStatus: "active",
      workDotCount: 0,
      workDotProgress: 0,
      completedWorkHours: 0,
      totalWorkHours: 0,
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
      workStatus: "active",
      workDotCount: 0,
      workDotProgress: 0,
      completedWorkHours: 0,
      totalWorkHours: 0,
    });
  });
});
