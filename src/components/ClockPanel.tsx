import { useState, type CSSProperties } from "react";
import { formatDate } from "../lib/datetime/formatDate";
import { formatTime } from "../lib/datetime/formatTime";
import { formatWeekday } from "../lib/datetime/formatWeekday";
import { getCalendarProgress } from "../lib/datetime/getCalendarProgress";
import { getWorkProgress, type WorkProgress } from "../lib/datetime/getWorkProgress";
import type { AppSettings, DisplayMode } from "../lib/settings/settings.types";

type ClockPanelProps = {
  onAlwaysOnTopChange: (alwaysOnTop: boolean) => void;
  onDisplayModeChange: (displayMode: DisplayMode) => void;
  onHideWindow: () => void;
  onOpenSettings: () => void;
  onQuit: () => void;
  now: Date;
  settings: AppSettings;
};

type RingMetric = {
  color: string;
  key: "day" | "month" | "year" | "work";
  label: string;
  percent: number;
  value: string;
};

const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
function clampPercent(percent: number) {
  return Math.min(100, Math.max(0, percent));
}

function formatHours(value: number) {
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1);
}

function getWorkValue(workProgress: WorkProgress) {
  if (workProgress.workStatus === "off") {
    return "Off";
  }

  return `${formatHours(workProgress.completedWorkHours)} / ${formatHours(
    workProgress.totalWorkHours,
  )} h`;
}

function getWorkPercent(workProgress: WorkProgress) {
  if (workProgress.workStatus === "off" || workProgress.totalWorkHours <= 0) {
    return 0;
  }

  return Math.floor(
    (workProgress.workDotProgress / workProgress.totalWorkHours) * 100,
  );
}

function ProgressRing({
  metric,
  size = "regular",
  showLabel = true,
}: {
  metric: RingMetric;
  showLabel?: boolean;
  size?: "large" | "mini" | "regular";
}) {
  const percent = clampPercent(metric.percent);
  const strokeOffset = RING_CIRCUMFERENCE * (1 - percent / 100);

  return (
    <section
      aria-label={`${metric.label} progress ring`}
      className={`progress-ring progress-ring--${size} progress-ring--${metric.key}`}
      style={{ "--ring-color": metric.color } as CSSProperties}
    >
      {showLabel ? <p className="progress-ring__label">{metric.label}</p> : null}
      <div className="progress-ring__visual">
        <svg aria-hidden="true" className="progress-ring__svg" viewBox="0 0 120 120">
          <circle
            className="progress-ring__track"
            cx="60"
            cy="60"
            r={RING_RADIUS}
          />
          <circle
            className="progress-ring__bar"
            cx="60"
            cy="60"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={strokeOffset}
          />
        </svg>
        <p className="progress-ring__percent">{percent}%</p>
      </div>
      <p className="progress-ring__value">{metric.value}</p>
    </section>
  );
}

function TimeDisplay({
  mode,
  seconds,
  showSeconds,
  time,
}: {
  mode: DisplayMode;
  seconds: string;
  showSeconds: boolean;
  time: string;
}) {
  return (
    <div className={`clock-time clock-time--${mode}`}>
      <p className="clock-time__main">{time}</p>
      {showSeconds ? <p className="clock-time__seconds">{seconds}</p> : null}
    </div>
  );
}

