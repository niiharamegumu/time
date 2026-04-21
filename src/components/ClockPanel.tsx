import { DateLine } from "./DateLine";
import { TimeLine } from "./TimeLine";

type ClockTheme = "light" | "dark";

type ClockPanelProps = {
  now: Date;
  theme: ClockTheme;
};

export function ClockPanel({ now, theme }: ClockPanelProps) {
  return (
    <section
      aria-label="Clock panel"
      className="clock-panel"
      data-theme={theme}
    >
      <div className="clock-panel__content">
        <DateLine now={now} />
        <TimeLine now={now} />
      </div>
    </section>
  );
}
