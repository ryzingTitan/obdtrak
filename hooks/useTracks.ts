import useSWR from "swr";
import Track from "@/types/api";
import { GridRowId, GridRowModes, GridRowModesModel, GridValidRowModel } from "@mui/x-data-grid";
import { useCallback, useState } from "react";
import { createTrack, deleteTrack, getAllTracks, updateTrack } from "@/lib/tracks";
import { useSnackbar } from "notistack";

export const useTracks = () => {
  const swrKey = `/tracks`;
  const { data, isLoading, mutate } = useSWR<Track[]>(
    swrKey,
    getAllTracks,
  );
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const { enqueueSnackbar } = useSnackbar();

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

      // If the row is a new row, remove it from the cache
      if (String(id).startsWith("new-")) {
        mutate(
          (currentData) => currentData?.filter((row) => row.id !== id),
          false,
        );
      }
    },
    [rowModesModel, mutate],
  );

  const handleDeleteClick = useCallback(
    (id: GridRowId) => async () => {
      if (!data) return;
      const toRemove = data.find((r) => r.id === id);
      const optimisticData = data.filter((r) => r.id !== id);

      try {
        if (toRemove && !String(toRemove.id).startsWith("new-")) {
          await mutate(deleteTrack(swrKey, String(toRemove.id)), {
            optimisticData,
            revalidate: false,
          });
          enqueueSnackbar("Track deleted", { variant: "success" });
        }
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Failed to delete track", { variant: "error" });
      }
    },
    [data, swrKey, mutate, enqueueSnackbar],
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
          // Create
          await mutate(createTrack(swrKey, payload), {
            optimisticData: [newRow as Track, ...(data || [])],
            revalidate: false,
            populateCache: (created, current) => {
              return [created, ...current!];
            },
          });
          enqueueSnackbar("Track created", { variant: "success" });
        } else {
          // Update
          await mutate(updateTrack(swrKey, String(oldRow.id), payload), {
            optimisticData: (data || []).map((r) =>
              r.id === newRow.id ? (newRow as Track) : r,
            ),
            revalidate: false,
            populateCache: (updated, current) =>
              current!.map((r) => (r.id === updated.id ? updated : r)),
          });
          enqueueSnackbar("Track updated", { variant: "success" });
        }
        return newRow;
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Failed to save track", { variant: "error" });
        throw e;
      }
    },
    [data, swrKey, mutate, enqueueSnackbar],
  );

  const handleAddNew = useCallback(() => {
    const id = `new-${Date.now()}`;
    const newRow = {
      id,
      name: "",
      latitude: 0,
      longitude: 0,
    };

    // Use mutate to add to the local cache without revalidating
    mutate([newRow, ...(data || [])], false);

    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  }, [data, mutate]);

  return {
    rows: data,
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
