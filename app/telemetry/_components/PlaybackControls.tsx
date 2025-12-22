import {
  Box,
  IconButton,
  Slider,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import ReplayIcon from "@mui/icons-material/Replay";
import dayjs from "dayjs";
import { Record } from "@/types/api";

const PLAYBACK_SPEEDS = [1, 2, 4] as const;
type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

interface PlaybackControlsProps {
  isPlaying: boolean;
  playbackSpeed: PlaybackSpeed;
  currentRecord: Record | null;
  currentRecordIndex: number;
  totalRecords: number;
  recordsLoading: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  onSpeedChange: (
    event: React.MouseEvent<HTMLElement>,
    newSpeed: PlaybackSpeed | null,
  ) => void;
  onSeek: (index: number) => void;
}

export function PlaybackControls({
  isPlaying,
  playbackSpeed,
  currentRecord,
  currentRecordIndex,
  totalRecords,
  recordsLoading,
  onPlayPause,
  onReset,
  onSpeedChange,
  onSeek,
}: PlaybackControlsProps) {
  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        borderRadius: 2,
        maxWidth: 800,
        mx: "auto",
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
        {currentRecord && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: "auto" }}
          >
            {dayjs(currentRecord.timestamp).format("h:mm:ss A")}
          </Typography>
        )}
      </Box>
      <Slider
        value={currentRecordIndex}
        min={0}
        max={Math.max(0, totalRecords - 1)}
        step={1}
        disabled={recordsLoading || totalRecords === 0}
        onChange={(event: Event, value: number | number[]) => {
          // Update position during drag for live preview
          if (typeof value === "number") {
            onSeek(value);
          }
        }}
        aria-label="Playback position"
        sx={{
          height: 8,
          padding: "8px 0",
          "& .MuiSlider-thumb": {
            height: 16,
            width: 16,
            backgroundColor: "#fff",
            border: "2px solid currentColor",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover, &.Mui-focusVisible": {
              boxShadow: "0px 0px 0px 8px rgba(25, 118, 210, 0.16)",
            },
            "&.Mui-active": {
              height: 20,
              width: 20,
            },
          },
          "& .MuiSlider-track": {
            height: 8,
            border: "none",
            borderRadius: 4,
            background: "linear-gradient(45deg, #1976d2 30%, #4caf50 90%)",
          },
          "& .MuiSlider-rail": {
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            opacity: 1,
          },
        }}
      />
    </Box>
  );
}

export type { PlaybackSpeed };
