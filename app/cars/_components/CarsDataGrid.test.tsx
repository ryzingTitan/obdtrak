import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CarsDataGrid from "./CarsDataGrid";
import { useCars } from "@/hooks/useCars";
import { Car } from "@/types/api";
import {
  GridRowModes,
  GridRowModesModel,
  GridColDef,
  GridValidRowModel,
} from "@mui/x-data-grid";
import React from "react";

vi.mock("@/hooks/useCars");

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

interface MockGridAction {
  key: string | null;
  props: {
    label: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLElement>;
  };
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
                  const actions = col.getActions({ id: row.id } as never);
                  return React.createElement(
                    "td",
                    { key: col.field },
                    ...actions.map((action: MockGridAction) => {
                      return React.createElement("button", {
                        key: action.key ?? col.field,
                        "aria-label": action.props.label,
                        onClick: action.props.onClick ?? (() => {}),
                      });
                    }),
                  );
                }
                const value = row[col.field];
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
      { "aria-label": "Add car", onClick },
      children,
    ),
  GridRowEditStopReasons: { rowFocusOut: "rowFocusOut" },
  GridRowModes: { Edit: "edit", View: "view" },
}));

const mockCars: Car[] = [
  { id: "1", year: 2020, make: "Toyota", model: "Camry" },
  { id: "2", year: 2021, make: "Honda", model: "Civic" },
];

describe("CarsDataGrid", () => {
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
    vi.mocked(useCars).mockReturnValue({
      rows: mockCars,
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlers,
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

  it("should display actions column", () => {
    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("Actions"),
    ).toBeInTheDocument();
  });

  it("should show loading state", () => {
    vi.mocked(useCars).mockReturnValue({
      rows: [],
      isLoading: true,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlers,
    });

    render(<CarsDataGrid />);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("should display edit and delete actions for each row", () => {
    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const editButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Edit",
    );
    const deleteButtons = within(dataGrid as HTMLElement).getAllByLabelText(
      "Delete",
    );

    expect(editButtons).toHaveLength(mockCars.length);
    expect(deleteButtons).toHaveLength(mockCars.length);
  });

  it("should display save and cancel buttons when row is in edit mode", () => {
    const rowModesModel: GridRowModesModel = {
      "1": { mode: GridRowModes.Edit },
    };

    vi.mocked(useCars).mockReturnValue({
      rows: mockCars,
      isLoading: false,
      rowModesModel,
      ...mockHandlers,
    });

    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByLabelText("Save"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByLabelText("Cancel"),
    ).toBeInTheDocument();
  });

  it("should render empty grid when no cars are available", () => {
    vi.mocked(useCars).mockReturnValue({
      rows: [],
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlers,
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

  it("should render the toolbar with Add button", () => {
    render(<CarsDataGrid />);

    const addButtons = screen.getAllByRole("button", { name: /add car/i });
    expect(addButtons[0]).toBeInTheDocument();
  });

  it("should call handleAddNew when Add button is clicked", async () => {
    const user = userEvent.setup();
    render(<CarsDataGrid />);

    const addButtons = screen.getAllByRole("button", { name: /add car/i });
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

    vi.mocked(useCars).mockReturnValue({
      rows: mockCars,
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlersWithDelete,
    });

    const { container } = render(<CarsDataGrid />);
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

    vi.mocked(useCars).mockReturnValue({
      rows: mockCars,
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlersWithEdit,
    });

    const { container } = render(<CarsDataGrid />);
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

    vi.mocked(useCars).mockReturnValue({
      rows: mockCars,
      isLoading: false,
      rowModesModel,
      ...mockHandlersWithSave,
    });

    const { container } = render(<CarsDataGrid />);
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

    vi.mocked(useCars).mockReturnValue({
      rows: mockCars,
      isLoading: false,
      rowModesModel,
      ...mockHandlersWithCancel,
    });

    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    const cancelButton = within(dataGrid as HTMLElement).getByLabelText(
      "Cancel",
    );
    await user.click(cancelButton);

    expect(mockHandlersWithCancel.handleCancelClick).toHaveBeenCalledWith("1");
    expect(mockCancelHandler).toHaveBeenCalledTimes(1);
  });

  it("should format year values as strings", () => {
    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(
      within(dataGrid as HTMLElement).getByText("2020"),
    ).toBeInTheDocument();
    expect(
      within(dataGrid as HTMLElement).getByText("2021"),
    ).toBeInTheDocument();
  });

  it("should handle undefined year values in formatter", () => {
    const carsWithUndefinedYear: Car[] = [
      {
        id: "1",
        year: undefined as unknown as number,
        make: "Toyota",
        model: "Camry",
      },
    ];

    vi.mocked(useCars).mockReturnValue({
      rows: carsWithUndefinedYear as Car[],
      isLoading: false,
      rowModesModel: {} as GridRowModesModel,
      ...mockHandlers,
    });

    const { container } = render(<CarsDataGrid />);
    const dataGrid = container.querySelector('[data-testid="data-grid"]');

    expect(dataGrid).toBeInTheDocument();
  });
});
