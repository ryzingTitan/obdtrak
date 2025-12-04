"use client";

import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { Record } from "@/types/api";
import dayjs from "dayjs";
import { useMemo } from "react";

interface BoostChartProps {
  records: Record[];
}

interface HistogramData {
  bins: string[];
  boostCounts: number[];
  manifoldCounts: number[];
}

function createHistogram(records: Record[]): HistogramData {
  // Extract pressure values
  const boostPressures = records
    .map((r) => r.boostPressure)
    .filter((p): p is number => p !== null && p !== undefined);
  const manifoldPressures = records
    .map((r) => r.manifoldPressure)
    .filter((p): p is number => p !== null && p !== undefined);

  if (boostPressures.length === 0 && manifoldPressures.length === 0) {
    return { bins: [], boostCounts: [], manifoldCounts: [] };
  }

  // Find min and max across both datasets
  const allPressures = [...boostPressures, ...manifoldPressures];
  const minPressure = Math.floor(Math.min(...allPressures));
  const maxPressure = Math.ceil(Math.max(...allPressures));

  // Create bins (1 PSI intervals)
  const binSize = 1;
  const numBins = Math.ceil((maxPressure - minPressure) / binSize);
  const bins: string[] = [];
  const boostCounts: number[] = [];
  const manifoldCounts: number[] = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = minPressure + i * binSize;
    const binEnd = binStart + binSize;
    bins.push(`${binStart}-${binEnd}`);

    // Count values in this bin
    const boostCount = boostPressures.filter(
      (p) => p >= binStart && p < binEnd,
    ).length;
    const manifoldCount = manifoldPressures.filter(
      (p) => p >= binStart && p < binEnd,
    ).length;

    boostCounts.push(boostCount);
    manifoldCounts.push(manifoldCount);
  }

  return { bins, boostCounts, manifoldCounts };
}

export default function BoostChart({ records }: BoostChartProps) {
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
            data: records.map((record) => record.boostPressure),
            label: "Boost Pressure (PSI)",
            showMark: false,
          },
          {
            data: records.map((record) => record.manifoldPressure),
            label: "Manifold Pressure (PSI)",
            showMark: false,
          },
        ]}
        height={400}
        grid={{ vertical: true, horizontal: true }}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }} align="center">
          Pressure Distribution
        </Typography>
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: histogramData.bins,
              label: "Pressure Range (PSI)",
            },
          ]}
          series={[
            {
              data: histogramData.boostCounts,
              label: "Boost Pressure",
            },
            {
              data: histogramData.manifoldCounts,
              label: "Manifold Pressure",
            },
          ]}
          height={400}
          grid={{ horizontal: true }}
        />
      </Box>
    </Box>
  );
}
