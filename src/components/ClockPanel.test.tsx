import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClockPanel } from "./ClockPanel";

describe("ClockPanel", () => {
  const now = new Date("2026-04-21T09:08:07");

  it("renders time and the combined Japanese date line", () => {
    render(<ClockPanel now={now} theme="light" />);

    expect(
      screen.getByText((_, element) => element?.textContent === "09:08:07"),
    ).toBeInTheDocument();
    expect(screen.getByText("2026年04月21日（火）")).toBeInTheDocument();
  });

  it("exposes the theme as a data attribute", () => {
    render(<ClockPanel now={now} theme="dark" />);

    expect(screen.getByRole("region", { name: "Clock panel" })).toHaveAttribute(
      "data-theme",
      "dark",
    );
  });
});
