import type { WorkSchedule } from "../settings/workSchedule";
import {
  parseWorkTimeToMinutes,
  WORK_PROGRESS_STEP_MINUTES,
} from "../settings/workSchedule";

export type WorkProgress = {
  showWorkProgress: boolean;
  workDotCount: number;
  filledWorkDots: number;
};

export function getWorkProgress(
  now: Date,
  schedule: WorkSchedule,
): WorkProgress {
  if (!schedule.workProgressEnabled) {
    return {
      showWorkProgress: false,
      workDotCount: 0,
      filledWorkDots: 0,
    };
  }

  const startMinutes = parseWorkTimeToMinutes(schedule.workStartTime);
  const endMinutes = parseWorkTimeToMinutes(schedule.workEndTime);

  if (
    startMinutes === null ||
    endMinutes === null ||
    startMinutes >= endMinutes
  ) {
    return {
      showWorkProgress: false,
      workDotCount: 0,
      filledWorkDots: 0,
    };
  }

  const workDotCount = (endMinutes - startMinutes) / WORK_PROGRESS_STEP_MINUTES;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const elapsedMinutes = Math.max(0, nowMinutes - startMinutes);
  const filledWorkDots = Math.min(
    workDotCount,
    Math.floor(elapsedMinutes / WORK_PROGRESS_STEP_MINUTES),
  );

  return {
    showWorkProgress: true,
    workDotCount,
    filledWorkDots,
  };
}
