"use client";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import EditRoad from "@mui/icons-material/EditRoad";
import DirectionsCar from "@mui/icons-material/DirectionsCar";
import UploadFile from "@mui/icons-material/UploadFile";
import Analytics from "@mui/icons-material/Analytics";
import { useEffect, useState } from "react";
import Paper from "@mui/material/Paper";
import { usePathname, useRouter } from "next/navigation";

const ROUTE_TO_INDEX: Record<string, number> = {
  "/analytics": 0,
  "/tracks": 1,
  "/cars": 2,
  "/sessions": 3,
};

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(() => ROUTE_TO_INDEX[pathname] ?? 0);

  // Sync navigation value with current pathname
  useEffect(() => {
    const index = ROUTE_TO_INDEX[pathname];
    if (index !== undefined) {
      setValue(index);
    }
  }, [pathname]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);

    switch (newValue) {
      case 0:
        router.push("/analytics");
        break;
      case 1:
        router.push("/tracks");
        break;
      case 2:
        router.push("/cars");
        break;
      case 3:
        router.push("/sessions");
        break;
    }
  };

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation showLabels value={value} onChange={handleChange}>
        <BottomNavigationAction label="Analytics" icon={<Analytics />} />
        <BottomNavigationAction label="Tracks" icon={<EditRoad />} />
        <BottomNavigationAction label="Cars" icon={<DirectionsCar />} />
        <BottomNavigationAction label="Sessions" icon={<UploadFile />} />
      </BottomNavigation>
    </Paper>
  );
}
