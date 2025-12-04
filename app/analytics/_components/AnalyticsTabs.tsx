"use client";

import { Box, Tabs, Tab } from "@mui/material";

interface AnalyticsTabsProps {
  currentTab: number;
  onTabChange: (tabIndex: number) => void;
}

export default function AnalyticsTabs({
  currentTab,
  onTabChange,
}: AnalyticsTabsProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
      <Tabs
        value={currentTab}
        onChange={(_event, newValue) => onTabChange(newValue)}
      >
        <Tab label="Summary" />
        <Tab label="Temperature" />
        <Tab label="Boost" />
        <Tab label="Throttle" />
        <Tab label="Speed" />
        <Tab label="Oil Pressure" />
      </Tabs>
    </Box>
  );
}
