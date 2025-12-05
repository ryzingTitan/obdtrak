import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TracksDataGrid from "./TracksDataGrid";
import { useTracks } from "@/hooks/useTracks";
import Track from "@/types/api";
import {
  GridRowModes,
  GridRowModesModel,
  GridColDef,
  GridValidRowModel,
  GridActionsCellItemProps,
} from "@mui/x-data-grid";
import React, { ReactElement } from "react";

vi.mock("@/hooks/useTracks");

vi.mock("./TrackPreviewModal", () => ({
  default: ({
    track,
    open,
    onClose,
  }: {
    track: Track | null;
    open: boolean;
    onClose: () => void;
  }) => {
    if (!open || !track) return null;
    return React.createElement(
      "div",
      { "data-testid": "track-preview-modal" },
      React.createElement("h2", {}, `Preview Track: ${track.name}`),
      React.createElement("button", { onClick: onClose }, "Close"),
    );
  },
}));

interface MockDataGridProps {
  rows: GridValidRowModel[];
  columns: GridColDef[];
  loading?: boolean;
  slots?: {
    toolbar?: () => React.ReactNode;
  };
}

interface MockGridActionsCellItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

vi.mock("@mui/x-data-grid", () => ({
  DataGrid: vi.fn(({ rows, columns, loading, slots }: MockDataGridProps) => {
    if (loading) {
      return React.createElement("div", { role: "progressbar" }, "Loading...");
    }
    return React.createElement(
      "div",
      { "data-testid": "data-grid" },
      slots?.toolbar && slots.toolbar(),
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
                if (col.type === "actions" && "getActions" in col) {
                  const actions = col.getActions({
                    id: row.id,
                  } as never) as readonly ReactElement<GridActionsCellItemProps>[];
                  return React.createElement(
                    "td",
                    { key: col.field },
                    ...actions.map((action) => {
                      return React.createElement("button", {
                        key: action.key ?? undefined,
                        "aria-label": action.props.label,
                        onClick: action.props.onClick,
                      });
                    }),
                  );
                }
                const value =
                  col.valueFormatter && typeof col.valueFormatter === "function"
                    ? col.valueFormatter(
                        row[col.field] as never,
                        row as never,
                        col as never,
                        {} as never,
                      )
                    : row[col.field];
                return React.createElement("td", { key: col.field }, value);
              }),
            ),
          ),
        ),
      ),
    );
  }),
  GridActionsCellItem: ({
    icon,
    label,
    onClick,
  }: MockGridActionsCellItemProps) =>
    React.createElement("button", { "aria-label": label, onClick }, icon),
  Toolbar: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", { "data-testid": "toolbar" }, children),
  ToolbarButton: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick: () => void;
  }) =>
    React.createElement(
      "button",
      { "aria-label": "Add track", onClick },
      children,
    ),
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

