"use client";

import { Box } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { Record } from "@/types/api";
import dayjs from "dayjs";

interface ThrottleChartProps {
  records: Record[];
}

export default function ThrottleChart({ records }: ThrottleChartProps) {
  return (
    <Box sx={{ mt: 2, mb: 2 }}>
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
            data: records.map((record) => record.throttlePosition),
            label: "Throttle Position (%)",
            showMark: false,
            yAxisId: "leftAxis",
          },
          {
            data: records.map((record) => record.engineRpm),
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
    </Box>
  );
}
