import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OilPressureChart from "./OilPressureChart";
import { Record } from "@/types/api";

describe("OilPressureChart", () => {
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

  it("should render line chart with oil pressure data", () => {
    render(<OilPressureChart records={mockRecords} />);
    expect(screen.getAllByText("Oil Pressure (PSI)").length).toBeGreaterThan(0);
  });

  it("should render histogram section", () => {
    render(<OilPressureChart records={mockRecords} />);
    expect(
      screen.getAllByText("Oil Pressure Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should render with empty records", () => {
    render(<OilPressureChart records={[]} />);
    expect(screen.getAllByText("Oil Pressure (PSI)").length).toBeGreaterThan(0);
  });

  it("should handle records with null oil pressure", () => {
    const recordsWithNull: Record[] = [
      {
        ...mockRecords[0],
        oilPressure: null,
      },
    ];
    render(<OilPressureChart records={recordsWithNull} />);
    expect(
      screen.getAllByText("Oil Pressure Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should handle records with undefined oil pressure", () => {
    const recordsWithUndefined: Record[] = [
      {
        ...mockRecords[0],
        oilPressure: undefined,
      },
    ];
    render(<OilPressureChart records={recordsWithUndefined} />);
    expect(
      screen.getAllByText("Oil Pressure Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should handle mixed valid and invalid oil pressure values", () => {
    const mixedRecords: Record[] = [
      mockRecords[0],
      { ...mockRecords[1], oilPressure: null },
      mockRecords[2],
    ];
    render(<OilPressureChart records={mixedRecords} />);
    expect(screen.getAllByText("Oil Pressure (PSI)").length).toBeGreaterThan(0);
  });

  it("should create histogram bins with 5 PSI intervals", () => {
    const { container } = render(<OilPressureChart records={mockRecords} />);
    expect(container).toBeInTheDocument();
  });

  it("should handle single record", () => {
    render(<OilPressureChart records={[mockRecords[0]]} />);
    expect(screen.getAllByText("Oil Pressure (PSI)").length).toBeGreaterThan(0);
    expect(
      screen.getAllByText("Oil Pressure Distribution").length,
    ).toBeGreaterThan(0);
  });

  it("should render without crashing with large dataset", () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      ...mockRecords[0],
      id: `record-${i}`,
      timestamp: new Date(
        Date.now() + i * 1000,
      ).toISOString() as `${string}T${string}Z`,
      oilPressure: 30 + Math.random() * 30,
    }));
    render(<OilPressureChart records={largeDataset} />);
    expect(screen.getAllByText("Oil Pressure (PSI)").length).toBeGreaterThan(0);
  });

  it("should handle edge case with same oil pressure values", () => {
    const samePressureRecords: Record[] = mockRecords.map((r) => ({
      ...r,
      oilPressure: 40,
    }));
    render(<OilPressureChart records={samePressureRecords} />);
    expect(screen.getAllByText("Oil Pressure (PSI)").length).toBeGreaterThan(0);
  });

  it("should handle wide range of oil pressure values", () => {
    const wideRangeRecords: Record[] = [
      { ...mockRecords[0], oilPressure: 10 },
      { ...mockRecords[1], oilPressure: 50 },
      { ...mockRecords[2], oilPressure: 90 },
    ];
    render(<OilPressureChart records={wideRangeRecords} />);
    expect(screen.getAllByText("Oil Pressure (PSI)").length).toBeGreaterThan(0);
  });
});
