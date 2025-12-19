import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RpmGauge } from "./RpmGauge";

describe("RpmGauge", () => {
  it("should render RPM value", () => {
    const { container } = render(<RpmGauge rpm={4500} />);

    expect(container.textContent).toContain("4500");
  });

  it("should render RPM label", () => {
    const { container } = render(<RpmGauge rpm={4500} />);

    expect(container.textContent).toContain("RPM");
    expect(container.textContent).toContain("Engine RPM");
  });

  it("should display redline indicator with hardcoded value of 6000", () => {
    const { container } = render(<RpmGauge rpm={4500} />);

    expect(container.textContent).toContain("Redline: 6000");
  });

  it("should render with different RPM values", () => {
    const { rerender, container } = render(<RpmGauge rpm={3000} />);

    expect(container.textContent).toContain("3000");

    rerender(<RpmGauge rpm={5500} />);
    expect(container.textContent).toContain("5500");
  });

  it("should handle low RPM values", () => {
    const { container } = render(<RpmGauge rpm={1000} />);

    expect(container.textContent).toContain("1000");
  });

  it("should handle RPM at redline", () => {
    const { container } = render(<RpmGauge rpm={6000} />);

    expect(container.textContent).toContain("6000");
  });

  it("should handle RPM above redline", () => {
    const { container } = render(<RpmGauge rpm={6500} />);

    expect(container.textContent).toContain("6500");
  });

  it("should display RPM as integer without decimals", () => {
    const { container } = render(<RpmGauge rpm={4500} />);

    expect(container.textContent).toContain("4500");
    expect(container.textContent).not.toContain("4500.0");
  });

  it("should render as MUI Paper component", () => {
    const { container } = render(<RpmGauge rpm={4500} />);

    const paper = container.querySelector(".MuiPaper-root");
    expect(paper).toBeInTheDocument();
  });

  it("should render redline chip", () => {
    const { container } = render(<RpmGauge rpm={4500} />);

    const chip = container.querySelector(".MuiChip-root");
    expect(chip).toBeInTheDocument();
  });
});
