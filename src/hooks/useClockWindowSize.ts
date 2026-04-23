import { LogicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";

const BASE_MIN_WIDTH = 980;
const BASE_MIN_HEIGHT = 720;
const WORK_MIN_WIDTH = 1120;
const WORK_MIN_HEIGHT = 860;

export function useClockWindowSize(
  showWorkProgress: boolean,
  enabled: boolean,
) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const currentWindow = getCurrentWindow();
    const minSize = new LogicalSize(
      showWorkProgress ? WORK_MIN_WIDTH : BASE_MIN_WIDTH,
      showWorkProgress ? WORK_MIN_HEIGHT : BASE_MIN_HEIGHT,
    );

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
    })();
  }, [enabled, showWorkProgress]);
}
