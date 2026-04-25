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
const invoke = vi.fn(async (command?: string, args?: unknown) => {
  void command;
  void args;
});
const innerSize = vi.fn(async () => ({
  toLogical: () => ({
    width: 1280,
    height: 860,
  }),
}));
const unlistenCloseRequested = vi.fn();
const emit = vi.fn();
const checkForUpdates = vi.fn();
const enableAutostart = vi.fn(async () => undefined);
const disableAutostart = vi.fn(async () => undefined);
const isAutostartEnabled = vi.fn(async () => false);
const unlistenEvent = vi.fn();
const onCloseRequested = vi.fn();
const scaleFactor = vi.fn(async () => 1);
const setMinSize = vi.fn(async () => undefined);
const setSize = vi.fn(async () => undefined);
const startDragging = vi.fn(async () => undefined);

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
    startDragging,
  }),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (command: string, args?: unknown) => invoke(command, args),
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

vi.mock("@tauri-apps/plugin-autostart", () => ({
  disable: () => disableAutostart(),
  enable: () => enableAutostart(),
  isEnabled: () => isAutostartEnabled(),
}));

describe("App", () => {
  beforeEach(() => {
    vi.stubEnv("PROD", true);
    Object.defineProperty(window, "__TAURI_INTERNALS__", {
      configurable: true,
      value: {},
    });
    closeRequestedHandler = undefined;
    alwaysOnTopListener = undefined;
    settingsSyncListener = undefined;
    currentWindowLabel = "main";
    currentTheme = "light";
    localStorage.clear();
    emit.mockReset();
    invoke.mockClear();
    hide.mockReset();
    innerSize.mockClear();
    checkForUpdates.mockReset();
    enableAutostart.mockClear();
    disableAutostart.mockClear();
    isAutostartEnabled.mockClear();
    isAutostartEnabled.mockResolvedValue(false);
    onCloseRequested.mockClear();
    scaleFactor.mockClear();
    setMinSize.mockReset();
    setSize.mockReset();
    startDragging.mockClear();
    unlistenCloseRequested.mockReset();
    unlistenEvent.mockReset();
  });

  it("emits settings sync from the main window so native window state is applied", async () => {
    render(<App />);

    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith("settings:sync", defaultSettings);
    });
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

  it("does not reapply dock visibility just by opening settings", () => {
    currentWindowLabel = "settings";

    render(<App />);

    expect(invoke).not.toHaveBeenCalledWith("set_show_dock_icon", expect.anything());
  });

  it("does not rewrite login item state just by opening settings", async () => {
    currentWindowLabel = "settings";

    render(<App />);

    await waitFor(() => {
      expect(isAutostartEnabled).toHaveBeenCalledOnce();
    });
    expect(enableAutostart).not.toHaveBeenCalled();
    expect(disableAutostart).not.toHaveBeenCalled();
  });

  it("updates login item state after the user changes the setting", async () => {
    currentWindowLabel = "settings";

    render(<App />);

    await waitFor(() => {
      expect(isAutostartEnabled).toHaveBeenCalledOnce();
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "ログイン時に起動" }));

    await waitFor(() => {
      expect(enableAutostart).toHaveBeenCalledOnce();
    });
    expect(disableAutostart).not.toHaveBeenCalled();
  });

  it("passes the current theme to the main clock window", () => {
    currentTheme = "dark";

    render(<App />);

    expect(screen.getByRole("main")).toHaveAttribute("data-theme", "dark");
  });

  it("marks the main clock as native only inside Tauri", () => {
    render(<App />);

    expect(screen.getByRole("main")).toHaveClass("app-shell--native");
  });

  it("starts native window dragging from the titlebar region", () => {
    const { container } = render(<App />);
    const dragRegion = container.querySelector(".native-titlebar-drag-region");

    expect(dragRegion).not.toBeNull();
    fireEvent.mouseDown(dragRegion as Element, { button: 0 });

    expect(startDragging).toHaveBeenCalledOnce();
  });

  it("keeps the browser clock layout classless for native-only styling", () => {
    delete (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;

    render(<App />);

    expect(screen.getByRole("main")).not.toHaveClass("app-shell--native");
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

  it("syncs always-on-top changes from the clock menu to native state", async () => {
    render(<App />);

    emit.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "Open Time menu" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /Always on Top/ }));

    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith(
        "settings:sync",
        expect.objectContaining({
          alwaysOnTop: true,
        }),
      );
    });
  });

  it("saves work schedule when both start and end times are valid", () => {
    currentWindowLabel = "settings";

    render(<App />);

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

  it("saves display mode changes from settings", () => {
    currentWindowLabel = "settings";

    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Focus" }));

    expect(
      JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY) ?? ""),
    ).toEqual(
      expect.objectContaining({
        displayMode: "focus",
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

    expect(screen.getByText("WORK")).toBeInTheDocument();
  });

  it("keeps a compact main window minimum size", async () => {
    render(<App />);

    await waitFor(() => {
      expect(setMinSize).toHaveBeenLastCalledWith(
        expect.objectContaining({
          width: 320,
          height: 180,
        }),
      );
    });
  });

  it("toggles work progress visibility without clearing saved hours", () => {
    currentWindowLabel = "settings";

    render(<App />);

    fireEvent.click(screen.getByRole("checkbox", { name: "仕事時間を表示" }));

    expect(
      JSON.parse(localStorage.getItem(APP_SETTINGS_STORAGE_KEY) ?? ""),
    ).toEqual(
      expect.objectContaining({
        workProgressEnabled: false,
        workStartTime: "09:00",
        workEndTime: "18:00",
      }),
    );
  });

  it("keeps toggling the work progress checkbox on repeated clicks", () => {
    currentWindowLabel = "settings";

    render(<App />);

    const checkbox = screen.getByRole("checkbox", { name: "仕事時間を表示" });

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
