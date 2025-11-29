"use client";

import { SWRConfig } from "swr";
import { SnackbarProvider } from "notistack";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        refreshInterval: 3000,
        revalidateOnFocus: true,
      }}
    >
      <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>
    </SWRConfig>
  );
}
