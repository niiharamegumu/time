import { LogicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import type { DisplayMode } from "../lib/settings/settings.types";
import { canUseTauriInternals } from "../lib/tauri/canUseTauriInternals";

const MIN_WIDTH = 320;
const MIN_HEIGHT = 180;
const PREFERRED_SIZES: Record<DisplayMode, { height: number; width: number }> = {
  ambient: { width: 420, height: 400 },
  focus: { width: 420, height: 400 },
  minimal: { width: 420, height: 320 },
  standard: { width: 1120, height: 680 },
};

export function useClockWindowSize(
  displayMode: DisplayMode,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled || !canUseTauriInternals()) {
      return;
    }

    const currentWindow = getCurrentWindow();
    const minSize = new LogicalSize(MIN_WIDTH, MIN_HEIGHT);
    const preferredSize = PREFERRED_SIZES[displayMode];

    void (async () => {
      await currentWindow.setMinSize(minSize);

      const scaleFactor = await currentWindow.scaleFactor();
      const currentSize = (await currentWindow.innerSize()).toLogical(scaleFactor);

      if (
        currentSize.width < minSize.width ||
        currentSize.height < minSize.height
      ) {
        await currentWindow.setSize(
          new LogicalSize(
            Math.max(currentSize.width, minSize.width),
            Math.max(currentSize.height, minSize.height),
          ),
        );
      }

      if (
        currentSize.width < preferredSize.width ||
        currentSize.height < preferredSize.height
      ) {
        await currentWindow.setSize(
          new LogicalSize(
            Math.max(currentSize.width, preferredSize.width),
            Math.max(currentSize.height, preferredSize.height),
          ),
        );
      }
    })().catch(() => undefined);
  }, [displayMode, enabled]);
}
