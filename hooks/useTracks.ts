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
  const [rows, setRows] = useState<readonly Track[]>([]);
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
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    },
    [rowModesModel],
  );

  const handleSaveClick = useCallback(
    (id: GridRowId) => () => {
      setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    },
    [rowModesModel],
  );

  const handleCancelClick = useCallback(
    (id: GridRowId) => () => {
      setRowModesModel({
        ...rowModesModel,
        [id]: { mode: GridRowModes.View, ignoreModifications: true },
      });

      if (String(id).startsWith("new-")) {
        setRows((currentRows) => currentRows.filter((row) => row.id !== id));
      }
    },
    [rowModesModel],
  );

  const handleDeleteClick = useCallback(
    (id: GridRowId) => async () => {
      const originalRows = [...rows];
      const newRows = rows.filter((row) => row.id !== id);
      setRows(newRows);

      if (String(id).startsWith("new-")) {
        return;
      }

      try {
        await deleteTrack(swrKey, String(id));
        await mutate(
          newRows.filter((r) => !String(r.id).startsWith("new-")),
          false,
        );
        enqueueSnackbar("Track deleted", { variant: "success" });
      } catch (e) {
        console.error(e);
        setRows(originalRows);
        enqueueSnackbar("Failed to delete track", { variant: "error" });
      }
    },
    [rows, swrKey, mutate, enqueueSnackbar],
  );

  const processRowUpdate = useCallback(
    async (newRow: GridValidRowModel): Promise<GridValidRowModel> => {
      const payload: Partial<Track> = {
        ...newRow,
      };

      try {
        if (String(newRow.id).startsWith("new-")) {
          const created = await createTrack(swrKey, payload);
          setRows((currentRows) =>
            currentRows.map((row) => (row.id === newRow.id ? created : row)),
          );
          await mutate(
            (currentData) => [created, ...(currentData || [])],
            false,
          );
          enqueueSnackbar("Track created", { variant: "success" });
          return created;
        } else {
          const updated = await updateTrack(swrKey, String(newRow.id), payload);
          setRows((currentRows) =>
            currentRows.map((row) => (row.id === updated.id ? updated : row)),
          );
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

    setRows((oldRows) => [newRow, ...oldRows]);
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
