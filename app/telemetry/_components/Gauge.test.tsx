import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Gauge } from "./Gauge";
import SpeedIcon from "@mui/icons-material/Speed";

describe("Gauge", () => {
  it("should render label text", () => {
    const { container } = render(
      <Gauge label="Vehicle Speed" value={87} unit="MPH" min={0} max={150} />,
    );

    expect(container.textContent).toContain("Vehicle Speed");
  });

  it("should render value and unit", () => {
    const { container } = render(
      <Gauge label="Vehicle Speed" value={87} unit="MPH" min={0} max={150} />,
    );

    expect(container.textContent).toContain("87");
    expect(container.textContent).toContain("MPH");
  });

  it("should display value with one decimal place when value is less than 100", () => {
    const { container } = render(
      <Gauge label="Boost" value={12.5} unit="PSI" min={0} max={20} />,
    );

    expect(container.textContent).toContain("12.5");
  });

  it("should display value with no decimal places when value is 100 or greater", () => {
    const { container } = render(
      <Gauge label="Coolant" value={195} unit="°F" min={100} max={220} />,
    );

    expect(container.textContent).toContain("195");
    expect(container.textContent).not.toContain("195.0");
  });

  it("should render icon when provided", () => {
    render(
      <Gauge
        label="Speed"
        value={87}
        unit="MPH"
        icon={<SpeedIcon data-testid="speed-icon" />}
      />,
    );

    expect(screen.getByTestId("speed-icon")).toBeInTheDocument();
  });

  it("should render progress bar when showBar is true", () => {
    render(
      <Gauge label="Speed" value={75} unit="MPH" min={0} max={150} showBar />,
    );

    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("should not render progress bar when showBar is false", () => {
    const { container } = render(
      <Gauge
        label="Speed"
        value={75}
        unit="MPH"
        min={0}
        max={150}
        showBar={false}
      />,
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toBeNull();
  });

  it("should calculate percentage correctly for progress bar", () => {
    const { container } = render(
      <Gauge label="Throttle" value={50} unit="%" min={0} max={100} showBar />,
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("should cap percentage at 100 when value exceeds max", () => {
    const { container } = render(
      <Gauge label="Boost" value={25} unit="PSI" min={0} max={20} showBar />,
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-valuenow", "100");
  });

  it("should use default min value of 0", () => {
    const { container } = render(
      <Gauge label="Test" value={50} unit="units" max={100} showBar />,
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("should use default max value of 100", () => {
    const { container } = render(
      <Gauge label="Test" value={50} unit="units" min={0} showBar />,
    );

    const progressBar = container.querySelector('[role="progressbar"]');
    expect(progressBar).toHaveAttribute("aria-valuenow", "50");
  });

  it("should handle decimal values correctly", () => {
    const { container } = render(
      <Gauge label="Manifold" value={25.3} unit="inHg" min={0} max={30} />,
    );

    expect(container.textContent).toContain("25.3");
  });

  it("should render as MUI Paper component", () => {
    const { container } = render(
      <Gauge label="Test" value={50} unit="units" />,
    );

    const paper = container.querySelector(".MuiPaper-root");
    expect(paper).toBeInTheDocument();
  });
});
