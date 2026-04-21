import { ClockPanel } from "./components/ClockPanel";
import { useNow } from "./hooks/useNow";
import { useTheme } from "./hooks/useTheme";
import { getDayPhase } from "./lib/phase/getDayPhase";

function App() {
  const now = useNow();
  const theme = useTheme();
  const phase = getDayPhase(now);

  return (
    <main className="app-shell" data-theme={theme} data-phase={phase}>
      <ClockPanel now={now} theme={theme} />
    </main>
  );
}

export default App;
