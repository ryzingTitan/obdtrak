"use client";

import { Box } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { Record } from "@/types/api";
import dayjs from "dayjs";

interface SpeedChartProps {
  records: Record[];
}

export default function SpeedChart({ records }: SpeedChartProps) {
  return (
    <Box sx={{ mt: 2, mb: 8, mr: 2, ml: 2, height: 400 }}>
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
            data: records.map((record) => record.speed),
            label: "Speed (MPH)",
            showMark: false,
          },
        ]}
        height={400}
        margin={{ left: 70, right: 70, top: 50, bottom: 70 }}
        grid={{ vertical: true, horizontal: true }}
      />
    </Box>
  );
}
