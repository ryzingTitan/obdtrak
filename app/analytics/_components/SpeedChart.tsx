"use client";

import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { Record } from "@/types/api";
import dayjs from "dayjs";
import { useMemo } from "react";

interface SpeedChartProps {
  records: Record[];
}

interface HistogramData {
  bins: string[];
  counts: number[];
}

function createHistogram(records: Record[]): HistogramData {
  // Extract speed values
  const speeds = records
    .map((r) => r.speed)
    .filter((s): s is number => s !== null && s !== undefined);

  if (speeds.length === 0) {
    return { bins: [], counts: [] };
  }

  // Find min and max speed
  const minSpeed = Math.floor(Math.min(...speeds) / 5) * 5;
  const maxSpeed = Math.ceil(Math.max(...speeds) / 5) * 5;

  // Create bins (5 MPH intervals)
  const binSize = 5;
  const numBins = Math.ceil((maxSpeed - minSpeed) / binSize);
  const bins: string[] = [];
  const counts: number[] = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = minSpeed + i * binSize;
    const binEnd = binStart + binSize;
    bins.push(`${binStart}-${binEnd}`);

    // Count values in this bin
    const count = speeds.filter((s) => s >= binStart && s < binEnd).length;
    counts.push(count);
  }

  return { bins, counts };
}

export default function SpeedChart({ records }: SpeedChartProps) {
  const histogramData = useMemo(() => createHistogram(records), [records]);

  return (
    <Box sx={{ mb: 4 }}>
      <LineChart
        xAxis={[
          {
            data: records.map((record) => new Date(record.timestamp).getTime()),
            scaleType: "time",
            valueFormatter: (value) => dayjs(value).format("h:mm:ss A"),
          },
        ]}
        series={[
          {
            data: records.map((record) => record.speed ?? null),
            label: "Speed (MPH)",
            showMark: false,
          },
        ]}
        height={400}
        grid={{ vertical: true, horizontal: true }}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }} align="center">
          Speed Distribution
        </Typography>
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: histogramData.bins,
              label: "Speed Range (MPH)",
            },
          ]}
          series={[
            {
              data: histogramData.counts,
              label: "Speed",
            },
          ]}
          height={400}
          grid={{ horizontal: true }}
        />
      </Box>
    </Box>
  );
}