describe("TracksDataGrid", () => {
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
    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(dataGrid).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Laguna Seca"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Circuit of the Americas"),
    ).toBeInTheDocument();
  });

  it("should display centered column headers for name, latitude, and longitude", () => {
    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("Track Name"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Track Latitude"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Track Longitude"),
    ).toBeInTheDocument();
  });

  it("should display centered latitude and longitude values", () => {
    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("36.5844"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("-121.7538"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("30.1328"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("-97.6411"),
    ).toBeInTheDocument();
  });

  it("should display actions column", () => {
    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("Actions"),
    ).toBeInTheDocument();
  });

  it("should show loading state", () => {
    vi.mocked(useTracks).mockReturnValue({
      rows: [],
      isLoading: true,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlers,
    });

    render(<TracksDataGrid />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should display preview, edit, and delete actions for each row", () => {
    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const previewButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Preview",
    );
    const editButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Edit",
    );
    const deleteButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Delete",
    );

    expect(previewButtons).toHaveLength(mockTracks.length);
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

    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByLabelText("Save"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByLabelText("Cancel"),
    ).toBeInTheDocument();
  });

  it("should render empty grid when no tracks are available", () => {
    vi.mocked(useTracks).mockReturnValue({
      rows: [],
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlers,
    });

    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).queryByText("Laguna Seca"),
    ).not.toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("Track Name"),
    ).toBeInTheDocument();
  });

  it("should render the toolbar with Add button", () => {
    render(<TracksDataGrid />);

    const addButtons = screen.getAllByRole("button", { name: /add track/i });
    expect(addButtons[0]).toBeInTheDocument();
  });

  it("should call handleAddNew when Add button is clicked", async () => {
    const user = userEvent.setup();
    render(<TracksDataGrid />);

    const addButtons = screen.getAllByRole("button", { name: /add track/i });
    await user.click(addButtons[0]);

    expect(mockHandlers.handleAddNew).toHaveBeenCalledTimes(1);
  });

  it("should call handleDeleteClick when delete button is clicked", async () => {
    const user = userEvent.setup();
    const mockDeleteHandler = vi.fn();
    const mockHandlersWithDelete = {
      ...mockHandlers,
      handleDeleteClick: vi.fn(() => mockDeleteHandler),
    };

    vi.mocked(useTracks).mockReturnValue({
      rows: mockTracks,
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlersWithDelete,
    });

    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const deleteButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Delete",
    );
    await user.click(deleteButtons[0]);

    expect(mockHandlersWithDelete.handleDeleteClick).toHaveBeenCalledWith("1");
    expect(mockDeleteHandler).toHaveBeenCalledTimes(1);
  });

  it("should call handleEditClick when edit button is clicked", async () => {
    const user = userEvent.setup();
    const mockEditHandler = vi.fn();
    const mockHandlersWithEdit = {
      ...mockHandlers,
      handleEditClick: vi.fn(() => mockEditHandler),
    };

    vi.mocked(useTracks).mockReturnValue({
      rows: mockTracks,
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlersWithEdit,
    });

    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const editButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Edit",
    );
    await user.click(editButtons[0]);

    expect(mockHandlersWithEdit.handleEditClick).toHaveBeenCalledWith("1");
    expect(mockEditHandler).toHaveBeenCalledTimes(1);
  });

  it("should call handleSaveClick when save button is clicked", async () => {
    const user = userEvent.setup();
    const mockSaveHandler = vi.fn();
    const mockHandlersWithSave = {
      ...mockHandlers,
      handleSaveClick: vi.fn(() => mockSaveHandler),
    };

    const rowModesModel: GridRowModesModel = {
      "1": { mode: GridRowModes.Edit },
    };

    vi.mocked(useTracks).mockReturnValue({
      rows: mockTracks,
      isLoading: false,
      rowModesModel,
      ...mockHandlersWithSave,
    });

    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const saveButton = within(dataGrid as HTMLElement).getByLabelText("Save");
    await user.click(saveButton);

    expect(mockHandlersWithSave.handleSaveClick).toHaveBeenCalledWith("1");
    expect(mockSaveHandler).toHaveBeenCalledTimes(1);
  });

  it("should call handleCancelClick when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const mockCancelHandler = vi.fn();
    const mockHandlersWithCancel = {
      ...mockHandlers,
      handleCancelClick: vi.fn(() => mockCancelHandler),
    };

    const rowModesModel: GridRowModesModel = {
      "1": { mode: GridRowModes.Edit },
    };

    vi.mocked(useTracks).mockReturnValue({
      rows: mockTracks,
      isLoading: false,
      rowModesModel,
      ...mockHandlersWithCancel,
    });

    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const cancelButton = within(dataGrid as HTMLElement).getByLabelText(
      "Cancel",
    );
    await user.click(cancelButton);

    expect(mockHandlersWithCancel.handleCancelClick).toHaveBeenCalledWith("1");
    expect(mockCancelHandler).toHaveBeenCalledTimes(1);
  });

  it("should open preview modal when preview button is clicked", async () => {
    const user = userEvent.setup();
    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const previewButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Preview",
    );
    await user.click(previewButtons[0]);

    expect(screen.getByTestId("track-preview-modal")).toBeInTheDocument();
    expect(screen.getByText("Preview Track: Laguna Seca")).toBeInTheDocument();
  });

  it("should display correct track in preview modal", async () => {
    const user = userEvent.setup();
    const { container } = render(<TracksDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const previewButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Preview",
    );
    await user.click(previewButtons[1]);

    const modals = screen.getAllByTestId("track-preview-modal");
    expect(modals.length).toBeGreaterThan(0);
    expect(
      screen.getByText("Preview Track: Circuit of the Americas"),
    ).toBeInTheDocument();
  });
});
