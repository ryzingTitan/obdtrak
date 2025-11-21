"use client";

import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import EditRoad from "@mui/icons-material/EditRoad";
import { useState } from "react";
import Paper from "@mui/material/Paper";
import { usePathname, useRouter } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const [value, setValue] = useState(0);
  const router = useRouter();

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_event, newValue) => {
          setValue(newValue);

          switch (newValue) {
            case 0:
              router.push("/tracks");
              return;
          }
        }}
      >
        <BottomNavigationAction label="Tracks" icon={<EditRoad />} />
      </BottomNavigation>
    </Paper>
  );
}
