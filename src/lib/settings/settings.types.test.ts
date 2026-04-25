import { describe, expect, it } from "vitest";
import { defaultSettings } from "./settings.types";

describe("defaultSettings", () => {
  it("matches the MVP defaults", () => {
    expect(defaultSettings).toEqual({
      schemaVersion: 2,
      alwaysOnTop: false,
      launchAtLogin: false,
      showDockIcon: false,
      timezone: "Asia/Tokyo",
      displayMode: "standard",
      workProgressEnabled: true,
      workStartTime: "09:00",
      workEndTime: "18:00",
      breakEnabled: true,
      breakStartTime: "12:00",
      breakEndTime: "13:00",
      workDays: ["mon", "tue", "wed", "thu", "fri"],
      showSeconds: true,
      timeFormat: "24h",
      showWeekday: true,
      locale: "en-US",
      themeMode: "light",
      opacity: 1,
    });
  });
});
