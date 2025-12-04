"use client";

import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { Record } from "@/types/api";
import dayjs from "dayjs";
import { useMemo } from "react";

interface TemperatureChartProps {
  records: Record[];
}

interface HistogramData {
  bins: string[];
  coolantCounts: number[];
  intakeCounts: number[];
}

function createHistogram(records: Record[]): HistogramData {
  // Extract temperature values
  const coolantTemps = records
    .map((r) => r.coolantTemperature)
    .filter((t): t is number => t !== null && t !== undefined);
  const intakeTemps = records
    .map((r) => r.intakeAirTemperature)
    .filter((t): t is number => t !== null && t !== undefined);

  if (coolantTemps.length === 0 && intakeTemps.length === 0) {
    return { bins: [], coolantCounts: [], intakeCounts: [] };
  }

  // Find min and max across both datasets
  const allTemps = [...coolantTemps, ...intakeTemps];
  const minTemp = Math.floor(Math.min(...allTemps));
  const maxTemp = Math.ceil(Math.max(...allTemps));

  // Create bins (5°F intervals)
  const binSize = 5;
  const numBins = Math.ceil((maxTemp - minTemp) / binSize);
  const bins: string[] = [];
  const coolantCounts: number[] = [];
  const intakeCounts: number[] = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = minTemp + i * binSize;
    const binEnd = binStart + binSize;
    bins.push(`${binStart}-${binEnd}`);

    // Count values in this bin
    const coolantCount = coolantTemps.filter(
      (t) => t >= binStart && t < binEnd,
    ).length;
    const intakeCount = intakeTemps.filter(
      (t) => t >= binStart && t < binEnd,
    ).length;

    coolantCounts.push(coolantCount);
    intakeCounts.push(intakeCount);
  }

  return { bins, coolantCounts, intakeCounts };
}

export default function TemperatureChart({ records }: TemperatureChartProps) {
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
            data: records.map((record) => record.intakeAirTemperature ?? null),
            label: "Intake Air Temperature (°F)",
            showMark: false,
          },
          {
            data: records.map((record) => record.coolantTemperature ?? null),
            label: "Coolant Temperature (°F)",
            showMark: false,
          },
        ]}
        height={400}
        grid={{ vertical: true, horizontal: true }}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }} align="center">
          Temperature Distribution
        </Typography>
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: histogramData.bins,
              label: "Temperature Range (°F)",
            },
          ]}
          series={[
            {
              data: histogramData.coolantCounts,
              label: "Coolant Temperature",
            },
            {
              data: histogramData.intakeCounts,
              label: "Intake Air Temperature",
            },
          ]}
          height={400}
          grid={{ horizontal: true }}
        />
      </Box>
    </Box>
  );
}
