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
import Add from "@mui/icons-material/Add";
import Save from "@mui/icons-material/Save";
import Cancel from "@mui/icons-material/Cancel";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import { useCars } from "@/hooks/useCars";
import Tooltip from "@mui/material/Tooltip";

interface EditToolbarProps {
  onAddNew: () => void;
}

function EditToolbar({ onAddNew }: EditToolbarProps) {
  return (
    <Toolbar>
      <Tooltip title="Add car">
        <ToolbarButton onClick={onAddNew} size="small">
          <Add />
        </ToolbarButton>
      </Tooltip>
    </Toolbar>
  );
}

export default function CarsDataGrid() {
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
  } = useCars();

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
        field: "year",
        headerName: "Year",
        headerAlign: "center",
        align: "center",
        editable: true,
        flex: 1,
        type: "number",
        valueFormatter: (value?: number) => value?.toString(),
      },
      {
        field: "make",
        headerName: "Make",
        headerAlign: "center",
        align: "center",
        editable: true,
        flex: 1,
      },
      {
        field: "model",
        headerName: "Model",
        headerAlign: "center",
        align: "center",
        editable: true,
        flex: 1,
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
        toolbar: () => <EditToolbar onAddNew={handleAddNew} />,
      }}
      sx={{ mt: 2, mb: 8, mr: 2, ml: 2 }}
      showToolbar
    />
  );
}
