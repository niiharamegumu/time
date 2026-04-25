import { useEffect, useRef, useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import type { Update } from "@tauri-apps/plugin-updater";

export type UpdateStatus =
  | "idle"
  | "checking"
  | "available"
  | "downloading"
  | "installing"
  | "up-to-date"
  | "installed"
  | "error";

export type UpdateInfo = {
  currentVersion: string;
  version: string;
  date?: string;
  notes?: string;
  downloadedBytes?: number;
  contentLength?: number;
  progressPercent?: number;
};

type UseUpdaterResult = {
  errorMessage: string | null;
  info: UpdateInfo | null;
  installUpdate: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
  isEnabled: boolean;
  status: UpdateStatus;
};

function getFriendlyErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "不明なエラーが発生しました。";
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("unknown command") ||
    normalizedMessage.includes("plugin") ||
    normalizedMessage.includes("not initialized")
  ) {
    return "更新機能はこのビルドではまだ利用できません。公開ビルドで確認してください。";
  }

  return message;
}

function toUpdateInfo(update: Pick<Update, "body" | "currentVersion" | "date" | "version">): UpdateInfo {
  return {
    currentVersion: update.currentVersion,
    version: update.version,
    date: update.date,
    notes: update.body,
  };
}

export function useUpdater(): UseUpdaterResult {
  const isEnabled = import.meta.env.PROD;
  const [status, setStatus] = useState<UpdateStatus>("idle");
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingUpdateRef = useRef<Update | null>(null);

  useEffect(() => {
    return () => {
      const pendingUpdate = pendingUpdateRef.current;
      pendingUpdateRef.current = null;
      void pendingUpdate?.close().catch(() => undefined);
    };
  }, []);

  async function checkForUpdates() {
    if (!isEnabled) {
      setInfo(null);
      setErrorMessage(
        "更新機能は公開ビルドでのみ利用できます。開発ビルドではチェックできません。",
      );
      setStatus("idle");
      return;
    }

    setStatus("checking");
    setErrorMessage(null);

    try {
      const update = await check();

      if (!update) {
        const pendingUpdate = pendingUpdateRef.current;
        pendingUpdateRef.current = null;
        void pendingUpdate?.close().catch(() => undefined);
        setInfo(null);
        setStatus("up-to-date");
        return;
      }

      const previousUpdate = pendingUpdateRef.current;
      pendingUpdateRef.current = update;
      void previousUpdate?.close().catch(() => undefined);

      setInfo(toUpdateInfo(update));
      setStatus("available");
    } catch (error) {
      setInfo(null);
      setStatus("error");
      setErrorMessage(getFriendlyErrorMessage(error));
    }
  }

  async function installUpdate() {
    if (!isEnabled) {
      return;
    }

    const pendingUpdate = pendingUpdateRef.current;

    if (!pendingUpdate) {
      return;
    }

    let downloadedBytes = 0;

    setStatus("downloading");
    setErrorMessage(null);

    try {
      await pendingUpdate.downloadAndInstall((event) => {
        switch (event.event) {
          case "Started":
            setInfo((currentInfo) =>
              currentInfo
                ? {
                    ...currentInfo,
                    contentLength: event.data.contentLength,
                    downloadedBytes: 0,
                    progressPercent: event.data.contentLength ? 0 : undefined,
                  }
                : currentInfo,
            );
            break;
          case "Progress":
            downloadedBytes += event.data.chunkLength;
            setInfo((currentInfo) => {
              if (!currentInfo) {
                return currentInfo;
              }

              const progressPercent = currentInfo.contentLength
                ? Math.min(
                    100,
                    Math.round((downloadedBytes / currentInfo.contentLength) * 100),
                  )
                : undefined;

              return {
                ...currentInfo,
                downloadedBytes,
                progressPercent,
              };
            });
            break;
          case "Finished":
            setStatus("installing");
            break;
        }
      });

      pendingUpdateRef.current = null;
      void pendingUpdate.close().catch(() => undefined);
      setStatus("installed");
      setInfo((currentInfo) =>
        currentInfo
          ? {
              ...currentInfo,
              progressPercent: 100,
            }
          : currentInfo,
      );
    } catch (error) {
      setStatus("error");
      setErrorMessage(getFriendlyErrorMessage(error));
    }
  }

  return {
    errorMessage,
    info,
    installUpdate,
    checkForUpdates,
    isEnabled,
    status,
  };
}
