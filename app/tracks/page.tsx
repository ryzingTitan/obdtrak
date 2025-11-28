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
import { useMemo } from "react";
import Tooltip from "@mui/material/Tooltip";
import Add from "@mui/icons-material/Add";
import Save from "@mui/icons-material/Save";
import Cancel from "@mui/icons-material/Cancel";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import { useTracks } from "@/hooks/useTracks";

export default function Tracks() {
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

  function EditToolbar() {
    return (
      <Toolbar>
        <Tooltip title="Add track">
          <ToolbarButton onClick={handleAddNew} size="small">
            <Add />
          </ToolbarButton>
        </Tooltip>
      </Toolbar>
    );
  }

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
      rows={rows || []}
      columns={columns}
      loading={isLoading}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      slots={{
        toolbar: EditToolbar,
      }}
      showToolbar
      autosizeOnMount
      sx={{ m: 2 }}
    />
  );
}
