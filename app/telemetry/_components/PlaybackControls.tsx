import {
  Box,
  IconButton,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import { Record } from "@/types/api";

const PLAYBACK_SPEEDS = [1, 2, 4] as const;
type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

interface PlaybackControlsProps {
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  currentRecordIndex: number;
  currentRecord: Record | null;
  totalRecords: number;
  progressPercentage: number;
  recordsLoading: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (
    event: React.MouseEvent<HTMLElement>,
    newSpeed: PlaybackSpeed | null,
  ) => void;
}

export function PlaybackControls({
  isPlaying,
  playbackSpeed,
  currentRecordIndex,
  currentRecord,
  totalRecords,
  progressPercentage,
  recordsLoading,
  onPlayPause,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 2,
        maxWidth: 800,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <IconButton
          onClick={onPlayPause}
          disabled={recordsLoading}
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(255, 255, 255, 0.12)",
            },
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <IconButton
          onClick={onReset}
          disabled={recordsLoading}
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          <ReplayIcon />
        </IconButton>
        <ToggleButtonGroup
          value={playbackSpeed}
          exclusive
          onChange={onSpeedChange}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              color: "rgba(255, 255, 255, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.2)",
              px: 2,
              "&.Mui-selected": {
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                },
              },
            },
          }}
        >
          {PLAYBACK_SPEEDS.map((speed) => (
            <ToggleButton key={speed} value={speed}>
              {speed}x
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Typography variant="body2" sx={{ ml: "auto" }}>
          Record {currentRecordIndex + 1} of {totalRecords}
        </Typography>
        {currentRecord && (
          <Typography variant="body2" color="text.secondary">
            {new Date(currentRecord.timestamp).toLocaleTimeString()}
          </Typography>
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={progressPercentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            background: "linear-gradient(45deg, #1976d2 30%, #4caf50 90%)",
          },
        }}
      />
    </Box>
  );
}

export type { PlaybackSpeed };
