import useSWR from "swr";
import { Car } from "@/types/api";
import {
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import { createCar, deleteCar, getAllCars, updateCar } from "@/lib/cars";
import { useSnackbar } from "notistack";

export const useCars = () => {
  const swrKey = `/cars`;
  const { data, isLoading, mutate } = useSWR<Car[]>(swrKey, getAllCars);
  const [rows, setRows] = useState<readonly Car[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (data) {
      setRows((currentRows) => {
        const newRows = currentRows.filter((r) =>
          String(r.id).startsWith("new-"),
        );
        const serverRows = data;
        const serverRowIds = new Set(serverRows.map((r) => r.id));
        const uniqueNewRows = newRows.filter((r) => !serverRowIds.has(r.id));
        return [...uniqueNewRows, ...serverRows];
      });
    }
  }, [data]);

  const handleRowModesModelChange = (newModel: GridRowModesModel) => {
    setRowModesModel(newModel);
  };

  const handleEditClick = useCallback(
    (id: GridRowId) => () => {
      setRowModesModel((prev) => ({
        ...prev,
        [id]: { mode: GridRowModes.Edit },
      }));
    },
    [],
  );

  const handleSaveClick = useCallback(
    (id: GridRowId) => () => {
      setRowModesModel((prev) => ({
        ...prev,
        [id]: { mode: GridRowModes.View },
      }));
    },
    [],
  );

  const handleCancelClick = useCallback(
    (id: GridRowId) => () => {
      setRowModesModel((prev) => ({
        ...prev,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      }));

      if (String(id).startsWith("new-")) {
        setRows((currentRows) => currentRows.filter((row) => row.id !== id));
      }
    },
    [],
  );

  const handleDeleteClick = useCallback(
    (id: GridRowId) => async () => {
      if (String(id).startsWith("new-")) {
        setRows((currentRows) => currentRows.filter((row) => row.id !== id));
        return;
      }

      let originalRows: readonly Car[] = [];
      setRows((currentRows) => {
        originalRows = currentRows;
        return currentRows.filter((row) => row.id !== id);
      });

      try {
        await deleteCar(swrKey, String(id));
        await mutate(
          (currentData) => currentData?.filter((r) => r.id !== id),
          false,
        );
        enqueueSnackbar("Car deleted", { variant: "success" });
      } catch (e) {
        console.error(e);
        setRows(originalRows);
        enqueueSnackbar("Failed to delete car", { variant: "error" });
      }
    },
    [swrKey, mutate, enqueueSnackbar],
  );

  const processRowUpdate = useCallback(
    async (newRow: GridValidRowModel): Promise<GridValidRowModel> => {
      const payload: Partial<Car> = {
        ...newRow,
      };

      try {
        if (String(newRow.id).startsWith("new-")) {
          const created = await createCar(swrKey, payload);
          setRows((currentRows) =>
            currentRows.map((row) => (row.id === newRow.id ? created : row)),
          );
          await mutate(
            (currentData) => [created, ...(currentData || [])],
            false,
          );
          enqueueSnackbar("Car created", { variant: "success" });
          return created;
        } else {
          const updated = await updateCar(swrKey, String(newRow.id), payload);
          setRows((currentRows) =>
            currentRows.map((row) => (row.id === updated.id ? updated : row)),
          );
          await mutate(
            (currentData) =>
              currentData?.map((r) => (r.id === updated.id ? updated : r)),
            false,
          );
          enqueueSnackbar("Car updated", { variant: "success" });
          return updated;
        }
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Failed to save car", { variant: "error" });
        throw e;
      }
    },
    [swrKey, mutate, enqueueSnackbar],
  );

  const handleAddNew = useCallback(() => {
    const id = `new-${Date.now()}`;
    const newRow: Car = {
      id,
      year: 0,
      make: "",
      model: "",
    };

    setRows((oldRows) => [newRow, ...oldRows]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "year" },
    }));
  }, []);

  return {
    rows,
    isLoading,
    rowModesModel,
    handleRowModesModelChange,
    handleEditClick,
    handleSaveClick,
    handleCancelClick,
    handleDeleteClick,
    processRowUpdate,
    handleAddNew,
  };
};
