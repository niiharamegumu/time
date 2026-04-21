import { describe, expect, it } from "vitest";
import { getDayPhase } from "./getDayPhase";

describe("getDayPhase", () => {
  it("returns morning between 05:00 and 10:59", () => {
    expect(getDayPhase(new Date("2026-04-21T05:00:00"))).toBe("morning");
    expect(getDayPhase(new Date("2026-04-21T10:59:59"))).toBe("morning");
  });

  it("returns daytime between 11:00 and 16:59", () => {
    expect(getDayPhase(new Date("2026-04-21T11:00:00"))).toBe("daytime");
    expect(getDayPhase(new Date("2026-04-21T16:59:59"))).toBe("daytime");
  });

  it("returns evening between 17:00 and 20:59", () => {
    expect(getDayPhase(new Date("2026-04-21T17:00:00"))).toBe("evening");
    expect(getDayPhase(new Date("2026-04-21T20:59:59"))).toBe("evening");
  });

  it("returns night otherwise", () => {
    expect(getDayPhase(new Date("2026-04-21T04:59:59"))).toBe("night");
    expect(getDayPhase(new Date("2026-04-21T21:00:00"))).toBe("night");
  });
});
