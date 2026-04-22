import { getCurrentWindow } from "@tauri-apps/api/window";
import { ClockPanel } from "./components/ClockPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { useAppSettings } from "./hooks/useAppSettings";
import { useNow } from "./hooks/useNow";
import { useTheme } from "./hooks/useTheme";
import { useUpdater } from "./hooks/useUpdater";
import { useWindowBehavior } from "./hooks/useWindowBehavior";
import { getDayPhase } from "./lib/phase/getDayPhase";

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
  const now = useNow();
  const theme = useTheme();
  const phase = getDayPhase(now);
  const [settings, setSettings] = useAppSettings();
  const updater = useUpdater();

  useWindowBehavior(settings.alwaysOnTop, setSettings, !isSettingsWindow);

  return (
    <main className="app-shell" data-theme={theme} data-phase={phase}>
      {isSettingsWindow ? (
        <SettingsPanel
          alwaysOnTop={settings.alwaysOnTop}
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
        <ClockPanel now={now} theme={theme} />
      )}
    </main>
  );
}

export default App;
