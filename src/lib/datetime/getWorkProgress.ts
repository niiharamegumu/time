import type { WorkSchedule } from "../settings/workSchedule";
import {
  DEFAULT_WORK_DAYS,
  parseWorkTimeToMinutes,
} from "../settings/workSchedule";

const MINUTES_IN_HOUR = 60;
const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

export type WorkProgress = {
  showWorkProgress: boolean;
  workStatus: "active" | "break" | "off";
  workDotCount: number;
  workDotProgress: number;
  completedWorkHours: number;
  totalWorkHours: number;
};

function getEmptyWorkProgress(
  showWorkProgress: boolean,
  workStatus: WorkProgress["workStatus"] = "active",
): WorkProgress {
  return {
    showWorkProgress,
    workStatus,
    workDotCount: 0,
    workDotProgress: 0,
    completedWorkHours: 0,
    totalWorkHours: 0,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getOverlapMinutes(
  rangeStart: number,
  rangeEnd: number,
  overlapStart: number,
  overlapEnd: number,
) {
  return Math.max(
    0,
    Math.min(rangeEnd, overlapEnd) - Math.max(rangeStart, overlapStart),
  );
}

export function getWorkProgress(
  now: Date,
  schedule: WorkSchedule,
): WorkProgress {
  if (!schedule.workProgressEnabled) {
    return getEmptyWorkProgress(false);
  }

  const startMinutes = parseWorkTimeToMinutes(schedule.workStartTime);
  const endMinutes = parseWorkTimeToMinutes(schedule.workEndTime);
  const breakStartMinutes = parseWorkTimeToMinutes(
    schedule.breakStartTime ?? null,
  );
  const breakEndMinutes = parseWorkTimeToMinutes(schedule.breakEndTime ?? null);

  if (
    startMinutes === null ||
    endMinutes === null ||
    startMinutes >= endMinutes
  ) {
    return getEmptyWorkProgress(false);
  }

  const workDays = schedule.workDays ?? DEFAULT_WORK_DAYS;
  const currentWeekday = WEEKDAYS[now.getDay()];

  if (!workDays.includes(currentWeekday)) {
    return getEmptyWorkProgress(true, "off");
  }

  const hasBreak =
    schedule.breakEnabled === true &&
    breakStartMinutes !== null &&
    breakEndMinutes !== null &&
    breakStartMinutes < breakEndMinutes;
  const breakDurationMinutes = hasBreak
    ? getOverlapMinutes(startMinutes, endMinutes, breakStartMinutes, breakEndMinutes)
    : 0;
  const totalWorkMinutes = endMinutes - startMinutes - breakDurationMinutes;

  if (totalWorkMinutes <= 0) {
    return getEmptyWorkProgress(false);
  }

  const nowMinutes =
    now.getHours() * MINUTES_IN_HOUR +
    now.getMinutes() +
    now.getSeconds() / MINUTES_IN_HOUR;
  const elapsedRangeMinutes = clamp(nowMinutes - startMinutes, 0, endMinutes - startMinutes);
  const elapsedBreakMinutes = hasBreak
    ? getOverlapMinutes(
        startMinutes,
        startMinutes + elapsedRangeMinutes,
        breakStartMinutes,
        breakEndMinutes,
      )
    : 0;
  const elapsedWorkMinutes = clamp(
    elapsedRangeMinutes - elapsedBreakMinutes,
    0,
    totalWorkMinutes,
  );
  const totalWorkHours = totalWorkMinutes / MINUTES_IN_HOUR;
  const completedWorkHours = Math.floor(elapsedWorkMinutes / 30) / 2;
  const isBreak =
    hasBreak && nowMinutes >= breakStartMinutes && nowMinutes < breakEndMinutes;

  return {
    showWorkProgress: true,
    workStatus: isBreak ? "break" : "active",
    workDotCount: Math.ceil(totalWorkHours),
    workDotProgress: elapsedWorkMinutes / MINUTES_IN_HOUR,
    completedWorkHours: Math.min(completedWorkHours, totalWorkHours),
    totalWorkHours,
  };
}
