import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect } from "react";
import type { MouseEvent } from "react";
import { ClockPanel } from "./components/ClockPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { useAppSettings } from "./hooks/useAppSettings";
import { useClockWindowSize } from "./hooks/useClockWindowSize";
import { useLaunchAtLogin } from "./hooks/useLaunchAtLogin";
import { useNow } from "./hooks/useNow";
import { useTheme } from "./hooks/useTheme";
import { useUpdater } from "./hooks/useUpdater";
import { useWindowBehavior } from "./hooks/useWindowBehavior";
import { toTimeZoneDate } from "./lib/datetime/toTimeZoneDate";
import {
  hideMainWindow,
  openSettingsWindow,
  quitTime,
  setShowDockIcon,
} from "./lib/settings/settings.native";
import { getDayPhase } from "./lib/phase/getDayPhase";
import type { DisplayMode } from "./lib/settings/settings.types";
import type { WorkDay } from "./lib/settings/workSchedule";
import { normalizeWorkSchedule } from "./lib/settings/workSchedule";
import { canUseTauriInternals } from "./lib/tauri/canUseTauriInternals";

const SETTINGS_WINDOW_LABEL = "settings";

function getWindowLabel() {
  try {
    return getCurrentWindow().label;
  } catch {
    return "main";
  }
}

function App() {
  const windowLabel = getWindowLabel();
  const isSettingsWindow = windowLabel === SETTINGS_WINDOW_LABEL;
  const now = useNow(!isSettingsWindow);
  const [settings, setSettings] = useAppSettings();
  const zonedNow = toTimeZoneDate(now, settings.timezone);
  const theme = useTheme();
  const phase = getDayPhase(zonedNow);
  const updater = useUpdater();
  const isNativeClockWindow = !isSettingsWindow && canUseTauriInternals();

  const startNativeWindowDrag = (event: MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !isNativeClockWindow) {
      return;
    }

    void getCurrentWindow().startDragging().catch(() => undefined);
  };

  useWindowBehavior(settings, setSettings, !isSettingsWindow, true);
  useClockWindowSize(settings.displayMode, !isSettingsWindow);
  useLaunchAtLogin(settings, setSettings, isSettingsWindow);

  useEffect(() => {
    if (isSettingsWindow) {
      return;
    }

    void setShowDockIcon(settings.showDockIcon).catch(() => undefined);
  }, [isSettingsWindow, settings.showDockIcon]);

  const updateAlwaysOnTop = (alwaysOnTop: boolean) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      alwaysOnTop,
    }));
  };
  const updateDisplayMode = (displayMode: DisplayMode) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      displayMode,
    }));
  };
  const updateLaunchAtLogin = (launchAtLogin: boolean) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      launchAtLogin,
    }));
  };
  const updateShowSeconds = (showSeconds: boolean) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      showSeconds,
    }));
  };
  const updateShowDockIcon = (showDockIcon: boolean) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      showDockIcon,
    }));
    void setShowDockIcon(showDockIcon).catch(() => undefined);
  };
  const updateWorkDays = (workDays: WorkDay[]) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      workDays,
    }));
  };

  return (
    <main
      className={`app-shell${isSettingsWindow ? "" : " app-shell--clock"}${isNativeClockWindow ? " app-shell--native" : ""}`}
      data-theme={theme}
      data-phase={phase}
    >
      {isNativeClockWindow ? (
        <div
          aria-hidden="true"
          className="native-titlebar-drag-region"
          data-tauri-drag-region
          onMouseDown={startNativeWindowDrag}
        />
      ) : null}
      {isSettingsWindow ? (
        <SettingsPanel
          alwaysOnTop={settings.alwaysOnTop}
          displayMode={settings.displayMode}
          launchAtLogin={settings.launchAtLogin}
          showDockIcon={settings.showDockIcon}
          showSeconds={settings.showSeconds}
          breakEnabled={settings.breakEnabled}
          breakEndTime={settings.breakEndTime}
          breakStartTime={settings.breakStartTime}
          workProgressEnabled={settings.workProgressEnabled}
          workDays={settings.workDays}
          workEndTime={settings.workEndTime}
          workStartTime={settings.workStartTime}
          onBackToApp={() => {
            const window = getCurrentWindow();
            void window.hide();
          }}
          onAlwaysOnTopChange={updateAlwaysOnTop}
          onDisplayModeChange={updateDisplayMode}
          onLaunchAtLoginChange={updateLaunchAtLogin}
          onShowDockIconChange={updateShowDockIcon}
          onShowSecondsChange={updateShowSeconds}
          onWorkDaysChange={updateWorkDays}
          onWorkProgressEnabledChange={(workProgressEnabled) => {
            setSettings((currentSettings) => ({
              ...currentSettings,
              workProgressEnabled,
            }));
          }}
          onWorkScheduleChange={(
            workStartTime,
            workEndTime,
            breakStartTime,
            breakEndTime,
            breakEnabled,
          ) => {
            setSettings((currentSettings) => ({
              ...currentSettings,
              ...normalizeWorkSchedule(
                workStartTime,
                workEndTime,
                breakStartTime,
                breakEndTime,
                breakEnabled,
                currentSettings.workDays,
              ),
            }));
          }}
          onCheckForUpdates={() => {
            void updater.checkForUpdates();
          }}
          onInstallUpdate={() => {
            void updater.installUpdate();
          }}
          updateAvailable={updater.isEnabled}
          updateErrorMessage={updater.errorMessage}
          updateInfo={updater.info}
          updateStatus={updater.status}
        />
      ) : (
        <ClockPanel
          now={zonedNow}
          onAlwaysOnTopChange={updateAlwaysOnTop}
          onDisplayModeChange={updateDisplayMode}
          onHideWindow={() => {
            void hideMainWindow();
          }}
          onOpenSettings={() => {
            void openSettingsWindow();
          }}
          onQuit={() => {
            void quitTime();
          }}
          settings={settings}
        />
      )}
    </main>
  );
}

export default App;
