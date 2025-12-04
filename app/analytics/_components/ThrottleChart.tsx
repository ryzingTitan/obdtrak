"use client";

import { Box, Typography } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { BarChart } from "@mui/x-charts/BarChart";
import { Record } from "@/types/api";
import dayjs from "dayjs";
import { useMemo } from "react";

interface ThrottleChartProps {
  records: Record[];
}

interface HistogramData {
  throttleBins: string[];
  throttleCounts: number[];
  rpmBins: string[];
  rpmCounts: number[];
}

function createHistogram(records: Record[]): HistogramData {
  // Extract throttle position values
  const throttlePositions = records
    .map((r) => r.throttlePosition)
    .filter((t): t is number => t !== null && t !== undefined);

  // Extract RPM values
  const rpmValues = records
    .map((r) => r.engineRpm)
    .filter((r): r is number => r !== null && r !== undefined);

  // Create throttle histogram (5% bins)
  const throttleBinSize = 5;
  const throttleBins: string[] = [];
  const throttleCounts: number[] = [];

  if (throttlePositions.length > 0) {
    const minThrottle = 0;
    const maxThrottle = 100;
    const numThrottleBins = Math.ceil(
      (maxThrottle - minThrottle) / throttleBinSize,
    );

    for (let i = 0; i < numThrottleBins; i++) {
      const binStart = minThrottle + i * throttleBinSize;
      const binEnd = binStart + throttleBinSize;
      throttleBins.push(`${binStart}-${binEnd}`);

      const count = throttlePositions.filter(
        (t) => t >= binStart && t < binEnd,
      ).length;
      throttleCounts.push(count);
    }
  }

  // Create RPM histogram (500 RPM bins)
  const rpmBinSize = 500;
  const rpmBins: string[] = [];
  const rpmCounts: number[] = [];

  if (rpmValues.length > 0) {
    const minRpm = Math.floor(Math.min(...rpmValues) / rpmBinSize) * rpmBinSize;
    const maxRpm = Math.ceil(Math.max(...rpmValues) / rpmBinSize) * rpmBinSize;
    const numRpmBins = Math.ceil((maxRpm - minRpm) / rpmBinSize);

    for (let i = 0; i < numRpmBins; i++) {
      const binStart = minRpm + i * rpmBinSize;
      const binEnd = binStart + rpmBinSize;
      rpmBins.push(`${binStart}-${binEnd}`);

      const count = rpmValues.filter((r) => r >= binStart && r < binEnd).length;
      rpmCounts.push(count);
    }
  }

  return { throttleBins, throttleCounts, rpmBins, rpmCounts };
}

export default function ThrottleChart({ records }: ThrottleChartProps) {
  const histogramData = useMemo(() => createHistogram(records), [records]);

  return (
    <Box sx={{ mt: 2, mb: 4 }}>
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
            data: records.map((record) => record.throttlePosition ?? null),
            label: "Throttle Position (%)",
            showMark: false,
            yAxisId: "leftAxis",
          },
          {
            data: records.map((record) => record.engineRpm ?? null),
            label: "Engine RPM",
            showMark: false,
            yAxisId: "rightAxis",
            valueFormatter: (value) => (value ?? 0).toString(),
          },
        ]}
        yAxis={[
          {
            id: "leftAxis",
          },
          {
            id: "rightAxis",
            position: "right",
            valueFormatter: (value: string) => value.toString(),
          },
        ]}
        height={400}
        grid={{ vertical: true, horizontal: true }}
      />

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }} align="center">
          Throttle Position Distribution
        </Typography>
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: histogramData.throttleBins,
              label: "Throttle Position (%)",
            },
          ]}
          series={[
            {
              data: histogramData.throttleCounts,
              label: "Throttle Position",
            },
          ]}
          height={400}
          grid={{ horizontal: true }}
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }} align="center">
          Engine RPM Distribution
        </Typography>
        <BarChart
          xAxis={[
            {
              scaleType: "band",
              data: histogramData.rpmBins,
              label: "Engine RPM",
            },
          ]}
          series={[
            {
              data: histogramData.rpmCounts,
              label: "Engine RPM",
            },
          ]}
          height={400}
          grid={{ horizontal: true }}
        />
      </Box>
    </Box>
  );
}
