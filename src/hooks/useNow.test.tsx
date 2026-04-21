import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useNow } from "./useNow";

describe("useNow", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("updates once per second", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-21T09:08:07"));

    const { result } = renderHook(() => useNow());

    expect(result.current.toISOString()).toBe(
      new Date("2026-04-21T09:08:07").toISOString(),
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.toISOString()).toBe(
      new Date("2026-04-21T09:08:08").toISOString(),
    );
  });

  it("clears the interval on unmount", () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    const { unmount } = renderHook(() => useNow());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });
});
