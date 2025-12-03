import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    css: true,
    setupFiles: ["./vitest.setup.ts"],
    server: {
      deps: {
        inline: ["@mui/x-charts", "@mui/x-data-grid"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      include: [
        "app/**/*.{ts,tsx}",
        "components/**/*.{ts,tsx}",
        "hooks/**/*.{ts,tsx}",
        "lib/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/node_modules/**",
        "**/.next/**",
        "**/coverage/**",
        "middleware.ts", // Auth middleware is hard to test in isolation
        "**/page.tsx", // Next.js page components are container components
        "**/layout.tsx", // Next.js layout components are container components
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 80,
        statements: 90,
      },
    },
  },
});
