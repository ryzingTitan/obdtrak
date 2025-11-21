import type { Metadata } from "next";
import CssBaseline from "@mui/material/CssBaseline";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import Header from "@/components/Header";
import theme from "@/theme";
import Footer from "@/components/Footer";
import { SWRConfig } from "swr";

export const metadata: Metadata = {
  title: "OBDTrak",
  description: "A track day telemetry app",
};

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <SWRConfig
              value={{
                refreshInterval: 3000,
                revalidateOnFocus: true,
              }}
            >
              <Header />
              {children}
              <Footer />
            </SWRConfig>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
