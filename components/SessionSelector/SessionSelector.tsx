"use client";

import { Autocomplete, TextField, Box } from "@mui/material";
import { Session } from "@/types/api";
import dayjs from "dayjs";

interface SessionSelectorProps {
  sessions: Session[];
  selectedSession: Session | null;
  onSessionChange: (session: Session | null) => void;
  loading?: boolean;
}

export default function SessionSelector({
  sessions,
  selectedSession,
  onSessionChange,
  loading = false,
}: SessionSelectorProps) {
  const getSessionLabel = (session: Session) => {
    const startTime = dayjs(session.startTime).format("M/D/YYYY h:mm A");
    return `${session.trackName}: ${startTime} (${session.carYear} ${session.carMake} ${session.carModel})`;
  };

  return (
    <Box sx={{ mb: 2, width: "50%", mx: "auto" }}>
      <Autocomplete
        options={sessions}
        getOptionLabel={getSessionLabel}
        value={selectedSession}
        onChange={(_event, newValue) => onSessionChange(newValue)}
        loading={loading}
        renderInput={(params) => (
          <TextField {...params} label="Session" variant="outlined" />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </Box>
  );
}
