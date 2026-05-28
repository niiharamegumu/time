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
        workStartTime: "08:45",
        workEndTime: "13:00",
      }),
    ).toEqual({
      ...defaultSettings,
      workProgressEnabled: true,
      workStartTime: "08:45",
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

  it("keeps a valid break schedule", () => {
    expect(
      normalizeSettings({
        workProgressEnabled: true,
        workStartTime: "09:00",
        workEndTime: "18:00",
        breakEnabled: true,
        breakStartTime: "12:00",
        breakEndTime: "13:00",
      }),
    ).toEqual({
      ...defaultSettings,
      breakEnabled: true,
      breakStartTime: "12:00",
      breakEndTime: "13:00",
    });
  });

  it("preserves an explicit disabled break schedule after migration", () => {
    expect(
      normalizeSettings({
        schemaVersion: 2,
        workProgressEnabled: true,
        workStartTime: "09:00",
        workEndTime: "18:00",
        breakEnabled: false,
        breakStartTime: "12:00",
        breakEndTime: "13:00",
      }),
    ).toEqual({
      ...defaultSettings,
      breakEnabled: false,
      breakStartTime: defaultSettings.breakStartTime,
      breakEndTime: defaultSettings.breakEndTime,
    });
  });

  it("clears invalid display modes", () => {
    expect(
      normalizeSettings({
        displayMode: "expanded",
      }),
    ).toEqual(defaultSettings);
  });

  it("clears invalid work schedules", () => {
    expect(
      normalizeSettings({
        workStartTime: "09:60",
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
