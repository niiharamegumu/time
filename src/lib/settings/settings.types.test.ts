import { describe, expect, it } from "vitest";
import { defaultSettings } from "./settings.types";

describe("defaultSettings", () => {
  it("matches the MVP defaults", () => {
    expect(defaultSettings).toEqual({
      alwaysOnTop: true,
      showSeconds: true,
      timeFormat: "24h",
      showWeekday: true,
      locale: "ja-JP",
      themeMode: "system",
      opacity: 1,
    });
  });
});
