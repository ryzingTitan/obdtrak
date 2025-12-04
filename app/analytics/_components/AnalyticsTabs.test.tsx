import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalyticsTabs from "./AnalyticsTabs";

describe("AnalyticsTabs", () => {
  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render all tab labels", () => {
    render(<AnalyticsTabs currentTab={0} onTabChange={mockOnTabChange} />);

    expect(screen.getByRole("tab", { name: "Summary" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Temperature" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Boost" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Throttle" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Speed" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Oil Pressure" }),
    ).toBeInTheDocument();
  });

  it("should render with Summary tab selected by default", () => {
    render(<AnalyticsTabs currentTab={0} onTabChange={mockOnTabChange} />);

    const summaryTab = screen.getByRole("tab", { name: "Summary" });
    expect(summaryTab).toHaveAttribute("aria-selected", "true");
  });

  it("should render with Temperature tab selected when currentTab is 1", () => {
    render(<AnalyticsTabs currentTab={1} onTabChange={mockOnTabChange} />);

    const temperatureTab = screen.getByRole("tab", { name: "Temperature" });
    expect(temperatureTab).toHaveAttribute("aria-selected", "true");
  });

  it("should render with Boost tab selected when currentTab is 2", () => {
    render(<AnalyticsTabs currentTab={2} onTabChange={mockOnTabChange} />);

    const boostTab = screen.getByRole("tab", { name: "Boost" });
    expect(boostTab).toHaveAttribute("aria-selected", "true");
  });

  it("should render with Throttle tab selected when currentTab is 3", () => {
    render(<AnalyticsTabs currentTab={3} onTabChange={mockOnTabChange} />);

    const throttleTab = screen.getByRole("tab", { name: "Throttle" });
    expect(throttleTab).toHaveAttribute("aria-selected", "true");
  });

  it("should render with Speed tab selected when currentTab is 4", () => {
    render(<AnalyticsTabs currentTab={4} onTabChange={mockOnTabChange} />);

    const speedTab = screen.getByRole("tab", { name: "Speed" });
    expect(speedTab).toHaveAttribute("aria-selected", "true");
  });

  it("should render with Oil Pressure tab selected when currentTab is 5", () => {
    render(<AnalyticsTabs currentTab={5} onTabChange={mockOnTabChange} />);

    const oilPressureTab = screen.getByRole("tab", { name: "Oil Pressure" });
    expect(oilPressureTab).toHaveAttribute("aria-selected", "true");
  });

  it("should call onTabChange when Temperature tab is clicked", async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();

    render(<AnalyticsTabs currentTab={0} onTabChange={handleTabChange} />);

    const temperatureTab = screen.getByRole("tab", { name: "Temperature" });
    await user.click(temperatureTab);

    expect(handleTabChange).toHaveBeenCalledWith(1);
    expect(handleTabChange).toHaveBeenCalledTimes(1);
  });

  it("should call onTabChange when Boost tab is clicked", async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();

    render(<AnalyticsTabs currentTab={0} onTabChange={handleTabChange} />);

    const boostTab = screen.getByRole("tab", { name: "Boost" });
    await user.click(boostTab);

    expect(handleTabChange).toHaveBeenCalledWith(2);
    expect(handleTabChange).toHaveBeenCalledTimes(1);
  });

  it("should call onTabChange when Throttle tab is clicked", async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();

    render(<AnalyticsTabs currentTab={0} onTabChange={handleTabChange} />);

    const throttleTab = screen.getByRole("tab", { name: "Throttle" });
    await user.click(throttleTab);

    expect(handleTabChange).toHaveBeenCalledWith(3);
    expect(handleTabChange).toHaveBeenCalledTimes(1);
  });

  it("should call onTabChange when Speed tab is clicked", async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();

    render(<AnalyticsTabs currentTab={0} onTabChange={handleTabChange} />);

    const speedTab = screen.getByRole("tab", { name: "Speed" });
    await user.click(speedTab);

    expect(handleTabChange).toHaveBeenCalledWith(4);
    expect(handleTabChange).toHaveBeenCalledTimes(1);
  });

  it("should call onTabChange when Oil Pressure tab is clicked", async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();

    render(<AnalyticsTabs currentTab={0} onTabChange={handleTabChange} />);

    const oilPressureTab = screen.getByRole("tab", { name: "Oil Pressure" });
    await user.click(oilPressureTab);

    expect(handleTabChange).toHaveBeenCalledWith(5);
    expect(handleTabChange).toHaveBeenCalledTimes(1);
  });

  it("should handle multiple tab clicks", async () => {
    const user = userEvent.setup();
    const handleTabChange = vi.fn();

    render(<AnalyticsTabs currentTab={0} onTabChange={handleTabChange} />);

    const boostTab = screen.getByRole("tab", { name: "Boost" });
    const speedTab = screen.getByRole("tab", { name: "Speed" });

    await user.click(boostTab);
    await user.click(speedTab);

    expect(handleTabChange).toHaveBeenCalledTimes(2);
    expect(handleTabChange).toHaveBeenNthCalledWith(1, 2);
    expect(handleTabChange).toHaveBeenNthCalledWith(2, 4);
  });

  it("should render tabs in correct order", () => {
    render(<AnalyticsTabs currentTab={0} onTabChange={mockOnTabChange} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(6);
    expect(tabs[0]).toHaveTextContent("Summary");
    expect(tabs[1]).toHaveTextContent("Temperature");
    expect(tabs[2]).toHaveTextContent("Boost");
    expect(tabs[3]).toHaveTextContent("Throttle");
    expect(tabs[4]).toHaveTextContent("Speed");
    expect(tabs[5]).toHaveTextContent("Oil Pressure");
  });
});
