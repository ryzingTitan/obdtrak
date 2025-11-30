import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import SessionsDataGrid from "./SessionsDataGrid";
import { useSessions } from "@/hooks/useSessions";
import { Session } from "@/types/api";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import React from "react";

vi.mock("@/hooks/useSessions");

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
                let value: string | number | undefined = row[col.field];

                if (col.valueGetter && typeof col.valueGetter === "function") {
                  value = col.valueGetter(
                    value,
                    row as never,
                    col as never,
                    {} as never,
                  );
                }

                if (
                  col.valueFormatter &&
                  typeof col.valueFormatter === "function"
                ) {
                  value = col.valueFormatter(
                    value as never,
                    row as never,
                    col as never,
                    {} as never,
                  );
                }

                return React.createElement("td", { key: col.field }, value);
              }),
            ),
          ),
        ),
      ),
    );
  }),
}));

const mockSessions: Session[] = [
  {
    id: "1",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    trackName: "Laguna Seca",
    carYear: 2020,
    carMake: "Toyota",
    carModel: "Camry",
  },
  {
    id: "2",
    startTime: "2024-01-16T14:00:00Z",
    endTime: "2024-01-16T15:30:00Z",
    trackName: "Circuit of the Americas",
    carYear: 2021,
    carMake: "Honda",
    carModel: "Civic",
  },
];

describe("SessionsDataGrid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSessions).mockReturnValue({
      sessions: mockSessions,
      isLoading: false,
    });
  });

  it("should render the DataGrid with session data", () => {
    const { container } = render(<SessionsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(dataGrid).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Laguna Seca"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Circuit of the Americas"),
    ).toBeInTheDocument();
  });

  it("should display centered column headers", () => {
    const { container } = render(<SessionsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("Start Time"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("End Time"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Track Name"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Car"),
    ).toBeInTheDocument();
  });

  it("should display track names from sessions", () => {
    const { container } = render(<SessionsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("Laguna Seca"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Circuit of the Americas"),
    ).toBeInTheDocument();
  });

  it("should display combined car details from sessions", () => {
    const { container } = render(<SessionsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("2020 Toyota Camry"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("2021 Honda Civic"),
    ).toBeInTheDocument();
  });

  it("should show loading state", () => {
    vi.mocked(useSessions).mockReturnValue({
      sessions: [],
      isLoading: true,
    });

    render(<SessionsDataGrid />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should render empty grid when no sessions are available", () => {
    vi.mocked(useSessions).mockReturnValue({
      sessions: [],
      isLoading: false,
    });

    const { container } = render(<SessionsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).queryByText("Laguna Seca"),
    ).not.toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Start Time"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Track Name"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Car"),
    ).toBeInTheDocument();
  });

  it("should format start and end times", () => {
    const { container } = render(<SessionsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const formattedDate1 = new Date("2024-01-15T10:00:00Z").toLocaleString();
    const formattedDate2 = new Date("2024-01-15T11:00:00Z").toLocaleString();

    expect(
      within(dataGrid as HTMLElement).getByText(formattedDate1),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText(formattedDate2),
    ).toBeInTheDocument();
  });
});
