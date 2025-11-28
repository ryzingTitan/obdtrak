import useSWR from "swr";
import Track from "@/types/api";
import {
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { useCallback, useEffect, useState } from "react";
import {
  createTrack,
  deleteTrack,
  getAllTracks,
  updateTrack,
} from "@/lib/tracks";
import { useSnackbar } from "notistack";

export const useTracks = () => {
  const swrKey = `/tracks`;
  const { data, isLoading, mutate } = useSWR<Track[]>(swrKey, getAllTracks);
  const [rows, setRows] = useState<Track[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const { enqueueSnackbar } = useSnackbar();

  // Sync server data with local state, preserving temporary rows
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

  const handleRowModesModelChange = useCallback(
    (newModel: GridRowModesModel) => {
      // Defer state update to avoid updating state during render
      queueMicrotask(() => {
        setRowModesModel(newModel);
      });
    },
    [],
  );

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

      // If the row is a new row, remove it from local state
      if (String(id).startsWith("new-")) {
        setRows((currentRows) => currentRows.filter((row) => row.id !== id));
      }
    },
    [],
  );

  const handleDeleteClick = useCallback(
    (id: GridRowId) => async () => {
      const toRemove = rows.find((r) => r.id === id);
      if (!toRemove) return;

      // Optimistically remove from local state
      setRows((currentRows) => currentRows.filter((r) => r.id !== id));

      try {
        if (!String(toRemove.id).startsWith("new-")) {
          await deleteTrack(swrKey, String(toRemove.id));
          await mutate();
          enqueueSnackbar("Track deleted", { variant: "success" });
        }
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Failed to delete track", { variant: "error" });
        // Restore the row on error
        setRows((currentRows) => [toRemove, ...currentRows]);
      }
    },
    [rows, swrKey, mutate, enqueueSnackbar],
  );

  const processRowUpdate = useCallback(
    async (
      newRow: GridValidRowModel,
      oldRow: GridValidRowModel,
    ): Promise<GridValidRowModel> => {
      const payload: Partial<Track> = {
        ...newRow,
      };

      try {
        if (String(newRow.id).startsWith("new-")) {
          // Create on server
          const created = await createTrack(swrKey, payload);

          // Remove temp row and let the server data be merged by useEffect
          setRows((currentRows) =>
            currentRows.filter((r) => r.id !== newRow.id),
          );

          // Trigger revalidation - useEffect will merge the new server data
          await mutate();
          enqueueSnackbar("Track created", { variant: "success" });
          return created;
        } else {
          // Update on server
          const updated = await updateTrack(swrKey, String(oldRow.id), payload);

          // Trigger revalidation - useEffect will merge the updated server data
          await mutate();
          enqueueSnackbar("Track updated", { variant: "success" });
          return updated;
        }
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Failed to save track", { variant: "error" });
        throw e;
      }
    },
    [swrKey, mutate, enqueueSnackbar],
  );

  const handleAddNew = useCallback(() => {
    const id = `new-${Date.now()}`;
    const newRow = {
      id,
      name: "",
      latitude: 0,
      longitude: 0,
    };

    // Add to local state
    setRows((currentRows) => [newRow, ...currentRows]);

    // Defer state update to avoid updating state during render
    queueMicrotask(() => {
      setRowModesModel((prev) => ({
        ...prev,
        [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
      }));
    });
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
