"use client";

import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from "@mui/x-data-grid";
import { useMemo, useState, useCallback } from "react";
import { useSessions } from "@/hooks/useSessions";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { Session } from "@/types/api";
import EditSessionModal from "./EditSessionModal";

export default function SessionsDataGrid() {
  const { sessions, isLoading } = useSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const handleEditClick = useCallback((session: Session) => {
    setSelectedSession(session);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedSession(null);
  }, []);

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
        valueGetter: (_value, row) => {
          const year = row.carYear || "";
          const make = row.carMake || "";
          const model = row.carModel || "";
          return `${year} ${make} ${model}`.trim();
        },
      },
      {
        field: "actions",
        type: "actions",
        headerName: "Actions",
        headerAlign: "center",
        flex: 0.5,
        getActions: (params: GridRowParams<Session>) => [
          <GridActionsCellItem
            key="edit"
            icon={<UploadFileIcon />}
            label="Edit"
            onClick={() => handleEditClick(params.row)}
          />,
        ],
      },
    ],
    [handleEditClick],
  );

  return (
    <>
      <DataGrid
        rows={sessions}
        columns={columns}
        loading={isLoading}
        sx={{ mt: 2, mb: 8, mr: 2, ml: 2 }}
      />
      {selectedSession && (
        <EditSessionModal
          session={selectedSession}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
