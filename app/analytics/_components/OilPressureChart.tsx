"use client";

import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { Record } from "@/types/api";
import dayjs from "dayjs";
import { useMemo } from "react";

interface OilPressureChartProps {
  records: Record[];
}

interface HistogramData {
  bins: string[];
  counts: number[];
}

function createHistogram(records: Record[]): HistogramData {
  // Extract oil pressure values
  const oilPressures = records
    .map((r) => r.oilPressure)
    .filter((p): p is number => p !== null && p !== undefined);

  if (oilPressures.length === 0) {
    return { bins: [], counts: [] };
  }

  // Find min and max pressure
  const minPressure = Math.floor(Math.min(...oilPressures) / 5) * 5;
  const maxPressure = Math.ceil(Math.max(...oilPressures) / 5) * 5;

  // Create bins (5 PSI intervals)
  const binSize = 5;
  const numBins = Math.ceil((maxPressure - minPressure) / binSize);
  const bins: string[] = [];
  const counts: number[] = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = minPressure + i * binSize;
    const binEnd = binStart + binSize;
    bins.push(`${binStart}-${binEnd}`);

    // Count values in this bin
    const count = oilPressures.filter(
      (p) => p >= binStart && p < binEnd,
    ).length;
    counts.push(count);
  }

  return { bins, counts };
}

export default function OilPressureChart({ records }: OilPressureChartProps) {
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
            data: records.map((record) => record.oilPressure),
            label: "Oil Pressure (PSI)",
            showMark: false,
          },
        ]}
        height={400}
        grid={{ vertical: true, horizontal: true }}
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }} align="center">
          Oil Pressure Distribution
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
              data: histogramData.counts,
              label: "Oil Pressure",
            },
          ]}
          height={400}
          grid={{ horizontal: true }}
        />
      </Box>
    </Box>
  );
}
