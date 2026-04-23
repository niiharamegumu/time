import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { defaultSettings } from "../lib/settings/settings.types";
import { ClockPanel } from "./ClockPanel";

describe("ClockPanel", () => {
  const now = new Date(2026, 3, 22, 16, 8, 32);

  it("renders the redesigned sections and formatted date/time", () => {
    render(<ClockPanel now={now} settings={defaultSettings} />);

    expect(screen.getByText("年月日")).toBeInTheDocument();
    expect(screen.getByText("時分秒")).toBeInTheDocument();
    expect(screen.getByText("日")).toBeInTheDocument();
    expect(screen.getByText("月")).toBeInTheDocument();
    expect(screen.getByText("年")).toBeInTheDocument();
    expect(screen.getByText("2026.04.22")).toBeInTheDocument();
    expect(screen.getByText("水")).toBeInTheDocument();
    expect(screen.getByText("16:08")).toBeInTheDocument();
    expect(screen.getByText("32")).toBeInTheDocument();
  });

  it("renders the correct day, month, and year dot counts", () => {
    render(<ClockPanel now={now} settings={defaultSettings} />);

    expect(
      within(screen.getByLabelText("1日 progress dots")).getAllByText("", {
        selector: ".progress-dot",
      }),
    ).toHaveLength(24);
    expect(
      within(screen.getByLabelText("ひと月 progress dots")).getAllByText("", {
        selector: ".progress-dot",
      }),
    ).toHaveLength(30);
    expect(
      within(screen.getByLabelText("1年 progress dots")).getAllByText("", {
        selector: ".progress-dot",
      }),
    ).toHaveLength(365);
  });

  it("marks filled and unfilled dots through data attributes", () => {
    render(<ClockPanel now={now} settings={defaultSettings} />);

    const dayDots = within(screen.getByLabelText("1日 progress dots")).getAllByText("", {
      selector: ".progress-dot",
    });
    const monthDots = within(screen.getByLabelText("ひと月 progress dots")).getAllByText("", {
      selector: ".progress-dot",
    });

    expect(dayDots.filter((dot) => dot.getAttribute("data-filled") === "true")).toHaveLength(16);
    expect(dayDots.filter((dot) => dot.getAttribute("data-filled") === "false")).toHaveLength(8);
    expect(monthDots.filter((dot) => dot.getAttribute("data-filled") === "true")).toHaveLength(
      22,
    );
  });

  it("renders 366 dots for leap years", () => {
    render(
      <ClockPanel
        now={new Date(2028, 1, 29, 9, 0, 0)}
        settings={defaultSettings}
      />,
    );

    expect(screen.getByText("月")).toBeInTheDocument();
    expect(screen.getByText("年")).toBeInTheDocument();
    expect(
      within(screen.getByLabelText("1年 progress dots")).getAllByText("", {
        selector: ".progress-dot",
      }),
    ).toHaveLength(366);
  });

  it("shows work progress above the day section when work hours are configured", () => {
    render(
      <ClockPanel
        now={new Date(2026, 3, 22, 10, 15, 0)}
        settings={{
          ...defaultSettings,
          workProgressEnabled: true,
          workStartTime: "09:00",
          workEndTime: "13:00",
        }}
      />,
    );

    expect(screen.getByText("仕事")).toBeInTheDocument();

    const workDots = within(screen.getByLabelText("仕事 progress dots")).getAllByText("", {
      selector: ".progress-dot",
    });
    expect(workDots).toHaveLength(8);
    expect(workDots.filter((dot) => dot.getAttribute("data-filled") === "true")).toHaveLength(2);

    const labels = screen
      .getAllByText(/^(仕事|日|月|年)$/)
      .map((element) => element.textContent);
    expect(labels.indexOf("仕事")).toBeLessThan(labels.indexOf("日"));
  });

  it("hides work progress when work hours are not configured", () => {
    render(<ClockPanel now={now} settings={defaultSettings} />);

    expect(screen.queryByText("仕事")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("仕事 progress dots")).not.toBeInTheDocument();
  });

  it("hides work progress when the toggle is off", () => {
    render(
      <ClockPanel
        now={now}
        settings={{
          ...defaultSettings,
          workProgressEnabled: false,
          workStartTime: "09:00",
          workEndTime: "13:00",
        }}
      />,
    );

    expect(screen.queryByText("仕事")).not.toBeInTheDocument();
  });
});
