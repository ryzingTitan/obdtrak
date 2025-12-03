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
    const startTime = dayjs(session.startTime).format("MM-DD-YYYY h:mm A");
    const endTime = dayjs(session.endTime).format("MM-DD-YYYY h:mm A");
    return `${session.trackName}: ${startTime} - ${endTime}`;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Autocomplete
        options={sessions}
        getOptionLabel={getSessionLabel}
        value={selectedSession}
        onChange={(_event, newValue) => onSessionChange(newValue)}
        loading={loading}
        renderInput={(params) => (
          <TextField {...params} label="Select Session" variant="outlined" />
        )}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </Box>
  );
}
