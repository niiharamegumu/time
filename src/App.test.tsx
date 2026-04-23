import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import {
  ALWAYS_ON_TOP_CHANGED_EVENT,
  SETTINGS_SYNC_EVENT,
} from "./lib/settings/settings.events";
import { APP_SETTINGS_STORAGE_KEY } from "./lib/settings/settings.storage";
import { defaultSettings } from "./lib/settings/settings.types";

const hide = vi.fn();
const innerSize = vi.fn(async () => ({
  toLogical: () => ({
    width: 1280,
    height: 860,
  }),
}));
const unlistenCloseRequested = vi.fn();
const emit = vi.fn();
const checkForUpdates = vi.fn();
const unlistenEvent = vi.fn();
const onCloseRequested = vi.fn();
const scaleFactor = vi.fn(async () => 1);
const setMinSize = vi.fn(async () => undefined);
const setSize = vi.fn(async () => undefined);

let closeRequestedHandler:
  | ((event: { preventDefault: () => void }) => void)
  | undefined;
let alwaysOnTopListener:
  | ((event: { payload: { alwaysOnTop: boolean } }) => void)
  | undefined;
let settingsSyncListener:
  | ((event: { payload: typeof defaultSettings }) => void)
  | undefined;
let currentWindowLabel = "main";
let currentTheme = "light";

vi.mock("./hooks/useNow", () => ({
  useNow: () => new Date("2026-04-21T09:08:07"),
}));

vi.mock("./hooks/useTheme", () => ({
  useTheme: () => currentTheme,
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    label: currentWindowLabel,
    hide,
    innerSize,
    onCloseRequested: onCloseRequested.mockImplementation(async (handler) => {
      closeRequestedHandler = handler;
      return unlistenCloseRequested;
    }),
    scaleFactor,
    setMinSize,
    setSize,
  }),
}));

vi.mock("@tauri-apps/api/event", () => ({
  emit: vi.fn(async (...args: unknown[]) => emit(...args)),
  listen: vi.fn(async (eventName: string, handler: unknown) => {
    if (eventName === ALWAYS_ON_TOP_CHANGED_EVENT) {
      alwaysOnTopListener = handler as (
        event: { payload: { alwaysOnTop: boolean } },
      ) => void;
    }

    if (eventName === SETTINGS_SYNC_EVENT) {
      settingsSyncListener = handler as (
        event: { payload: typeof defaultSettings },
      ) => void;
    }

    return unlistenEvent;
  }),
}));

vi.mock("@tauri-apps/plugin-updater", () => ({
  check: (...args: unknown[]) => checkForUpdates(...args),
}));

