import { describe, expect, it } from "vitest";
import {
  APP_SETTINGS_STORAGE_KEY,
  loadSettings,
  normalizeSettings,
} from "./settings.storage";
import { defaultSettings } from "./settings.types";

describe("normalizeSettings", () => {
  it("fills missing values from defaults", () => {
    expect(
      normalizeSettings({
        alwaysOnTop: true,
      }),
    ).toEqual({
      ...defaultSettings,
      alwaysOnTop: true,
    });
  });

  it("keeps a valid work schedule", () => {
    expect(
      normalizeSettings({
        workProgressEnabled: true,
        workStartTime: "09:00",
        workEndTime: "13:00",
      }),
    ).toEqual({
      ...defaultSettings,
      workProgressEnabled: true,
      workStartTime: "09:00",
      workEndTime: "13:00",
    });
  });

  it("enables work progress for legacy saved schedules", () => {
    expect(
      normalizeSettings({
        workStartTime: "09:00",
        workEndTime: "13:00",
      }),
    ).toEqual({
      ...defaultSettings,
      workProgressEnabled: true,
      workStartTime: "09:00",
      workEndTime: "13:00",
    });
  });

  it("clears invalid work schedules", () => {
    expect(
      normalizeSettings({
        workStartTime: "09:15",
        workEndTime: "13:00",
      }),
    ).toEqual(defaultSettings);
    expect(
      normalizeSettings({
        workStartTime: "13:00",
        workEndTime: "09:00",
      }),
    ).toEqual(defaultSettings);
    expect(
      normalizeSettings({
        workStartTime: "09:00",
      }),
    ).toEqual(defaultSettings);
  });
});

describe("loadSettings", () => {
  it("returns defaults when nothing is stored", () => {
    localStorage.clear();

    expect(loadSettings()).toEqual(defaultSettings);
  });

  it("prefers the saved value when one exists", () => {
    localStorage.setItem(
      APP_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        alwaysOnTop: true,
      }),
    );

    expect(loadSettings()).toEqual({
      ...defaultSettings,
      alwaysOnTop: true,
    });
  });

  it("falls back to defaults when saved JSON is invalid", () => {
    localStorage.setItem(APP_SETTINGS_STORAGE_KEY, "{invalid");

    expect(loadSettings()).toEqual(defaultSettings);
  });
});
