"use client";

import { Box, Tabs, Tab } from "@mui/material";

interface ViewTabsProps {
  currentView: number;
  onViewChange: (view: number) => void;
  hasVideo: boolean;
}

export default function ViewTabs({
  currentView,
  onViewChange,
  hasVideo,
}: ViewTabsProps) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
      <Tabs
        value={currentView}
        onChange={(_event, newValue) => onViewChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Track Map" />
        {/*{hasVideo && <Tab label="Video" />}*/}
        <Tab label="Video" />
      </Tabs>
    </Box>
  );
}
