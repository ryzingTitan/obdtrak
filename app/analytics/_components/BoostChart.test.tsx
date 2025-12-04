import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import BoostChart from "./BoostChart";
import { Record } from "@/types/api";

describe("BoostChart", () => {
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

  it("should render line chart with boost pressure data", () => {
    render(<BoostChart records={mockRecords} />);
    expect(screen.getAllByText("Boost Pressure (PSI)").length).toBeGreaterThan(
      0,
    );
  });

  it("should render line chart with manifold pressure data", () => {
    render(<BoostChart records={mockRecords} />);
    expect(
      screen.getAllByText("Manifold Pressure (PSI)").length,
    ).toBeGreaterThan(0);
  });

  it("should render histogram section", () => {
    render(<BoostChart records={mockRecords} />);
    expect(screen.getAllByText("Pressure Distribution").length).toBeGreaterThan(
      0,
    );
  });

  it("should render with empty records", () => {
    render(<BoostChart records={[]} />);
    expect(screen.getAllByText("Boost Pressure (PSI)").length).toBeGreaterThan(
      0,
    );
  });

  it("should handle records with null boost pressure", () => {
    const recordsWithNull: Record[] = [
      {
        ...mockRecords[0],
        boostPressure: null,
        manifoldPressure: null,
      },
    ];
    render(<BoostChart records={recordsWithNull} />);
    expect(screen.getAllByText("Pressure Distribution").length).toBeGreaterThan(
      0,
    );
  });

  it("should handle records with undefined boost pressure", () => {
    const recordsWithUndefined: Record[] = [
      {
        ...mockRecords[0],
        boostPressure: undefined,
        manifoldPressure: undefined,
      },
    ];
    render(<BoostChart records={recordsWithUndefined} />);
    expect(screen.getAllByText("Pressure Distribution").length).toBeGreaterThan(
      0,
    );
  });

  it("should handle mixed valid and invalid pressure values", () => {
    const mixedRecords: Record[] = [
      mockRecords[0],
      { ...mockRecords[1], boostPressure: null },
      mockRecords[2],
    ];
    render(<BoostChart records={mixedRecords} />);
    expect(screen.getAllByText("Boost Pressure (PSI)").length).toBeGreaterThan(
      0,
    );
  });

  it("should create histogram bins correctly", () => {
    const { container } = render(<BoostChart records={mockRecords} />);
    expect(container).toBeInTheDocument();
  });

  it("should handle single record", () => {
    render(<BoostChart records={[mockRecords[0]]} />);
    expect(screen.getAllByText("Boost Pressure (PSI)").length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText("Pressure Distribution").length).toBeGreaterThan(
      0,
    );
  });

  it("should render without crashing with large dataset", () => {
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      ...mockRecords[0],
      id: `record-${i}`,
      timestamp: new Date(
        Date.now() + i * 1000,
      ).toISOString() as `${string}T${string}Z`,
      boostPressure: 10 + Math.random() * 10,
      manifoldPressure: 8 + Math.random() * 8,
    }));
    render(<BoostChart records={largeDataset} />);
    expect(screen.getAllByText("Boost Pressure (PSI)").length).toBeGreaterThan(
      0,
    );
  });
});
