"use client";

import { Box } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { Record } from "@/types/api";
import dayjs from "dayjs";

interface BoostChartProps {
  records: Record[];
}

export default function BoostChart({ records }: BoostChartProps) {
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
    </Box>
  );
}
