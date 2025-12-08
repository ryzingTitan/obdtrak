import { Box, Paper, Typography, LinearProgress, Stack } from "@mui/material";

// Gauge component for numeric metrics with linear indicator
interface GaugeProps {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  showBar?: boolean;
  color?: string;
  icon?: React.ReactNode;
}

export function Gauge({
  label,
  value,
  unit,
  min = 0,
  max = 100,
  showBar = false,
  color = "#1976d2",
  icon,
}: GaugeProps) {
  const percentage = ((value - min) / (max - min)) * 100;

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
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon && <Box sx={{ color: "text.secondary" }}>{icon}</Box>}
          <Typography
            variant="caption"
            sx={{
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "text.secondary",
              fontWeight: 500,
            }}
          >
            {label}
          </Typography>
        </Stack>

        <Typography
          variant="h3"
          sx={{
            fontFamily: "monospace",
            fontWeight: 700,
            color: color,
            lineHeight: 1,
          }}
        >
          {value.toFixed(value >= 100 ? 0 : 1)}
          <Typography
            component="span"
            variant="h6"
            sx={{
              ml: 1,
              color: "text.secondary",
              fontFamily: "monospace",
            }}
          >
            {unit}
          </Typography>
        </Typography>

        {showBar && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: color,
                  borderRadius: 4,
                },
              }}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              sx={{ mt: 0.5 }}
            >
              <Typography variant="caption" color="text.secondary">
                {min}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {max}
              </Typography>
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
