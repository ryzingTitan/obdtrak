"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useCars } from "@/hooks/useCars";

export default function CarsDataGrid() {
  const { cars, isLoading } = useCars();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "year",
        headerName: "Year",
        headerAlign: "center",
        align: "center",
        flex: 1,
        type: "number",
      },
      {
        field: "make",
        headerName: "Make",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "model",
        headerName: "Model",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
    ],
    [],
  );

  return (
    <DataGrid
      rows={cars}
      columns={columns}
      loading={isLoading}
      sx={{ m: 2 }}
      autoHeight
    />
  );
}
