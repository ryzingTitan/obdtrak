"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Record } from "@/types/api";
import dayjs from "dayjs";
import { useMemo } from "react";

interface SummaryTabProps {
  records: Record[];
  loading?: boolean;
}

export default function SummaryTab({
  records,
  loading = false,
}: SummaryTabProps) {
  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "timestamp",
        headerName: "Timestamp",
        headerAlign: "center",
        align: "center",
        flex: 1,
        valueFormatter: (value?: string) =>
          value ? dayjs(value).format("MM-DD-YYYY h:mm:ss A") : "",
      },
      {
        field: "intakeAirTemperature",
        headerName: "Intake Air Temp",
        type: "number",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "boostPressure",
        headerName: "Boost Pressure (PSI)",
        type: "number",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "coolantTemperature",
        headerName: "Coolant Temp",
        type: "number",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "engineRpm",
        headerName: "Engine RPM",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "speed",
        headerName: "Speed (MPH)",
        type: "number",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "throttlePosition",
        headerName: "Throttle Position",
        type: "number",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "airFuelRatio",
        headerName: "AFR",
        type: "number",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "oilPressure",
        headerName: "Oil Pressure (PSI)",
        type: "number",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "manifoldPressure",
        headerName: "Manifold Pressure (PSI)",
        type: "number",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
      {
        field: "massAirFlow",
        headerName: "Mass Air Flow (G/S)",
        type: "number",
        headerAlign: "center",
        align: "center",
        flex: 1,
      },
    ],
    [],
  );

  return (
    <DataGrid
      rows={records}
      columns={columns}
      loading={loading}
      getRowId={(row) =>
        `${row.sessionId}-${row.timestamp}-${row.latitude}-${row.longitude}`
      }
      sx={{ mt: 2, mb: 8, mr: 2, ml: 2 }}
    />
  );
}
