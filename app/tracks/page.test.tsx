import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tracks from "./page";
import { useTracks } from "@/hooks/useTracks";
import Track from "@/types/api";
import {
  GridRowModes,
  GridRowModesModel,
  GridColDef,
  GridValidRowModel,
} from "@mui/x-data-grid";
import React from "react";

vi.mock("@/hooks/useTracks");

interface MockDataGridProps {
  rows: GridValidRowModel[];
  columns: GridColDef[];
  loading?: boolean;
  slots?: {
    toolbar?: React.ComponentType<{ onAddNew: () => void }>;
  };
  slotProps?: {
    toolbar?: { onAddNew: () => void };
  };
}

interface MockGridActionsCellItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

vi.mock("@mui/x-data-grid", () => ({
  DataGrid: vi.fn(
    ({ rows, columns, loading, slots, slotProps }: MockDataGridProps) => {
      if (loading) {
        return React.createElement(
          "div",
          { role: "progressbar" },
          "Loading...",
        );
      }
      return React.createElement(
        "div",
        { "data-testid": "data-grid" },
        slots?.toolbar &&
          React.createElement(slots.toolbar, slotProps?.toolbar || {}),
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
                  if (col.type === "actions") {
                    const actions = col.getActions!({ id: row.id });
                    return React.createElement(
                      "td",
                      { key: col.field },
                      ...actions.map((action) =>
                        React.createElement("button", {
                          key: action.key,
                          "aria-label": action.props.label,
                        }),
                      ),
                    );
                  }
                  const value = col.valueFormatter
                    ? col.valueFormatter(row[col.field])
                    : row[col.field];
                  return React.createElement("td", { key: col.field }, value);
                }),
              ),
            ),
          ),
        ),
      );
    },
  ),
  GridActionsCellItem: ({
    icon,
    label,
    onClick,
  }: MockGridActionsCellItemProps) =>
    React.createElement("button", { "aria-label": label, onClick }, icon),
  Toolbar: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { role: "toolbar" }, children),
  ToolbarButton: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) => React.createElement("button", { onClick }, children),
  GridRowEditStopReasons: { rowFocusOut: "rowFocusOut" },
  GridRowModes: { Edit: "edit", View: "view" },
}));

const mockTracks: Track[] = [
  { id: "1", name: "Laguna Seca", latitude: 36.5844, longitude: -121.7538 },
  {
    id: "2",
    name: "Circuit of the Americas",
    latitude: 30.1328,
    longitude: -97.6411,
  },
];

describe("Tracks Page", () => {
  const mockHandlers = {
    handleRowModesModelChange: vi.fn(),
    handleEditClick: vi.fn(() => vi.fn()),
    handleSaveClick: vi.fn(() => vi.fn()),
    handleCancelClick: vi.fn(() => vi.fn()),
    handleDeleteClick: vi.fn(() => vi.fn()),
    processRowUpdate: vi.fn(),
    handleAddNew: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTracks).mockReturnValue({
      rows: mockTracks,
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlers,
    });
  });

  it("should render the DataGrid with track data", () => {
    const { container } = render(<Tracks />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(dataGrid).toBeInTheDocument();
    expect(within(dataGrid!).getByText("Laguna Seca")).toBeInTheDocument();
    expect(
      within(dataGrid!).getByText("Circuit of the Americas"),
    ).toBeInTheDocument();
  });

  it("should display centered column headers for name, latitude, and longitude", () => {
    const { container } = render(<Tracks />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(within(dataGrid!).getByText("Track Name")).toBeInTheDocument();
    expect(within(dataGrid!).getByText("Track Latitude")).toBeInTheDocument();
    expect(within(dataGrid!).getByText("Track Longitude")).toBeInTheDocument();
  });

  it("should display centered latitude and longitude values", () => {
    const { container } = render(<Tracks />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(within(dataGrid!).getByText("36.5844")).toBeInTheDocument();
    expect(within(dataGrid!).getByText("-121.7538")).toBeInTheDocument();
    expect(within(dataGrid!).getByText("30.1328")).toBeInTheDocument();
    expect(within(dataGrid!).getByText("-97.6411")).toBeInTheDocument();
  });

  it("should display actions column", () => {
    const { container } = render(<Tracks />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(within(dataGrid!).getByText("Actions")).toBeInTheDocument();
  });

  it("should show loading state", () => {
    vi.mocked(useTracks).mockReturnValue({
      rows: [],
      isLoading: true,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlers,
    });

    render(<Tracks />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should display edit and delete actions for each row", () => {
    const { container } = render(<Tracks />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const editButtons = within(dataGrid!).getAllByLabelText("Edit");
    const deleteButtons = within(dataGrid!).getAllByLabelText("Delete");

    expect(editButtons).toHaveLength(mockTracks.length);
    expect(deleteButtons).toHaveLength(mockTracks.length);
  });

  it("should display save and cancel buttons when row is in edit mode", () => {
    const rowModesModel: GridRowModesModel = {
      "1": { mode: GridRowModes.Edit },
    };

    vi.mocked(useTracks).mockReturnValue({
      rows: mockTracks,
      isLoading: false,
      rowModesModel,
      ...mockHandlers,
    });

    const { container } = render(<Tracks />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(within(dataGrid!).getByLabelText("Save")).toBeInTheDocument();
    expect(within(dataGrid!).getByLabelText("Cancel")).toBeInTheDocument();
  });

  it("should render empty grid when no tracks are available", () => {
    vi.mocked(useTracks).mockReturnValue({
      rows: [],
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlers,
    });

    const { container } = render(<Tracks />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid!).queryByText("Laguna Seca"),
    ).not.toBeInTheDocument();
    expect(within(dataGrid!).getByText("Track Name")).toBeInTheDocument();
  });

  it("should render the toolbar with Add button", () => {
    const { container } = render(<Tracks />);

    const toolbar = container.querySelector('[role="toolbar"]');
    expect(toolbar).toBeInTheDocument();

    const addButton = within(toolbar!).getByRole("button");
    expect(addButton).toBeInTheDocument();
  });

  it("should call handleAddNew when Add button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<Tracks />);

    const toolbar = container.querySelector('[role="toolbar"]');
    const addButton = within(toolbar!).getByRole("button");
    await user.click(addButton);

    expect(mockHandlers.handleAddNew).toHaveBeenCalledTimes(1);
  });
});
