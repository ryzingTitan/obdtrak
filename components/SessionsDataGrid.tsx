"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useSessions } from "@/hooks/useSessions";

export default function SessionsDataGrid() {
  const { sessions, isLoading } = useSessions();

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "id",
        headerName: "Session ID",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "startTime",
        headerName: "Start Time",
        headerAlign: "center",
        align: "center",
        flex: 1,
        valueFormatter: (value?: string) => {
          if (!value) return "";
          return new Date(value).toLocaleString();
        },
      },
      {
        field: "endTime",
        headerName: "End Time",
        headerAlign: "center",
        align: "center",
        flex: 1,
        valueFormatter: (value?: string) => {
          if (!value) return "";
          return new Date(value).toLocaleString();
        },
      },
      {
        field: "trackName",
        headerName: "Track Name",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "car",
        headerName: "Car",
        headerAlign: "center",
        align: "center",
        flex: 1,
        valueGetter: (value, row) => {
          const year = row.carYear || "";
          const make = row.carMake || "";
          const model = row.carModel || "";
          return `${year} ${make} ${model}`.trim();
        },
      },
    ],
    [],
  );

  return (
    <DataGrid
      rows={sessions}
      columns={columns}
      loading={isLoading}
      sx={{ mt: 2, mb: 8, mr: 2, ml: 2 }}
    />
  );
}