function ClockMenu({
  displayMode,
  alwaysOnTop,
  onAlwaysOnTopChange,
  onDisplayModeChange,
  onHideWindow,
  onOpenSettings,
  onQuit,
}: {
  alwaysOnTop: boolean;
  displayMode: DisplayMode;
  onAlwaysOnTopChange: (alwaysOnTop: boolean) => void;
  onDisplayModeChange: (displayMode: DisplayMode) => void;
  onHideWindow: () => void;
  onOpenSettings: () => void;
  onQuit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const modes = ["standard", "minimal", "focus", "ambient"] as const;

  return (
    <div className="clock-menu">
      <button
        aria-expanded={open}
        aria-label="Open Time menu"
        className="clock-menu__trigger"
        type="button"
        onClick={() => {
          setOpen((currentValue) => !currentValue);
        }}
      >
        ...
      </button>
      {open ? (
        <div className="clock-menu__popover" role="menu">
          <div className="clock-menu__group">
            <p className="clock-menu__label">Mode</p>
            {modes.map((mode) => (
              <button
                key={mode}
                aria-checked={displayMode === mode}
                className="clock-menu__item"
                role="menuitemradio"
                type="button"
                onClick={() => {
                  onDisplayModeChange(mode);
                  setOpen(false);
                }}
              >
                <span>{mode[0].toUpperCase() + mode.slice(1)}</span>
                <span aria-hidden="true">{displayMode === mode ? "On" : ""}</span>
              </button>
            ))}
          </div>
          <div className="clock-menu__group">
            <button
              aria-checked={alwaysOnTop}
              className="clock-menu__item"
              role="menuitemcheckbox"
              type="button"
              onClick={() => {
                onAlwaysOnTopChange(!alwaysOnTop);
                setOpen(false);
              }}
            >
              <span>Always on Top</span>
              <span aria-hidden="true">{alwaysOnTop ? "On" : ""}</span>
            </button>
            <button
              className="clock-menu__item"
              role="menuitem"
              type="button"
              onClick={() => {
                onOpenSettings();
                setOpen(false);
              }}
            >
              Settings
            </button>
            <button
              className="clock-menu__item"
              role="menuitem"
              type="button"
              onClick={() => {
                onHideWindow();
                setOpen(false);
              }}
            >
              Hide Window
            </button>
            <button className="clock-menu__item" role="menuitem" type="button" onClick={onQuit}>
              Quit Time
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ClockPanel({
  now,
  onAlwaysOnTopChange,
  onDisplayModeChange,
  onHideWindow,
  onOpenSettings,
  onQuit,
  settings,
}: ClockPanelProps) {
  const calendarProgress = getCalendarProgress(now);
  const workProgress = getWorkProgress(now, settings);
  const [hours, minutes, seconds] = formatTime(now).split(":");
  const timeWithoutSeconds = `${hours}:${minutes}`;
  const weekday = formatWeekday(now);
  const date = formatDate(now);
  const dateLine = `${date} ${weekday}`;
  const metrics: RingMetric[] = [
    {
      color: "#ff7b7b",
      key: "day",
      label: "DAY",
      percent: calendarProgress.dayPercent,
      value: `${calendarProgress.dayUnitCount} / ${calendarProgress.dayDotCount} h`,
    },
    {
      color: "#78b364",
      key: "month",
      label: "MONTH",
      percent: Math.floor(
        (calendarProgress.monthUnitCount / calendarProgress.daysInMonth) * 100,
      ),
      value: `${calendarProgress.monthUnitCount} / ${calendarProgress.daysInMonth} d`,
    },
    {
      color: "#7f9bc2",
      key: "year",
      label: "YEAR",
      percent: Math.floor(
        (calendarProgress.yearUnitCount / calendarProgress.yearDotCount) * 100,
      ),
      value: `${calendarProgress.yearUnitCount} / ${calendarProgress.yearDotCount} w`,
    },
  ];
  const workMetric: RingMetric | null = workProgress.showWorkProgress
    ? {
        color: "#ffa64f",
        key: "work",
        label: "WORK",
        percent: getWorkPercent(workProgress),
        value: getWorkValue(workProgress),
      }
    : null;
  const visibleMetrics = workMetric === null ? metrics : [...metrics, workMetric];
  const [dayMetric, , yearMetric] = metrics;
  const focusMetric = workMetric ?? dayMetric;

  return (
    <section
      aria-label="Clock panel"
      className={`clock-panel clock-panel--${settings.displayMode}`}
    >
      <div className="clock-panel__frame">
        <ClockMenu
          alwaysOnTop={settings.alwaysOnTop}
          displayMode={settings.displayMode}
          onAlwaysOnTopChange={onAlwaysOnTopChange}
          onDisplayModeChange={onDisplayModeChange}
          onHideWindow={onHideWindow}
          onOpenSettings={onOpenSettings}
          onQuit={onQuit}
        />
        {settings.displayMode === "standard" ? (
          <>
            <div className="clock-panel__standard-main">
              <section className="clock-panel__time-block" aria-label="Current time">
                <p className="clock-panel__date-line">{dateLine}</p>
                <TimeDisplay
                  mode="standard"
                  seconds={seconds}
                  showSeconds={settings.showSeconds}
                  time={timeWithoutSeconds}
                />
                <p className="clock-panel__timezone">日本時間（JST）</p>
              </section>
              <div className="clock-panel__rings clock-panel__rings--standard">
                {visibleMetrics.map((metric) => (
                  <ProgressRing key={metric.key} metric={metric} />
                ))}
              </div>
            </div>
          </>
        ) : null}

        {settings.displayMode === "minimal" ? (
          <div className="clock-panel__minimal">
            <TimeDisplay
              mode="minimal"
              seconds={seconds}
              showSeconds={settings.showSeconds}
              time={timeWithoutSeconds}
            />
            <p className="clock-panel__date-line clock-panel__date-line--muted">
              {dateLine}
            </p>
            <div className="clock-panel__rings clock-panel__rings--minimal">
              {visibleMetrics.map((metric) => (
                <ProgressRing key={metric.key} metric={metric} size="mini" showLabel={false} />
              ))}
            </div>
          </div>
        ) : null}

        {settings.displayMode === "focus" ? (
          <div className="clock-panel__focus">
            <TimeDisplay
              mode="focus"
              seconds={seconds}
              showSeconds={false}
              time={timeWithoutSeconds}
            />
            <ProgressRing metric={focusMetric} size="large" />
            <div className="clock-panel__focus-legend">
              {metrics.map((metric) => (
                <ProgressRing key={metric.key} metric={metric} size="mini" />
              ))}
            </div>
          </div>
        ) : null}

        {settings.displayMode === "ambient" ? (
          <div className="clock-panel__ambient">
            <TimeDisplay
              mode="ambient"
              seconds={seconds}
              showSeconds={false}
              time={timeWithoutSeconds}
            />
            <p className="clock-panel__ambient-weekday">{weekday}</p>
            <div className="clock-panel__ambient-rings">
              <ProgressRing metric={dayMetric} />
              <ProgressRing metric={yearMetric} />
            </div>
            <p className="clock-panel__ambient-date">{date}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
