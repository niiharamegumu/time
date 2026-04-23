import { describe, expect, it } from "vitest";
import { formatDate } from "./formatDate";
import { formatTime } from "./formatTime";
import { formatWeekday } from "./formatWeekday";

describe("datetime formatters", () => {
  const date = new Date(2026, 3, 22, 16, 8, 32);

  it("formats time with seconds", () => {
    expect(formatTime(date)).toBe("16:08:32");
  });

  it("formats date as YYYY.MM.DD", () => {
    expect(formatDate(date)).toBe("2026.04.22");
  });

  it("formats weekday in Japanese", () => {
    expect(formatWeekday(date)).toBe("水");
  });
});
