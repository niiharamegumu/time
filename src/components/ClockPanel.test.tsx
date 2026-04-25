import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultSettings } from "../lib/settings/settings.types";
import type { AppSettings } from "../lib/settings/settings.types";
import { ClockPanel } from "./ClockPanel";

const noop = () => undefined;

function renderClockPanel(settings: AppSettings = defaultSettings) {
  return render(
    <ClockPanel
      now={new Date(2026, 3, 22, 16, 8, 32)}
      onAlwaysOnTopChange={noop}
      onDisplayModeChange={noop}
      onHideWindow={noop}
      onOpenSettings={noop}
      onQuit={noop}
      settings={settings}
    />,
  );
}

function getProgressRings() {
  return screen.getAllByLabelText(/progress ring/i);
}

describe("ClockPanel", () => {
  it("renders the standard mode with date, split time, and progress rings", () => {
    renderClockPanel();

    expect(screen.getByText("2026.04.22 Wed")).toBeInTheDocument();
    expect(screen.getByText("16:08")).toBeInTheDocument();
    expect(screen.getByText("32")).toBeInTheDocument();
    expect(screen.getByText("日本時間（JST）")).toBeInTheDocument();
    expect(screen.getByText("DAY")).toBeInTheDocument();
    expect(screen.getByText("MONTH")).toBeInTheDocument();
    expect(screen.getByText("YEAR")).toBeInTheDocument();
    expect(screen.getByText("WORK")).toBeInTheDocument();
  });

  it("renders requirement-based day, month, year, and work ring values", () => {
    renderClockPanel();

    expect(getProgressRings()).toHaveLength(4);
    expect(screen.getByText("16 / 24 h")).toBeInTheDocument();
    expect(screen.getByText("22 / 30 d")).toBeInTheDocument();
    expect(screen.getByText("16 / 53 w")).toBeInTheDocument();
    expect(screen.getByText("6 / 8 h")).toBeInTheDocument();
  });

  it("renders ring progress through SVG stroke offsets", () => {
    renderClockPanel();

    const dayRing = screen.getByLabelText("DAY progress ring");
    const dayBar = dayRing.querySelector(".progress-ring__bar");

    expect(dayBar).toHaveAttribute("stroke-dasharray");
    expect(dayBar).toHaveAttribute("stroke-dashoffset");
  });

  it("uses live minute-based progress for day and work ring percentages", () => {
    render(
      <ClockPanel
        now={new Date(2026, 3, 22, 9, 15, 0)}
        onAlwaysOnTopChange={noop}
        onDisplayModeChange={noop}
        onHideWindow={noop}
        onOpenSettings={noop}
        onQuit={noop}
        settings={{
          ...defaultSettings,
          breakEnabled: false,
          workEndTime: "13:00",
          workStartTime: "09:00",
        }}
      />,
    );

    expect(screen.getByLabelText("DAY progress ring")).toHaveTextContent("38%");
    expect(screen.getByLabelText("DAY progress ring")).toHaveTextContent("9 / 24 h");
    expect(screen.getByLabelText("WORK progress ring")).toHaveTextContent("6%");
    expect(screen.getByLabelText("WORK progress ring")).toHaveTextContent("0 / 4 h");
  });

  it("uses 53 year weeks for leap years", () => {
    render(
      <ClockPanel
        now={new Date(2028, 1, 29, 9, 0, 0)}
        onAlwaysOnTopChange={noop}
        onDisplayModeChange={noop}
        onHideWindow={noop}
        onOpenSettings={noop}
        onQuit={noop}
        settings={defaultSettings}
      />,
    );

    expect(screen.getByText("9 / 53 w")).toBeInTheDocument();
  });

  it("renders minimal mode with compact progress rings", () => {
    renderClockPanel({ ...defaultSettings, displayMode: "minimal" });

    expect(screen.getByText("16:08")).toBeInTheDocument();
    expect(screen.getByText("32")).toBeInTheDocument();
    expect(getProgressRings()).toHaveLength(4);
    expect(screen.queryByText("DAY")).not.toBeInTheDocument();
  });

  it("renders focus mode with work progress and supporting metrics", () => {
    renderClockPanel({ ...defaultSettings, displayMode: "focus" });

    expect(screen.getByText("16:08")).toBeInTheDocument();
    expect(screen.getByText("WORK")).toBeInTheDocument();
    expect(screen.getByText("DAY")).toBeInTheDocument();
    expect(screen.getByText("MONTH")).toBeInTheDocument();
    expect(screen.getByText("YEAR")).toBeInTheDocument();
  });

  it("renders ambient mode with percentage metrics", () => {
    renderClockPanel({ ...defaultSettings, displayMode: "ambient" });

    expect(screen.getByText("Wed")).toBeInTheDocument();
    expect(screen.getByText("2026.04.22")).toBeInTheDocument();
    expect(screen.getAllByText(/%/)).toHaveLength(2);
  });

  it("hides work progress when the toggle is off", () => {
    renderClockPanel({
      ...defaultSettings,
      workProgressEnabled: false,
    });

    expect(screen.queryByText("Work")).not.toBeInTheDocument();
  });

  it("does not render the work schedule summary on the clock face", () => {
    renderClockPanel();

    expect(screen.queryByText(/勤務日/)).not.toBeInTheDocument();
    expect(screen.queryByText(/09:00 - 18:00/)).not.toBeInTheDocument();
  });
});
