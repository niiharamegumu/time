import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useUpdater } from "./useUpdater";

const check = vi.fn();

vi.mock("@tauri-apps/plugin-updater", () => ({
  check: (...args: unknown[]) => check(...args),
}));

function TestHarness() {
  const updater = useUpdater();

  return (
    <div>
      <p data-testid="status">{updater.status}</p>
      <p data-testid="error">{updater.errorMessage ?? ""}</p>
      <p data-testid="version">{updater.info?.version ?? ""}</p>
      <p data-testid="progress">
        {updater.info?.progressPercent !== undefined
          ? updater.info.progressPercent
          : ""}
      </p>
      <button
        type="button"
        onClick={() => {
          void updater.checkForUpdates();
        }}
      >
        check
      </button>
      <button
        type="button"
        onClick={() => {
          void updater.installUpdate();
        }}
      >
        install
      </button>
    </div>
  );
}

describe("useUpdater", () => {
  beforeEach(() => {
    vi.stubEnv("PROD", true);
    check.mockReset();
  });

  it("marks the app as up-to-date when no update is available", async () => {
    check.mockResolvedValue(null);

    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "check" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("up-to-date");
    });
  });

  it("downloads and installs an available update", async () => {
    const downloadAndInstall = vi.fn(
      async (
        onEvent?: (event: { event: string; data?: Record<string, number> }) => void,
      ) => {
        onEvent?.({ event: "Started", data: { contentLength: 100 } });
        onEvent?.({ event: "Progress", data: { chunkLength: 40 } });
        onEvent?.({ event: "Progress", data: { chunkLength: 60 } });
        onEvent?.({ event: "Finished" });
      },
    );
    const close = vi.fn(async () => undefined);

    check.mockResolvedValue({
      body: "Bug fixes",
      close,
      currentVersion: "0.1.0",
      date: "2026-04-22T00:00:00Z",
      downloadAndInstall,
      version: "0.2.0",
    });

    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "check" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("available");
    });
    expect(screen.getByTestId("version")).toHaveTextContent("0.2.0");

    fireEvent.click(screen.getByRole("button", { name: "install" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("installed");
    });
    expect(screen.getByTestId("progress")).toHaveTextContent("100");
    expect(downloadAndInstall).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
  });

  it("reports a friendly error when updater is unavailable", async () => {
    check.mockRejectedValue(new Error("unknown command: plugin:updater|check"));

    render(<TestHarness />);

    fireEvent.click(screen.getByRole("button", { name: "check" }));

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("error");
    });
    expect(screen.getByTestId("error")).toHaveTextContent(
      "更新機能はこのビルドではまだ利用できません。公開ビルドで確認してください。",
    );
  });
});
