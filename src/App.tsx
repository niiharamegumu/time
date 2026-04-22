import { getCurrentWindow } from "@tauri-apps/api/window";
import { ClockPanel } from "./components/ClockPanel";
import { SettingsPanel } from "./components/SettingsPanel";
import { useAppSettings } from "./hooks/useAppSettings";
import { useNow } from "./hooks/useNow";
import { useTheme } from "./hooks/useTheme";
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

  useWindowBehavior(settings.alwaysOnTop, setSettings, !isSettingsWindow);

  return (
    <main className="app-shell" data-theme={theme} data-phase={phase}>
      {isSettingsWindow ? (
        <SettingsPanel
          alwaysOnTop={settings.alwaysOnTop}
          onAlwaysOnTopChange={(alwaysOnTop) => {
            setSettings((currentSettings) => ({
              ...currentSettings,
              alwaysOnTop,
            }));
          }}
        />
      ) : (
        <ClockPanel now={now} theme={theme} />
      )}
    </main>
  );
}

export default App;
