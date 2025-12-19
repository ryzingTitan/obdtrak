import { Paper, Typography, Stack, Chip, Box } from "@mui/material";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { getRpmColor } from "./telemetryUtils";

// RPM gauge component using MUI X Charts Gauge
interface RpmGaugeProps {
  rpm: number;
}

export function RpmGauge({ rpm }: RpmGaugeProps) {
  const REDLINE = 6000;
  const color = getRpmColor(rpm, REDLINE);

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
      <Stack spacing={1} alignItems="center">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
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

          <Chip
            label={`Redline: ${REDLINE}`}
            size="small"
            sx={{
              backgroundColor: "rgba(244, 67, 54, 0.2)",
              color: "#f44336",
              fontFamily: "monospace",
              fontSize: "0.7rem",
            }}
          />
        </Box>

        <Gauge
          skipAnimation
          width={240}
          height={180}
          value={rpm}
          valueMin={0}
          valueMax={REDLINE + 1000}
          startAngle={-90}
          endAngle={90}
          innerRadius="65%"
          outerRadius="95%"
          aria-label="Engine RPM gauge"
          text={({ value }) => String(value)}
          sx={{
            [`& .${gaugeClasses.valueArc}`]: {
              fill: color,
            },
            [`& .${gaugeClasses.referenceArc}`]: {
              fill: "rgba(255, 255, 255, 0.1)",
            },
            [`& .${gaugeClasses.valueText}`]: {
              fontSize: 40,
              fontFamily: "monospace",
              fontWeight: 700,
              fill: color,
            },
          }}
        />

        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontFamily: "monospace", mt: -1 }}
        >
          RPM
        </Typography>
      </Stack>
    </Paper>
  );
}
