import { Box, Paper, Typography, Stack, Chip } from "@mui/material";
import { getRpmColor } from "./telemetryUtils";

// Circular RPM gauge component
interface RpmGaugeProps {
  rpm: number;
  redline?: number;
}

export function RpmGauge({ rpm, redline = 7000 }: RpmGaugeProps) {
  const percentage = (rpm / redline) * 100;
  const color = getRpmColor(rpm, redline);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        height: "100%",
        background: "linear-gradient(145deg, #1e1e1e 0%, #2d2d2d 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 1.2,
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          Engine RPM
        </Typography>

        {/* Circular RPM indicator */}
        <Box
          sx={{
            position: "relative",
            width: 140,
            height: 140,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Background circle */}
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "8px solid rgba(255, 255, 255, 0.1)",
            }}
          />

          {/* Progress arc */}
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "8px solid transparent",
              borderTopColor: color,
              borderRightColor: percentage > 25 ? color : "transparent",
              borderBottomColor: percentage > 50 ? color : "transparent",
              borderLeftColor: percentage > 75 ? color : "transparent",
              transform: `rotate(${-90 + percentage * 3.6 * 0.75}deg)`,
              transition: "all 0.3s ease",
            }}
          />

          {/* Center value */}
          <Stack alignItems="center" spacing={0}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: color,
                lineHeight: 1,
              }}
            >
              {rpm}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontFamily: "monospace" }}
            >
              RPM
            </Typography>
          </Stack>
        </Box>

        {/* Redline indicator */}
        <Chip
          label={`Redline: ${redline}`}
          size="small"
          sx={{
            backgroundColor: "rgba(244, 67, 54, 0.2)",
            color: "#f44336",
            fontFamily: "monospace",
            fontSize: "0.7rem",
          }}
        />
      </Stack>
    </Paper>
  );
}
