import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SessionsDataGrid from "./SessionsDataGrid";
import { useSessions } from "@/hooks/useSessions";
import { Session } from "@/types/api";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid";
import React from "react";

vi.mock("@/hooks/useSessions");
vi.mock("./EditSessionModal", () => ({
  default: vi.fn(({ session, onClose }) =>
    React.createElement(
      "div",
      { "data-testid": "edit-session-modal" },
      React.createElement("div", {}, `Editing session: ${session.id}`),
      React.createElement("button", { onClick: onClose }, "Close Edit Modal"),
    ),
  ),
}));

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
                // Handle actions column
                if (col.type === "actions" && col.getActions) {
                  const actions = col.getActions({ row } as never);
                  return React.createElement(
                    "td",
                    { key: col.field },
                    ...actions,
                  );
                }

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
  GridActionsCellItem: vi.fn(({ icon, label, onClick }) =>
    React.createElement(
      "button",
      { onClick, "aria-label": label },
      icon,
      label,
    ),
  ),
}));

const mockSessions: Session[] = [
  {
    id: "1",
    startTime: "2024-01-15T10:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    trackName: "Laguna Seca",
    trackLatitude: 36.5844,
    trackLongitude: -121.7536,
    carYear: 2020,
    carMake: "Toyota",
    carModel: "Camry",
  },
  {
    id: "2",
    startTime: "2024-01-16T14:00:00Z",
    endTime: "2024-01-16T15:30:00Z",
    trackName: "Circuit of the Americas",
    trackLatitude: 30.1328,
    trackLongitude: -97.6411,
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
      within(dataGrid as HTMLElement).getByText("Session ID"),
    ).toBeInTheDocument();
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
    expect(
      within(dataGrid as HTMLElement).getByText("Actions"),
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

  it("should display session IDs", () => {
    const { container } = render(<SessionsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(within(dataGrid as HTMLElement).getByText("1")).toBeInTheDocument();
    expect(within(dataGrid as HTMLElement).getByText("2")).toBeInTheDocument();
  });

  it("should render edit buttons for each session", () => {
    const { container } = render(<SessionsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const editButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Edit",
    );
    expect(editButtons).toHaveLength(2);
  });

  it("should open EditSessionModal when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<SessionsDataGrid />);

    const editButtons = screen.getAllByLabelText("Edit");
    await user.click(editButtons[0]);

    expect(screen.getByTestId("edit-session-modal")).toBeInTheDocument();
    expect(screen.getByText("Editing session: 1")).toBeInTheDocument();
  });

  it("should close EditSessionModal when onClose is called", async () => {
    const user = userEvent.setup();
    render(<SessionsDataGrid />);

    const editButtons = screen.getAllByLabelText("Edit");
    await user.click(editButtons[0]);

    expect(screen.getByTestId("edit-session-modal")).toBeInTheDocument();

    const closeButton = screen.getByText("Close Edit Modal");
    await user.click(closeButton);

    expect(screen.queryByTestId("edit-session-modal")).not.toBeInTheDocument();
  });
});
