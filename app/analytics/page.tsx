"use client";

import { Autocomplete, TextField, Box, Tabs, Tab } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";
import { useSessions } from "@/hooks/useSessions";
import { useRecords } from "@/hooks/useRecords";
import { Session } from "@/types/api";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

export default function Analytics() {
  const { sessions, isLoading: sessionsLoading } = useSessions();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const { records, isLoading: recordsLoading } = useRecords(
    selectedSession?.id || null,
  );

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    });
  }, [sessions]);

  const getSessionLabel = (session: Session) => {
    const startTime = dayjs(session.startTime).format("MM-DD-YYYY h:mm A");
    const endTime = dayjs(session.endTime).format("MM-DD-YYYY h:mm A");
    return `${session.trackName}: ${startTime} - ${endTime}`;
  };

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
    <Box sx={{ padding: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Autocomplete
          options={sortedSessions}
          getOptionLabel={getSessionLabel}
          value={selectedSession}
          onChange={(_event, newValue) => setSelectedSession(newValue)}
          loading={sessionsLoading}
          renderInput={(params) => (
            <TextField {...params} label="Select Session" variant="outlined" />
          )}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </Box>
      {selectedSession && (
        <>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Tabs
              value={currentTab}
              onChange={(_event, newValue) => setCurrentTab(newValue)}
            >
              <Tab label="Summary" />
              <Tab label="Temperature" />
              <Tab label="Boost" />
            </Tabs>
          </Box>
          {currentTab === 0 && (
            <DataGrid
              rows={records}
              columns={columns}
              loading={recordsLoading}
              getRowId={(row) =>
                `${row.sessionId}-${row.timestamp}-${row.latitude}-${row.longitude}`
              }
              sx={{ mt: 2, mb: 8, mr: 2, ml: 2 }}
            />
          )}
          {currentTab === 1 && (
            <Box sx={{ mt: 2, mb: 8, mr: 2, ml: 2, height: 400 }}>
              <LineChart
                xAxis={[
                  {
                    data: records.map((record) =>
                      new Date(record.timestamp).getTime(),
                    ),
                    scaleType: "time",
                    valueFormatter: (value) => dayjs(value).format("h:mm:ss A"),
                  },
                ]}
                series={[
                  {
                    data: records.map((record) => record.intakeAirTemperature),
                    label: "Intake Air Temperature (°F)",
                    showMark: false,
                  },
                  {
                    data: records.map((record) => record.coolantTemperature),
                    label: "Coolant Temperature (°F)",
                    showMark: false,
                  },
                ]}
                height={400}
                margin={{ left: 70, right: 20, top: 50, bottom: 70 }}
                grid={{ vertical: true, horizontal: true }}
              />
            </Box>
          )}
          {currentTab === 2 && (
            <Box sx={{ mt: 2, mb: 8, mr: 2, ml: 2, height: 400 }}>
              <LineChart
                xAxis={[
                  {
                    data: records.map((record) =>
                      new Date(record.timestamp).getTime(),
                    ),
                    scaleType: "time",
                    valueFormatter: (value) => dayjs(value).format("h:mm:ss A"),
                  },
                ]}
                series={[
                  {
                    data: records.map((record) => record.boostPressure),
                    label: "Boost Pressure (PSI)",
                    showMark: false,
                  },
                ]}
                height={400}
                margin={{ left: 70, right: 20, top: 50, bottom: 70 }}
                grid={{ vertical: true, horizontal: true }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
