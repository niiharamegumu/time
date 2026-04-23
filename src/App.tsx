import { getCurrentWindow } from "@tauri-apps/api/window";
import { ClockPanel } from "./components/ClockPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { useAppSettings } from "./hooks/useAppSettings";
import { useClockWindowSize } from "./hooks/useClockWindowSize";
import { useNow } from "./hooks/useNow";
import { useTheme } from "./hooks/useTheme";
import { useUpdater } from "./hooks/useUpdater";
import { useWindowBehavior } from "./hooks/useWindowBehavior";
import { getDayPhase } from "./lib/phase/getDayPhase";
import { getWorkProgress } from "./lib/datetime/getWorkProgress";
import { normalizeWorkSchedule } from "./lib/settings/workSchedule";

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
  const theme = useTheme();
  const phase = getDayPhase(now);
  const [settings, setSettings] = useAppSettings();
  const updater = useUpdater();
  const { showWorkProgress } = getWorkProgress(now, settings);

  useWindowBehavior(settings, setSettings, !isSettingsWindow, isSettingsWindow);
  useClockWindowSize(showWorkProgress, !isSettingsWindow);

  return (
    <main
      className={`app-shell${isSettingsWindow ? "" : " app-shell--clock"}`}
      data-theme={theme}
      data-phase={phase}
    >
      {isSettingsWindow ? (
        <SettingsPanel
          alwaysOnTop={settings.alwaysOnTop}
          workProgressEnabled={settings.workProgressEnabled}
          workEndTime={settings.workEndTime}
          workStartTime={settings.workStartTime}
          onBackToApp={() => {
            const window = getCurrentWindow();
            void window.hide();
          }}
          onAlwaysOnTopChange={(alwaysOnTop) => {
            setSettings((currentSettings) => ({
              ...currentSettings,
              alwaysOnTop,
            }));
          }}
          onWorkProgressEnabledChange={(workProgressEnabled) => {
            setSettings((currentSettings) => ({
              ...currentSettings,
              workProgressEnabled,
            }));
          }}
          onWorkScheduleChange={(workStartTime, workEndTime) => {
            setSettings((currentSettings) => ({
              ...currentSettings,
              ...normalizeWorkSchedule(workStartTime, workEndTime),
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
        <ClockPanel now={now} settings={settings} />
      )}
    </main>
  );
}

export default App;