describe("App", () => {
  beforeEach(() => {
    vi.stubEnv("PROD", true);
    closeRequestedHandler = undefined;
    alwaysOnTopListener = undefined;
    settingsSyncListener = undefined;
    currentWindowLabel = "main";
    currentTheme = "light";
    localStorage.clear();
    emit.mockReset();
    hide.mockReset();
    innerSize.mockClear();
    checkForUpdates.mockReset();
    onCloseRequested.mockClear();
    scaleFactor.mockClear();
    setMinSize.mockReset();
    setSize.mockReset();
    unlistenCloseRequested.mockReset();
    unlistenEvent.mockReset();
  });

  it("does not emit settings sync from the main window", async () => {
    render(<App />);

    expect(emit).not.toHaveBeenCalledWith("settings:sync", expect.anything());
  });

  it("renders the dedicated settings window when opened from native UI", () => {
    currentWindowLabel = "settings";

    render(<App />);

    expect(
      screen.getByRole("region", { name: "Settings panel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "アップデート" }),
    ).toBeInTheDocument();
    expect(onCloseRequested).not.toHaveBeenCalled();
    expect(emit).toHaveBeenCalledWith("settings:sync", defaultSettings);
  });

  it("passes the current theme to the main clock window", () => {
    currentTheme = "dark";

    render(<App />);

    expect(screen.getByRole("main")).toHaveAttribute("data-theme", "dark");
  });

  it("updates always-on-top when the settings checkbox changes", async () => {
    currentWindowLabel = "settings";

    render(<App />);

    fireEvent.click(screen.getByRole("checkbox", { name: "常に手前に表示" }));

    expect(
      JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY) ?? ""),
    ).toEqual(
      expect.objectContaining({
        alwaysOnTop: true,
      }),
    );
  });

  it("saves work schedule when both start and end times are valid", () => {
    currentWindowLabel = "settings";

    render(<App />);

    fireEvent.click(screen.getByRole("checkbox", { name: "仕事時間を表示" }));
    fireEvent.change(screen.getByLabelText("仕事開始時刻"), {
      target: { value: "09:00" },
    });
    fireEvent.change(screen.getByLabelText("仕事終了時刻"), {
      target: { value: "13:00" },
    });

    expect(
      JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY) ?? ""),
    ).toEqual(
      expect.objectContaining({
        workProgressEnabled: true,
        workStartTime: "09:00",
        workEndTime: "13:00",
      }),
    );
  });

  it("hides the window instead of closing it", async () => {
    render(<App />);

    await waitFor(() => {
      expect(closeRequestedHandler).toBeTypeOf("function");
    });

    const preventDefault = vi.fn();

    closeRequestedHandler?.({ preventDefault });

    expect(preventDefault).toHaveBeenCalled();
    expect(hide).toHaveBeenCalled();
  });

  it("syncs tray toggle events back into the UI state", async () => {
    currentWindowLabel = "settings";

    render(<App />);

    await waitFor(() => {
      expect(alwaysOnTopListener).toBeTypeOf("function");
    });

    await act(async () => {
      alwaysOnTopListener?.({
        payload: {
          alwaysOnTop: true,
        },
      });
    });

    expect(screen.getByRole("checkbox", { name: "常に手前に表示" })).toBeChecked();
  });

  it("shows the up-to-date state after a manual update check", async () => {
    currentWindowLabel = "settings";
    checkForUpdates.mockResolvedValue(null);

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "アップデート" }));
    fireEvent.click(screen.getByRole("button", { name: "更新をチェック" }));

    await waitFor(() => {
      expect(screen.getByText("最新です")).toBeInTheDocument();
    });
  });

  it("updates the main clock when another window syncs work schedule settings", async () => {
    render(<App />);

    await waitFor(() => {
      expect(settingsSyncListener).toBeTypeOf("function");
    });

    await act(async () => {
      settingsSyncListener?.({
        payload: {
          ...defaultSettings,
          workProgressEnabled: true,
          workStartTime: "09:00",
          workEndTime: "13:00",
        },
      });
    });

    expect(screen.getByText("仕事")).toBeInTheDocument();
  });

  it("raises the main window minimum height when work progress is configured", async () => {
    render(<App />);

    await waitFor(() => {
      expect(settingsSyncListener).toBeTypeOf("function");
    });

    await act(async () => {
      settingsSyncListener?.({
        payload: {
          ...defaultSettings,
          workProgressEnabled: true,
          workStartTime: "09:00",
          workEndTime: "13:00",
        },
      });
    });

    await waitFor(() => {
      expect(setMinSize).toHaveBeenLastCalledWith(
        expect.objectContaining({
          width: 1120,
          height: 860,
        }),
      );
    });
  });

  it("toggles work progress visibility without clearing saved hours", () => {
    currentWindowLabel = "settings";

    render(<App />);

    fireEvent.click(screen.getByRole("checkbox", { name: "仕事時間を表示" }));
    fireEvent.change(screen.getByLabelText("仕事開始時刻"), {
      target: { value: "09:00" },
    });
    fireEvent.change(screen.getByLabelText("仕事終了時刻"), {
      target: { value: "13:00" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "仕事時間を表示" }));

    expect(
      JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY) ?? ""),
    ).toEqual(
      expect.objectContaining({
        workProgressEnabled: false,
        workStartTime: "09:00",
        workEndTime: "13:00",
      }),
    );
  });

  it("keeps toggling the work progress checkbox on repeated clicks", () => {
    currentWindowLabel = "settings";

    render(<App />);

    const checkbox = screen.getByRole("checkbox", { name: "仕事時間を表示" });

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
