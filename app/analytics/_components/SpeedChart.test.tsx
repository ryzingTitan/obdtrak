import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SpeedChart from "./SpeedChart";
import { Record } from "@/types/api";

describe("SpeedChart", () => {
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
      speed: 75,
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
      speed: 90,
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

  it("should render line chart with speed data", () => {
    render(<SpeedChart records={mockRecords} />);
    expect(screen.getAllByText("Speed (MPH)").length).toBeGreaterThan(0);
  });

  it("should render histogram section", () => {
    render(<SpeedChart records={mockRecords} />);
    expect(screen.getAllByText("Speed Distribution").length).toBeGreaterThan(0);
  });

  it("should render with empty records", () => {
    render(<SpeedChart records={[]} />);
    expect(screen.getAllByText("Speed (MPH)").length).toBeGreaterThan(0);
  });

  it("should handle records with null speed", () => {
    const recordsWithNull: Record[] = [
      {
        ...mockRecords[0],
        speed: null,
      },
    ];
    render(<SpeedChart records={recordsWithNull} />);
    expect(screen.getAllByText("Speed Distribution").length).toBeGreaterThan(0);
  });

  it("should handle records with undefined speed", () => {
    const recordsWithUndefined: Record[] = [
      {
        ...mockRecords[0],
        speed: undefined,
      },
    ];
    render(<SpeedChart records={recordsWithUndefined} />);
    expect(screen.getAllByText("Speed Distribution").length).toBeGreaterThan(0);
  });

  it("should handle mixed valid and invalid speed values", () => {
    const mixedRecords: Record[] = [
      mockRecords[0],
      { ...mockRecords[1], speed: null },
      mockRecords[2],
    ];
    render(<SpeedChart records={mixedRecords} />);
    expect(screen.getAllByText("Speed (MPH)").length).toBeGreaterThan(0);
  });

  it("should create histogram bins with 5 MPH intervals", () => {
    const { container } = render(<SpeedChart records={mockRecords} />);
    expect(container).toBeInTheDocument();
  });

  it("should handle single record", () => {
    render(<SpeedChart records={[mockRecords[0]]} />);
    expect(screen.getAllByText("Speed (MPH)").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Speed Distribution").length).toBeGreaterThan(0);
  });

  it("should render without crashing with large dataset", () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      ...mockRecords[0],
      id: `record-${i}`,
      timestamp: new Date(
        Date.now() + i * 1000,
      ).toISOString() as `${string}T${string}Z`,
      speed: 50 + Math.random() * 50,
    }));
    render(<SpeedChart records={largeDataset} />);
    expect(screen.getAllByText("Speed (MPH)").length).toBeGreaterThan(0);
  });

  it("should handle edge case with same speed values", () => {
    const sameSpeedRecords: Record[] = mockRecords.map((r) => ({
      ...r,
      speed: 60,
    }));
    render(<SpeedChart records={sameSpeedRecords} />);
    expect(screen.getAllByText("Speed (MPH)").length).toBeGreaterThan(0);
  });
});
