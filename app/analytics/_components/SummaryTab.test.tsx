import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import SummaryTab from "./SummaryTab";
import { Record } from "@/types/api";
import React from "react";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";

interface MockDataGridProps {
  rows: GridValidRowModel[];
  columns: GridColDef[];
  loading?: boolean;
  getRowId?: (row: GridValidRowModel) => string;
  sx?: object;
}

vi.mock("@mui/x-data-grid", () => ({
  DataGrid: vi.fn(({ rows, columns, loading, getRowId }: MockDataGridProps) => {
    if (loading) {
      return React.createElement("div", { role: "progressbar" }, "Loading...");
    }
    return React.createElement(
      "div",
      { "data-testid": "data-grid" },
      React.createElement(
        "table",
        {},
        React.createElement(
          "thead",
          {},
          React.createElement(
            "tr",
            {},
            ...columns.map((col) =>
              React.createElement("th", { key: col.field }, col.headerName),
            ),
          ),
        ),
        React.createElement(
          "tbody",
          {},
          ...rows.map((row) => {
            const rowId = getRowId ? getRowId(row) : row.id;
            return React.createElement(
              "tr",
              { key: rowId },
              ...columns.map((col) => {
                let value = row[col.field];
                if (
                  col.valueFormatter &&
                  typeof col.valueFormatter === "function"
                ) {
                  value = (
                    col.valueFormatter as (
                      v: typeof value,
                      r: typeof row,
                      c: typeof col,
                      a: unknown,
                    ) => typeof value
                  )(value, row, col, undefined);
                }
                return React.createElement(
                  "td",
                  { key: col.field },
                  value !== null && value !== undefined ? String(value) : "",
                );
              }),
            );
          }),
        ),
      ),
    );
  }),
}));

