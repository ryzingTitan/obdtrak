"use client";

import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Image from "next/image";
import LogoutIcon from "@mui/icons-material/Logout";
import { useUser } from "@auth0/nextjs-auth0";
import { redirect } from "next/navigation";
import { logoutUrl } from "@/lib/auth0";

export default function Header() {
  const { user } = useUser();

  return (
    <AppBar position="static">
      <Toolbar>
        <Image src="/logo.png" alt="App Logo" width={50} height={50} />
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexGrow: 1 }}
          justifyContent="flex-end"
        >
          <Tooltip title={user?.name}>
            <Avatar src={user?.image ?? undefined} />
          </Tooltip>
          <Tooltip title="Logout">
            <IconButton
              onClick={async () => {
                redirect(logoutUrl);
              }}
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
