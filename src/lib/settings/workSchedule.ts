export const WORK_PROGRESS_STEP_MINUTES = 30;

export type WorkDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type WorkSchedule = {
  workProgressEnabled?: boolean;
  workStartTime: string | null;
  workEndTime: string | null;
  breakEnabled?: boolean;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  workDays?: WorkDay[];
};

const WORK_TIME_PATTERN = /^([01]\d|2[0-3]):(00|30)$/;
export const DEFAULT_WORK_DAYS: WorkDay[] = ["mon", "tue", "wed", "thu", "fri"];

export function isValidWorkTime(value: string) {
  return WORK_TIME_PATTERN.test(value);
}

export function parseWorkTimeToMinutes(value: string | null) {
  if (!value || !isValidWorkTime(value)) {
    return null;
  }

  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

export function normalizeWorkSchedule(
  workStartTime: string | null,
  workEndTime: string | null,
  breakStartTime: string | null = null,
  breakEndTime: string | null = null,
  breakEnabled = false,
  workDays: WorkDay[] = DEFAULT_WORK_DAYS,
): WorkSchedule {
  const normalizedStart = typeof workStartTime === "string" ? workStartTime : null;
  const normalizedEnd = typeof workEndTime === "string" ? workEndTime : null;
  const normalizedBreakStart =
    typeof breakStartTime === "string" ? breakStartTime : null;
  const normalizedBreakEnd = typeof breakEndTime === "string" ? breakEndTime : null;
  const startMinutes = parseWorkTimeToMinutes(normalizedStart);
  const endMinutes = parseWorkTimeToMinutes(normalizedEnd);
  const breakStartMinutes = parseWorkTimeToMinutes(normalizedBreakStart);
  const breakEndMinutes = parseWorkTimeToMinutes(normalizedBreakEnd);
  const hasValidBreak =
    breakEnabled &&
    breakStartMinutes !== null &&
    breakEndMinutes !== null &&
    breakStartMinutes < breakEndMinutes;

  if (
    normalizedStart === null ||
    normalizedEnd === null ||
    startMinutes === null ||
    endMinutes === null ||
    startMinutes >= endMinutes
  ) {
    return {
      workStartTime: null,
      workEndTime: null,
    };
  }

  return {
    workStartTime: normalizedStart,
    workEndTime: normalizedEnd,
    breakEnabled: hasValidBreak,
    breakStartTime: hasValidBreak ? normalizedBreakStart : null,
    breakEndTime: hasValidBreak ? normalizedBreakEnd : null,
    workDays,
  };
}
