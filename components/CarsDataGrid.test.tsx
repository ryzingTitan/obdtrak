import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import CarsDataGrid from "./CarsDataGrid";
import { useCars } from "@/hooks/useCars";
import { Car } from "@/types/api";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import React from "react";

vi.mock("@/hooks/useCars");

interface MockDataGridProps {
  rows: GridValidRowModel[];
  columns: GridColDef[];
  loading?: boolean;
}

vi.mock("@mui/x-data-grid", () => ({
  DataGrid: vi.fn(({ rows, columns, loading }: MockDataGridProps) => {
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
          ...rows.map((row) =>
            React.createElement(
              "tr",
              { key: row.id },
              ...columns.map((col) => {
                const value = row[col.field];
                return React.createElement("td", { key: col.field }, value);
              }),
            ),
          ),
        ),
      ),
    );
  }),
}));

const mockCars: Car[] = [
  { id: "1", year: 2020, make: "Toyota", model: "Camry" },
  { id: "2", year: 2021, make: "Honda", model: "Civic" },
];

describe("CarsDataGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCars).mockReturnValue({
      cars: mockCars,
      isLoading: false,
    });
  });

  it("should render the DataGrid with car data", () => {
    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(dataGrid).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Toyota"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Camry"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Honda"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Civic"),
    ).toBeInTheDocument();
  });

  it("should display centered column headers for year, make, and model", () => {
    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("Year"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Make"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Model"),
    ).toBeInTheDocument();
  });

  it("should display centered year, make, and model values", () => {
    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("2020"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Toyota"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Camry"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("2021"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Honda"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Civic"),
    ).toBeInTheDocument();
  });

  it("should show loading state", () => {
    vi.mocked(useCars).mockReturnValue({
      cars: [],
      isLoading: true,
    });

    render(<CarsDataGrid />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should render empty grid when no cars are available", () => {
    vi.mocked(useCars).mockReturnValue({
      cars: [],
      isLoading: false,
    });

    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).queryByText("Toyota"),
    ).not.toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Year"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Make"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Model"),
    ).toBeInTheDocument();
  });
});
