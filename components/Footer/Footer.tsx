"use client";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import EditRoad from "@mui/icons-material/EditRoad";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import UploadFile from "@mui/icons-material/UploadFile";
import Analytics from "@mui/icons-material/Analytics";
import Insights from "@mui/icons-material/Insights";
import { useMemo } from "react";
import Paper from "@mui/material/Paper";
import { usePathname, useRouter } from "next/navigation";

const ROUTE_TO_INDEX: Record<string, number> = {
  "/analytics": 0,
  "/telemetry": 1,
  "/tracks": 2,
  "/cars": 3,
  "/sessions": 4,
};

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  // Derive navigation value from current pathname
  const value = useMemo(() => ROUTE_TO_INDEX[pathname] ?? 0, [pathname]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 0:
        router.push("/analytics");
        break;
      case 1:
        router.push("/telemetry");
        break;
      case 2:
        router.push("/tracks");
        break;
      case 3:
        router.push("/cars");
        break;
      case 4:
        router.push("/sessions");
        break;
    }
  };

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1100 }}
      elevation={3}
    >
      <BottomNavigation showLabels value={value} onChange={handleChange}>
        <BottomNavigationAction label="Analytics" icon={<Analytics />} />
        <BottomNavigationAction label="Telemetry" icon={<Insights />} />
        <BottomNavigationAction label="Tracks" icon={<EditRoad />} />
        <BottomNavigationAction label="Cars" icon={<DirectionsCar />} />
        <BottomNavigationAction label="Sessions" icon={<UploadFile />} />
      </BottomNavigation>
    </Paper>
  );
}
