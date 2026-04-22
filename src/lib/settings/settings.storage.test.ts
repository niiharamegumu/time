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
