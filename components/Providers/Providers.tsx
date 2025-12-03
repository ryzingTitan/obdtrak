"use client";

import { SWRConfig } from "swr";
import { SnackbarProvider } from "notistack";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
      }}
    >
      <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>
    </SWRConfig>
  );
}
