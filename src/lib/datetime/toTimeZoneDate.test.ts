import { describe, expect, it } from "vitest";
import { toTimeZoneDate } from "./toTimeZoneDate";

describe("toTimeZoneDate", () => {
  it("maps an absolute instant to Asia/Tokyo calendar fields", () => {
    const zonedDate = toTimeZoneDate(
      new Date("2026-04-23T23:54:54.000Z"),
      "Asia/Tokyo",
    );

    expect(zonedDate.getFullYear()).toBe(2026);
    expect(zonedDate.getMonth()).toBe(3);
    expect(zonedDate.getDate()).toBe(24);
    expect(zonedDate.getHours()).toBe(8);
    expect(zonedDate.getMinutes()).toBe(54);
    expect(zonedDate.getSeconds()).toBe(54);
  });
});
