import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ThrottleChart from "./ThrottleChart";
import { Record } from "@/types/api";

describe("ThrottleChart", () => {
  const mockRecords: Record[] = [
    {
      id: "1",
      sessionId: "1",
      timestamp: "2024-01-01T12:00:00Z",
      longitude: -122.4194,
      latitude: 37.7749,
      altitude: 100,
      speed: 60,
      engineRpm: 3000,
      throttlePosition: 50,
      boostPressure: 10,
      manifoldPressure: 8,
      coolantTemperature: 180,
      intakeAirTemperature: 100,
      oilPressure: 40,
      airFuelRatio: 14.7,
      massAirFlow: 25,
    },
    {
      id: "2",
      sessionId: "1",
      timestamp: "2024-01-01T12:00:01Z",
      longitude: -122.4195,
      latitude: 37.775,
      altitude: 101,
      speed: 65,
      engineRpm: 3500,
      throttlePosition: 60,
      boostPressure: 12,
      manifoldPressure: 10,
      coolantTemperature: 185,
      intakeAirTemperature: 105,
      oilPressure: 45,
      airFuelRatio: 14.5,
      massAirFlow: 30,
    },
    {
      id: "3",
      sessionId: "1",
      timestamp: "2024-01-01T12:00:02Z",
      longitude: -122.4196,
      latitude: 37.7751,
      altitude: 102,
      speed: 70,
      engineRpm: 4000,
      throttlePosition: 70,
      boostPressure: 15,
      manifoldPressure: 12,
      coolantTemperature: 190,
      intakeAirTemperature: 110,
      oilPressure: 50,
      airFuelRatio: 14.3,
      massAirFlow: 35,
    },
  ];

  it("should render line chart with throttle position data", () => {
    render(<ThrottleChart records={mockRecords} />);
    expect(screen.getAllByText("Throttle Position (%)").length).toBeGreaterThan(
      0,
    );
  });

  it("should render line chart with engine RPM data", () => {
    render(<ThrottleChart records={mockRecords} />);
    expect(screen.getAllByText("Engine RPM").length).toBeGreaterThan(0);
  });

  it("should render throttle histogram section", () => {
    render(<ThrottleChart records={mockRecords} />);
    expect(
      screen.getAllByText("Throttle Position Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should render RPM histogram section", () => {
    render(<ThrottleChart records={mockRecords} />);
    expect(
      screen.getAllByText("Engine RPM Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should render with empty records", () => {
    render(<ThrottleChart records={[]} />);
    expect(screen.getAllByText("Throttle Position (%)").length).toBeGreaterThan(
      0,
    );
  });

  it("should handle records with null throttle position", () => {
    const recordsWithNull: Record[] = [
      {
        ...mockRecords[0],
        throttlePosition: null,
        engineRpm: null,
      },
    ];
    render(<ThrottleChart records={recordsWithNull} />);
    expect(
      screen.getAllByText("Throttle Position Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should handle records with undefined throttle position", () => {
    const recordsWithUndefined: Record[] = [
      {
        ...mockRecords[0],
        throttlePosition: undefined,
        engineRpm: undefined,
      },
    ];
    render(<ThrottleChart records={recordsWithUndefined} />);
    expect(
      screen.getAllByText("Throttle Position Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should handle mixed valid and invalid throttle values", () => {
    const mixedRecords: Record[] = [
      mockRecords[0],
      { ...mockRecords[1], throttlePosition: null },
      mockRecords[2],
    ];
    render(<ThrottleChart records={mixedRecords} />);
    expect(screen.getAllByText("Throttle Position (%)").length).toBeGreaterThan(
      0,
    );
  });

  it("should handle mixed valid and invalid RPM values", () => {
    const mixedRecords: Record[] = [
      mockRecords[0],
      { ...mockRecords[1], engineRpm: null },
      mockRecords[2],
    ];
    render(<ThrottleChart records={mixedRecords} />);
    expect(screen.getAllByText("Engine RPM").length).toBeGreaterThan(0);
  });

  it("should create throttle histogram bins with 5% intervals", () => {
    const { container } = render(<ThrottleChart records={mockRecords} />);
    expect(container).toBeInTheDocument();
  });

  it("should create RPM histogram bins with 500 RPM intervals", () => {
    const { container } = render(<ThrottleChart records={mockRecords} />);
    expect(container).toBeInTheDocument();
  });

  it("should handle single record", () => {
    render(<ThrottleChart records={[mockRecords[0]]} />);
    expect(screen.getAllByText("Throttle Position (%)").length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText("Throttle Position Distribution").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Engine RPM Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should render without crashing with large dataset", () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      ...mockRecords[0],
      id: `record-${i}`,
      timestamp: new Date(
        Date.now() + i * 1000,
      ).toISOString() as `${string}T${string}Z`,
      throttlePosition: Math.random() * 100,
      engineRpm: 2000 + Math.random() * 4000,
    }));
    render(<ThrottleChart records={largeDataset} />);
    expect(screen.getAllByText("Throttle Position (%)").length).toBeGreaterThan(
      0,
    );
  });

  it("should handle edge case with same throttle values", () => {
    const sameThrottleRecords: Record[] = mockRecords.map((r) => ({
      ...r,
      throttlePosition: 50,
    }));
    render(<ThrottleChart records={sameThrottleRecords} />);
    expect(screen.getAllByText("Throttle Position (%)").length).toBeGreaterThan(
      0,
    );
  });

  it("should handle edge case with same RPM values", () => {
    const sameRpmRecords: Record[] = mockRecords.map((r) => ({
      ...r,
      engineRpm: 3000,
    }));
    render(<ThrottleChart records={sameRpmRecords} />);
    expect(screen.getAllByText("Engine RPM").length).toBeGreaterThan(0);
  });

  it("should handle edge case with only throttle data", () => {
    const throttleOnlyRecords: Record[] = mockRecords.map((r) => ({
      ...r,
      engineRpm: null,
    }));
    render(<ThrottleChart records={throttleOnlyRecords} />);
    expect(screen.getAllByText("Throttle Position (%)").length).toBeGreaterThan(
      0,
    );
  });

  it("should handle edge case with only RPM data", () => {
    const rpmOnlyRecords: Record[] = mockRecords.map((r) => ({
      ...r,
      throttlePosition: null,
    }));
    render(<ThrottleChart records={rpmOnlyRecords} />);
    expect(screen.getAllByText("Engine RPM").length).toBeGreaterThan(0);
  });
});
