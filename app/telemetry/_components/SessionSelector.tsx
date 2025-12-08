import { Box, Autocomplete, TextField } from "@mui/material";
import { Session } from "@/types/api";

interface SessionSelectorProps {
  sessions: Session[];
  selectedSession: Session | null;
  onSessionChange: (
    event: React.SyntheticEvent,
    newValue: Session | null,
  ) => void;
  loading?: boolean;
}

export function SessionSelector({
  sessions,
  selectedSession,
  onSessionChange,
  loading = false,
}: SessionSelectorProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Autocomplete
        options={sessions}
        value={selectedSession}
        onChange={onSessionChange}
        getOptionLabel={(option) =>
          `${option.trackName} - ${new Date(option.startTime).toLocaleDateString()} ${new Date(option.startTime).toLocaleTimeString()} (${option.carYear} ${option.carMake} ${option.carModel})`
        }
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Select Session"
            placeholder="Choose a track session to view telemetry"
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
              },
            }}
          />
        )}
        sx={{ maxWidth: 800 }}
      />
    </Box>
  );
}
