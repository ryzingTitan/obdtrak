"use client";

import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModes,
  Toolbar,
  ToolbarButton,
} from "@mui/x-data-grid";
import { useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Add from "@mui/icons-material/Add";
import Save from "@mui/icons-material/Save";
import Cancel from "@mui/icons-material/Cancel";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Preview from "@mui/icons-material/Preview";
import { useTracks } from "@/hooks/useTracks";
import Tooltip from "@mui/material/Tooltip";
import Track from "@/types/api";

const TrackPreviewModal = dynamic(() => import("./TrackPreviewModal"), {
  ssr: false,
});

interface EditToolbarProps {
  onAddNew: () => void;
}

function EditToolbar({ onAddNew }: EditToolbarProps) {
  return (
    <Toolbar>
      <Tooltip title="Add track">
        <ToolbarButton onClick={onAddNew} size="small">
          <Add />
        </ToolbarButton>
      </Tooltip>
    </Toolbar>
  );
}

export default function TracksDataGrid() {
  const {
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
  } = useTracks();

  const [previewTrack, setPreviewTrack] = useState<Track | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handlePreviewClick = useCallback(
    (id: string) => () => {
      const track = rows?.find((row) => row.id === id);
      if (track) {
        setPreviewTrack(track);
        setPreviewOpen(true);
      }
    },
    [rows],
  );

  const handlePreviewClose = useCallback(() => {
    setPreviewOpen(false);
    setPreviewTrack(null);
  }, []);

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event,
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "name",
        headerName: "Track Name",
        headerAlign: "center",
        align: "center",
        editable: true,
        flex: 1,
      },
      {
        field: "latitude",
        headerName: "Track Latitude",
        type: "number",
        headerAlign: "center",
        align: "center",
        editable: true,
        flex: 1,
        valueFormatter: (value?: number) => value?.toString(),
      },
      {
        field: "longitude",
        headerName: "Track Longitude",
        headerAlign: "center",
        align: "center",
        editable: true,
        type: "number",
        flex: 1,
        valueFormatter: (value?: number) => value?.toString(),
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        flex: 1,
        getActions: ({ id }) => {
          const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
          if (isInEditMode) {
            return [
              <GridActionsCellItem
                key="save"
                icon={<Save />}
                label="Save"
                onClick={handleSaveClick(id)}
              />,
              <GridActionsCellItem
                key="cancel"
                icon={<Cancel />}
                label="Cancel"
                onClick={handleCancelClick(id)}
              />,
            ];
          }
          return [
            <GridActionsCellItem
              key="preview"
              icon={<Preview />}
              label="Preview"
              onClick={handlePreviewClick(id.toString())}
            />,
            <GridActionsCellItem
              key="edit"
              icon={<Edit />}
              label="Edit"
              onClick={handleEditClick(id)}
            />,
            <GridActionsCellItem
              key="delete"
              icon={<Delete />}
              label="Delete"
              onClick={handleDeleteClick(id)}
            />,
          ];
        },
      },
    ],
    [
      handleCancelClick,
      handleDeleteClick,
      handleEditClick,
      handlePreviewClick,
      handleSaveClick,
      rowModesModel,
    ],
  );

  return (
    <>
      <DataGrid
        rows={rows || []}
        columns={columns}
        loading={isLoading}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: () => <EditToolbar onAddNew={handleAddNew} />,
        }}
        sx={{ mt: 2, mb: 14, mr: 2, ml: 2 }}
        showToolbar
      />
      <TrackPreviewModal
        track={previewTrack}
        open={previewOpen}
        onClose={handlePreviewClose}
      />
    </>
  );
}
