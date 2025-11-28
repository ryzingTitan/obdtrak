"use client";

import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModes,
} from "@mui/x-data-grid";
import { useMemo } from "react";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Add from "@mui/icons-material/Add";
import Save from "@mui/icons-material/Save";
import Cancel from "@mui/icons-material/Cancel";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import { useTracks } from "@/hooks/useTracks";

interface EditToolbarProps {
  onAddNew: () => void;
}

function EditToolbar({ onAddNew }: EditToolbarProps) {
  return (
    <Toolbar>
      <Tooltip title="Add track">
        <IconButton onClick={onAddNew} size="small">
          <Add />
        </IconButton>
      </Tooltip>
    </Toolbar>
  );
}

export default function Tracks() {
  const {
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
  } = useTracks();

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
      },
      {
        field: "latitude",
        headerName: "Track Latitude",
        type: "number",
        headerAlign: "center",
        align: "center",
        editable: true,
        valueFormatter: (value?: number) => value?.toString(),
      },
      {
        field: "longitude",
        headerName: "Track Longitude",
        headerAlign: "center",
        align: "center",
        editable: true,
        type: "number",
        valueFormatter: (value?: number) => value?.toString(),
      },
      // {
      //   field: "trackPreview",
      //   headerName: "Track Preview",
      //   headerAlign: "center",
      //   align: "center",
      //   renderCell: (params) => (
      //     <TrackPreview
      //       longitude={params.row.longitude}
      //       latitude={params.row.latitude}
      //       iconSize={"medium"}
      //     />
      //   ),
      // },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
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
                color="inherit"
              />,
            ];
          }
          return [
            <GridActionsCellItem
              key="edit"
              icon={<Edit />}
              label="Edit"
              onClick={handleEditClick(id)}
              color="inherit"
            />,
            <GridActionsCellItem
              key="delete"
              icon={<Delete />}
              label="Delete"
              onClick={handleDeleteClick(id)}
              color="inherit"
            />,
          ];
        },
      },
    ],
    [
      handleCancelClick,
      handleDeleteClick,
      handleEditClick,
      handleSaveClick,
      rowModesModel,
    ],
  );

  return (
    <DataGrid
      rows={data || []}
      columns={columns}
      loading={isLoading}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      slots={{ toolbar: EditToolbar }}
      slotProps={{
        toolbar: {
          onAddNew: handleAddNew,
        },
      }}
      showToolbar
      autosizeOnMount
      autosizeOptions={{
        columns: ["name", "latitude", "longitude", "actions"],
        includeHeaders: true,
        includeOutliers: true,
      }}
      sx={{ m: 2 }}
    />
  );
}
