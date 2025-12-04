"use client";

import { Box } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { Record } from "@/types/api";
import dayjs from "dayjs";

interface TemperatureChartProps {
  records: Record[];
}

export default function TemperatureChart({ records }: TemperatureChartProps) {
  return (
    <Box sx={{ mb: 2 }}>
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
            data: records.map((record) => record.intakeAirTemperature),
            label: "Intake Air Temperature (°F)",
            showMark: false,
          },
          {
            data: records.map((record) => record.coolantTemperature),
            label: "Coolant Temperature (°F)",
            showMark: false,
          },
        ]}
        height={400}
        grid={{ vertical: true, horizontal: true }}
      />
    </Box>
  );
}
