import useSWR from "swr";
import Track from "@/types/api";
import {
  GridRowId,
  GridRowModes,
  GridRowModesModel,
  GridValidRowModel,
} from "@mui/x-data-grid";
import { useCallback, useMemo, useState } from "react";
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
  const [newRows, setNewRows] = useState<readonly Track[]>([]);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const { enqueueSnackbar } = useSnackbar();

  // Derive rows by merging new rows with server data
  const rows = useMemo(() => {
    if (!data) return newRows;
    const serverRowIds = new Set(data.map((r) => r.id));
    const uniqueNewRows = newRows.filter((r) => !serverRowIds.has(r.id));
    return [...uniqueNewRows, ...data];
  }, [data, newRows]);

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
        setNewRows((currentRows) => currentRows.filter((row) => row.id !== id));
      }
    },
    [],
  );

  const handleDeleteClick = useCallback(
    (id: GridRowId) => async () => {
      if (String(id).startsWith("new-")) {
        setNewRows((currentRows) => currentRows.filter((row) => row.id !== id));
        return;
      }

      try {
        await deleteTrack(swrKey, String(id));
        await mutate(
          (currentData) => currentData?.filter((r) => r.id !== id),
          false,
        );
        enqueueSnackbar("Track deleted", { variant: "success" });
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Failed to delete track", { variant: "error" });
      }
    },
    [swrKey, mutate, enqueueSnackbar],
  );

  const processRowUpdate = useCallback(
    async (newRow: GridValidRowModel): Promise<GridValidRowModel> => {
      const payload: Partial<Track> = {
        ...newRow,
      };

      try {
        if (String(newRow.id).startsWith("new-")) {
          const created = await createTrack(swrKey, payload);
          setNewRows((currentRows) =>
            currentRows.filter((row) => row.id !== newRow.id),
          );
          await mutate(
            (currentData) => [created, ...(currentData || [])],
            false,
          );
          enqueueSnackbar("Track created", { variant: "success" });
          return created;
        } else {
          const updated = await updateTrack(swrKey, String(newRow.id), payload);
          await mutate(
            (currentData) =>
              currentData?.map((r) => (r.id === updated.id ? updated : r)),
            false,
          );
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
    const newRow: Track = {
      id,
      name: "",
      longitude: 0,
      latitude: 0,
    };

    setNewRows((oldRows) => [newRow, ...oldRows]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
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
