import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { ALWAYS_ON_TOP_CHANGED_EVENT } from "./lib/settings/settings.events";
import { APP_SETTINGS_STORAGE_KEY } from "./lib/settings/settings.storage";

const hide = vi.fn();
const unlistenCloseRequested = vi.fn();
const emit = vi.fn();
const unlistenEvent = vi.fn();
const onCloseRequested = vi.fn();

let closeRequestedHandler:
  | ((event: { preventDefault: () => void }) => void)
  | undefined;
let alwaysOnTopListener:
  | ((event: { payload: { alwaysOnTop: boolean } }) => void)
  | undefined;
let currentWindowLabel = "main";

vi.mock("./hooks/useNow", () => ({
  useNow: () => new Date("2026-04-21T09:08:07"),
}));

vi.mock("./hooks/useTheme", () => ({
  useTheme: () => "light",
}));

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    label: currentWindowLabel,
    hide,
    onCloseRequested: onCloseRequested.mockImplementation(async (handler) => {
      closeRequestedHandler = handler;
      return unlistenCloseRequested;
    }),
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

    return unlistenEvent;
  }),
}));

describe("App", () => {
  beforeEach(() => {
    closeRequestedHandler = undefined;
    alwaysOnTopListener = undefined;
    currentWindowLabel = "main";
    localStorage.clear();
    emit.mockReset();
    hide.mockReset();
    onCloseRequested.mockClear();
    unlistenCloseRequested.mockReset();
    unlistenEvent.mockReset();
  });

  it("emits the default always-on-top setting on startup", async () => {
    render(<App />);

    await waitFor(() => {
      expect(emit).toHaveBeenCalledWith("settings:sync", {
        alwaysOnTop: false,
      });
    });
  });

  it("renders the dedicated settings window when opened from native UI", () => {
    currentWindowLabel = "settings";

    render(<App />);

    expect(screen.getByRole("region", { name: "Settings panel" })).toBeInTheDocument();
    expect(onCloseRequested).not.toHaveBeenCalled();
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
});
