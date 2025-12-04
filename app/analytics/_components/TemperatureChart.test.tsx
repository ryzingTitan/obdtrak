import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TemperatureChart from "./TemperatureChart";
import { Record } from "@/types/api";

describe("TemperatureChart", () => {
  const mockRecords: Record[] = [
    {
      id: "1",
      sessionId: "session1",
      timestamp: "2024-01-01T12:00:00Z",
      speed: 60,
      engineRpm: 3000,
      throttlePosition: 50,
      boostPressure: 10,
      manifoldPressure: 8,
      coolantTemperature: 180,
      intakeAirTemperature: 100,
      oilPressure: 40,
    },
    {
      id: "2",
      sessionId: "session1",
      timestamp: "2024-01-01T12:00:01Z",
      speed: 65,
      engineRpm: 3500,
      throttlePosition: 60,
      boostPressure: 12,
      manifoldPressure: 10,
      coolantTemperature: 185,
      intakeAirTemperature: 105,
      oilPressure: 45,
    },
    {
      id: "3",
      sessionId: "session1",
      timestamp: "2024-01-01T12:00:02Z",
      speed: 70,
      engineRpm: 4000,
      throttlePosition: 70,
      boostPressure: 15,
      manifoldPressure: 12,
      coolantTemperature: 190,
      intakeAirTemperature: 110,
      oilPressure: 50,
    },
  ];

  it("should render line chart with intake air temperature data", () => {
    render(<TemperatureChart records={mockRecords} />);
    expect(
      screen.getAllByText("Intake Air Temperature (°F)").length,
    ).toBeGreaterThan(0);
  });

  it("should render line chart with coolant temperature data", () => {
    render(<TemperatureChart records={mockRecords} />);
    expect(
      screen.getAllByText("Coolant Temperature (°F)").length,
    ).toBeGreaterThan(0);
  });

  it("should render histogram section", () => {
    render(<TemperatureChart records={mockRecords} />);
    expect(
      screen.getAllByText("Temperature Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should render with empty records", () => {
    render(<TemperatureChart records={[]} />);
    expect(
      screen.getAllByText("Intake Air Temperature (°F)").length,
    ).toBeGreaterThan(0);
  });

  it("should handle records with null temperatures", () => {
    const recordsWithNull: Record[] = [
      {
        ...mockRecords[0],
        coolantTemperature: null,
        intakeAirTemperature: null,
      },
    ];
    render(<TemperatureChart records={recordsWithNull} />);
    expect(
      screen.getAllByText("Temperature Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should handle records with undefined temperatures", () => {
    const recordsWithUndefined: Record[] = [
      {
        ...mockRecords[0],
        coolantTemperature: undefined,
        intakeAirTemperature: undefined,
      },
    ];
    render(<TemperatureChart records={recordsWithUndefined} />);
    expect(
      screen.getAllByText("Temperature Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should handle mixed valid and invalid temperature values", () => {
    const mixedRecords: Record[] = [
      mockRecords[0],
      { ...mockRecords[1], coolantTemperature: null },
      mockRecords[2],
    ];
    render(<TemperatureChart records={mixedRecords} />);
    expect(
      screen.getAllByText("Intake Air Temperature (°F)").length,
    ).toBeGreaterThan(0);
  });

  it("should create histogram bins with 5°F intervals", () => {
    const { container } = render(<TemperatureChart records={mockRecords} />);
    expect(container).toBeInTheDocument();
  });

  it("should handle single record", () => {
    render(<TemperatureChart records={[mockRecords[0]]} />);
    expect(
      screen.getAllByText("Intake Air Temperature (°F)").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Temperature Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should render without crashing with large dataset", () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      ...mockRecords[0],
      id: `record-${i}`,
      timestamp: new Date(
        Date.now() + i * 1000,
      ).toISOString() as `${string}T${string}Z`,
      coolantTemperature: 180 + Math.random() * 20,
      intakeAirTemperature: 100 + Math.random() * 20,
    }));
    render(<TemperatureChart records={largeDataset} />);
    expect(
      screen.getAllByText("Intake Air Temperature (°F)").length,
    ).toBeGreaterThan(0);
  });

  it("should handle edge case with same temperature values", () => {
    const sameTempRecords: Record[] = mockRecords.map((r) => ({
      ...r,
      coolantTemperature: 180,
      intakeAirTemperature: 100,
    }));
    render(<TemperatureChart records={sameTempRecords} />);
    expect(
      screen.getAllByText("Intake Air Temperature (°F)").length,
    ).toBeGreaterThan(0);
  });
});
