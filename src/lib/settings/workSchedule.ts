export const WORK_PROGRESS_STEP_MINUTES = 30;

export type WorkSchedule = {
  workProgressEnabled?: boolean;
  workStartTime: string | null;
  workEndTime: string | null;
};

const WORK_TIME_PATTERN = /^([01]\d|2[0-3]):(00|30)$/;

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
): WorkSchedule {
  const normalizedStart = typeof workStartTime === "string" ? workStartTime : null;
  const normalizedEnd = typeof workEndTime === "string" ? workEndTime : null;
  const startMinutes = parseWorkTimeToMinutes(normalizedStart);
  const endMinutes = parseWorkTimeToMinutes(normalizedEnd);

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
  };
}
