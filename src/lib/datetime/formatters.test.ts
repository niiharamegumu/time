import { describe, expect, it } from "vitest";
import { formatDate } from "./formatDate";
import { formatTime } from "./formatTime";
import { formatWeekday } from "./formatWeekday";

describe("datetime formatters", () => {
  const date = new Date("2026-04-21T09:08:07");

  it("formats time with seconds", () => {
    expect(formatTime(date)).toBe("09 : 08 : 07");
  });

  it("formats date as YYYY年MM月DD日", () => {
    expect(formatDate(date)).toBe("2026年04月21日");
  });

  it("formats weekday in Japanese", () => {
    expect(formatWeekday(date)).toBe("火");
  });
});
