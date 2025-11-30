import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useCars } from "./useCars";
import { createCar, deleteCar, getAllCars, updateCar } from "@/lib/cars";
import { Car } from "@/types/api";
import { SWRConfig } from "swr";
import { SnackbarProvider } from "notistack";
import React from "react";

vi.mock("@/lib/cars");

vi.mock("@mui/x-data-grid", () => ({
  GridRowModes: { Edit: "edit", View: "view" },
}));

const mockCars: Car[] = [
  { id: "1", year: 2020, make: "Toyota", model: "Camry" },
  { id: "2", year: 2021, make: "Honda", model: "Civic" },
];

const wrapper = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    SWRConfig,
    { value: { dedupingInterval: 0, provider: () => new Map() } },
    React.createElement(SnackbarProvider, {}, children),
  );
};

describe("useCars", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAllCars).mockResolvedValue(mockCars);
  });

  it("should fetch cars on mount", async () => {
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    expect(getAllCars).toHaveBeenCalledWith("/cars");
  });

  it("should set isLoading to true while fetching", () => {
    const { result } = renderHook(() => useCars(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it("should handle adding a new row", async () => {
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    act(() => {
      result.current.handleAddNew();
    });

    await waitFor(() => {
      expect(result.current.rows?.length).toBe(3);
    });

    const newRow = result.current.rows?.[0];
    expect(newRow?.id).toMatch(/^new-\d+$/);
    expect(newRow?.make).toBe("");
    expect(newRow?.model).toBe("");
    expect(newRow?.year).toBeGreaterThan(0);
  });

  it("should set row to edit mode when handleEditClick is called", async () => {
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    act(() => {
      const editHandler = result.current.handleEditClick("1");
      editHandler();
    });

    expect(result.current.rowModesModel["1"]?.mode).toBe("edit");
  });

  it("should set row to view mode when handleSaveClick is called", async () => {
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    act(() => {
      const editHandler = result.current.handleEditClick("1");
      editHandler();
    });

    act(() => {
      const saveHandler = result.current.handleSaveClick("1");
      saveHandler();
    });

    expect(result.current.rowModesModel["1"]?.mode).toBe("view");
  });

  it("should remove new row when handleCancelClick is called", async () => {
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    act(() => {
      result.current.handleAddNew();
    });

    const newRowId = result.current.rows?.[0]?.id;

    act(() => {
      const cancelHandler = result.current.handleCancelClick(newRowId!);
      cancelHandler();
    });

    await waitFor(() => {
      expect(result.current.rows?.length).toBe(2);
    });
  });

  it("should set existing row to view mode with ignoreModifications when handleCancelClick is called", async () => {
    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    act(() => {
      const editHandler = result.current.handleEditClick("1");
      editHandler();
    });

    expect(result.current.rowModesModel["1"]?.mode).toBe("edit");

    act(() => {
      const cancelHandler = result.current.handleCancelClick("1");
      cancelHandler();
    });

    expect(result.current.rowModesModel["1"]?.mode).toBe("view");
    expect(
      (
        result.current.rowModesModel["1"] as {
          mode: string;
          ignoreModifications?: boolean;
        }
      )?.ignoreModifications,
    ).toBe(true);
    expect(result.current.rows?.length).toBe(2);
  });

  it("should call deleteCar when handleDeleteClick is called", async () => {
    vi.mocked(deleteCar).mockResolvedValue();

    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    await act(async () => {
      const deleteHandler = result.current.handleDeleteClick("1");
      await deleteHandler();
    });

    expect(deleteCar).toHaveBeenCalledWith("/cars", "1");
  });

  it("should call createCar when processRowUpdate is called with new row", async () => {
    const newCar: Car = {
      id: "3",
      year: 2022,
      make: "Ford",
      model: "Mustang",
    };
    vi.mocked(createCar).mockResolvedValue(newCar);

    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    const newRow = {
      id: "new-123",
      year: 2022,
      make: "Ford",
      model: "Mustang",
    };

    await act(async () => {
      await result.current.processRowUpdate(newRow, newRow);
    });

    expect(createCar).toHaveBeenCalledWith("/cars", newRow);
  });

  it("should call updateCar when processRowUpdate is called with existing row", async () => {
    const updatedCar: Car = {
      id: "1",
      year: 2020,
      make: "Toyota Updated",
      model: "Camry",
    };
    vi.mocked(updateCar).mockResolvedValue(updatedCar);

    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    await act(async () => {
      await result.current.processRowUpdate(updatedCar, mockCars[0]);
    });

    expect(updateCar).toHaveBeenCalledWith("/cars", "1", updatedCar);
  });

  it("should handle errors when creating a car fails", async () => {
    vi.mocked(createCar).mockRejectedValue(new Error("Failed to create car"));

    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    const newRow = {
      id: "new-123",
      year: 2022,
      make: "Test Car",
      model: "Model",
    };

    await expect(
      act(async () => {
        await result.current.processRowUpdate(newRow, newRow);
      }),
    ).rejects.toThrow();
  });

  it("should handle errors when deleting a car fails", async () => {
    vi.mocked(deleteCar).mockRejectedValue(new Error("Failed to delete car"));

    const { result } = renderHook(() => useCars(), { wrapper });

    await waitFor(() => {
      expect(result.current.rows).toEqual(mockCars);
    });

    await act(async () => {
      const deleteHandler = result.current.handleDeleteClick("1");
      await deleteHandler();
    });

    expect(deleteCar).toHaveBeenCalledWith("/cars", "1");
  });
});