describe("SummaryTab", () => {
  const mockRecords: Record[] = [
    {
      sessionId: "1",
      timestamp: "2024-01-15T10:00:00Z",
      longitude: -121.7544,
      latitude: 36.5844,
      altitude: 100,
      intakeAirTemperature: 95,
      boostPressure: 12,
      coolantTemperature: 180,
      engineRpm: 3500,
      speed: 65,
      throttlePosition: 75,
      airFuelRatio: 14.7,
      oilPressure: 45,
      manifoldPressure: 10,
      massAirFlow: 15,
    },
    {
      sessionId: "1",
      timestamp: "2024-01-15T10:00:01Z",
      longitude: -121.7545,
      latitude: 36.5845,
      altitude: 105,
      intakeAirTemperature: 98,
      boostPressure: 15,
      coolantTemperature: 185,
      engineRpm: 4000,
      speed: 70,
      throttlePosition: 80,
      airFuelRatio: 14.5,
      oilPressure: 48,
      manifoldPressure: 12,
      massAirFlow: 18,
    },
    {
      sessionId: "1",
      timestamp: "2024-01-15T10:00:02Z",
      longitude: -121.7546,
      latitude: 36.5846,
      altitude: 110,
      intakeAirTemperature: 100,
      boostPressure: 18,
      coolantTemperature: 190,
      engineRpm: 4500,
      speed: 75,
      throttlePosition: 85,
      airFuelRatio: 14.3,
      oilPressure: 50,
      manifoldPressure: 14,
      massAirFlow: 20,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("should render DataGrid with records", () => {
    render(<SummaryTab records={mockRecords} />);

    const grid = screen.getByTestId("data-grid");
    expect(grid).toBeInTheDocument();
  });

  it("should render all column headers", () => {
    render(<SummaryTab records={mockRecords} />);

    expect(screen.getByText("Timestamp")).toBeInTheDocument();
    expect(screen.getByText("Intake Air Temp")).toBeInTheDocument();
    expect(screen.getByText("Boost Pressure (PSI)")).toBeInTheDocument();
    expect(screen.getByText("Coolant Temp")).toBeInTheDocument();
    expect(screen.getByText("Engine RPM")).toBeInTheDocument();
    expect(screen.getByText("Speed (MPH)")).toBeInTheDocument();
    expect(screen.getByText("Throttle Position")).toBeInTheDocument();
    expect(screen.getByText("AFR")).toBeInTheDocument();
    expect(screen.getByText("Oil Pressure (PSI)")).toBeInTheDocument();
    expect(screen.getByText("Manifold Pressure (PSI)")).toBeInTheDocument();
    expect(screen.getByText("Mass Air Flow (G/S)")).toBeInTheDocument();
  });

  it("should display record data in rows", () => {
    render(<SummaryTab records={mockRecords} />);

    // Check for some unique data values from first record
    expect(screen.getByText("95")).toBeInTheDocument();
    expect(screen.getByText("3500")).toBeInTheDocument();
    expect(screen.getByText("14.7")).toBeInTheDocument();

    // Check for values that appear multiple times
    expect(screen.getAllByText("12").length).toBeGreaterThan(0);
    expect(screen.getAllByText("65").length).toBeGreaterThan(0);
  });

  it("should format timestamp with dayjs", () => {
    render(<SummaryTab records={mockRecords} />);

    // The timestamp should be formatted as MM-DD-YYYY h:mm:ss A
    // "2024-01-15T10:00:00Z" should be formatted
    expect(screen.getAllByText(/01-15-2024/).length).toBeGreaterThan(0);
  });

  it("should handle empty records array", () => {
    render(<SummaryTab records={[]} />);

    const grid = screen.getByTestId("data-grid");
    expect(grid).toBeInTheDocument();
    expect(screen.getByText("Timestamp")).toBeInTheDocument();
  });

  it("should display loading state when loading is true", () => {
    render(<SummaryTab records={mockRecords} loading={true} />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should not display loading state by default", () => {
    render(<SummaryTab records={mockRecords} />);

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
  });

  it("should render multiple records", () => {
    render(<SummaryTab records={mockRecords} />);

    const tbody = screen.getByTestId("data-grid").querySelector("tbody");
    const rows = tbody?.querySelectorAll("tr");
    expect(rows).toHaveLength(3);
  });

  it("should display all data for first record", () => {
    render(<SummaryTab records={mockRecords} />);

    expect(screen.getByText("95")).toBeInTheDocument(); // intakeAirTemperature
    expect(screen.getAllByText("12").length).toBeGreaterThan(0); // boostPressure (appears in multiple records)
    expect(screen.getByText("180")).toBeInTheDocument(); // coolantTemperature
    expect(screen.getByText("3500")).toBeInTheDocument(); // engineRpm
    expect(screen.getAllByText("65").length).toBeGreaterThan(0); // speed (appears in multiple records)
    expect(screen.getAllByText("75").length).toBeGreaterThan(0); // throttlePosition (appears in multiple records)
    expect(screen.getByText("14.7")).toBeInTheDocument(); // airFuelRatio
    expect(screen.getByText("45")).toBeInTheDocument(); // oilPressure
    expect(screen.getAllByText("10").length).toBeGreaterThan(0); // manifoldPressure (appears in multiple records)
    expect(screen.getAllByText("15").length).toBeGreaterThan(0); // massAirFlow (appears in multiple records)
  });

  it("should display all data for second record", () => {
    render(<SummaryTab records={mockRecords} />);

    expect(screen.getByText("98")).toBeInTheDocument(); // intakeAirTemperature
    expect(screen.getByText("185")).toBeInTheDocument(); // coolantTemperature
    expect(screen.getByText("4000")).toBeInTheDocument(); // engineRpm
    expect(screen.getByText("70")).toBeInTheDocument(); // speed
    expect(screen.getByText("80")).toBeInTheDocument(); // throttlePosition
    expect(screen.getByText("14.5")).toBeInTheDocument(); // airFuelRatio
    expect(screen.getByText("48")).toBeInTheDocument(); // oilPressure
  });

  it("should display all data for third record", () => {
    render(<SummaryTab records={mockRecords} />);

    expect(screen.getByText("100")).toBeInTheDocument(); // intakeAirTemperature
    expect(screen.getAllByText("18").length).toBeGreaterThan(0); // boostPressure (appears in multiple records)
    expect(screen.getByText("190")).toBeInTheDocument(); // coolantTemperature
    expect(screen.getByText("4500")).toBeInTheDocument(); // engineRpm
    expect(screen.getByText("85")).toBeInTheDocument(); // throttlePosition
    expect(screen.getByText("14.3")).toBeInTheDocument(); // airFuelRatio
    expect(screen.getByText("50")).toBeInTheDocument(); // oilPressure
    expect(screen.getAllByText("14").length).toBeGreaterThan(0); // manifoldPressure (appears in multiple records)
    expect(screen.getAllByText("20").length).toBeGreaterThan(0); // massAirFlow (appears in multiple records)
  });

  it("should handle single record", () => {
    render(<SummaryTab records={[mockRecords[0]]} />);

    const tbody = screen.getByTestId("data-grid").querySelector("tbody");
    const rows = tbody?.querySelectorAll("tr");
    expect(rows).toHaveLength(1);
  });

  it("should render with large dataset", () => {
    const largeDataset = Array.from({ length: 100 }, (_, i) => ({
      ...mockRecords[0],
      sessionId: "1",
      timestamp: new Date(
        Date.now() + i * 1000,
      ).toISOString() as `${string}T${string}Z`,
      latitude: 36.5844 + i * 0.0001,
      longitude: -121.7544 + i * 0.0001,
    }));

    render(<SummaryTab records={largeDataset} />);

    const tbody = screen.getByTestId("data-grid").querySelector("tbody");
    const rows = tbody?.querySelectorAll("tr");
    expect(rows).toHaveLength(100);
  });

  it("should handle records with null values", () => {
    const recordsWithNull: Record[] = [
      {
        ...mockRecords[0],
        intakeAirTemperature: null as unknown as number,
        boostPressure: null as unknown as number,
      },
    ];

    render(<SummaryTab records={recordsWithNull} />);

    const grid = screen.getByTestId("data-grid");
    expect(grid).toBeInTheDocument();
  });

  it("should handle records with undefined values", () => {
    const recordsWithUndefined: Record[] = [
      {
        ...mockRecords[0],
        intakeAirTemperature: undefined as unknown as number,
        coolantTemperature: undefined as unknown as number,
      },
    ];

    render(<SummaryTab records={recordsWithUndefined} />);

    const grid = screen.getByTestId("data-grid");
    expect(grid).toBeInTheDocument();
  });

  it("should have 11 columns defined", () => {
    render(<SummaryTab records={mockRecords} />);

    const thead = screen.getByTestId("data-grid").querySelector("thead");
    const headers = thead?.querySelectorAll("th");
    expect(headers).toHaveLength(11);
  });

  it("should render timestamp as first column", () => {
    render(<SummaryTab records={mockRecords} />);

    const thead = screen.getByTestId("data-grid").querySelector("thead");
    const firstHeader = thead?.querySelector("th");
    expect(firstHeader).toHaveTextContent("Timestamp");
  });

  it("should handle records from different sessions", () => {
    const recordsFromDifferentSessions: Record[] = [
      mockRecords[0],
      { ...mockRecords[1], sessionId: "2" },
      { ...mockRecords[2], sessionId: "3" },
    ];

    render(<SummaryTab records={recordsFromDifferentSessions} />);

    const tbody = screen.getByTestId("data-grid").querySelector("tbody");
    const rows = tbody?.querySelectorAll("tr");
    expect(rows).toHaveLength(3);
  });

  it("should handle records with same timestamp but different coordinates", () => {
    const recordsWithSameTimestamp: Record[] = [
      mockRecords[0],
      {
        ...mockRecords[0],
        latitude: 37.0,
        longitude: -122.0,
      },
    ];

    render(<SummaryTab records={recordsWithSameTimestamp} />);

    const tbody = screen.getByTestId("data-grid").querySelector("tbody");
    const rows = tbody?.querySelectorAll("tr");
    expect(rows).toHaveLength(2);
  });
});
