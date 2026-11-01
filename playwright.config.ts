import { defineConfig } from "@playwright/test";

// Headed Chromium by default (set E2E_HEADLESS=1 for CI-style runs). The dev server runs on a
// self-signed certificate, hence ignoreHTTPSErrors. Auth comes from e2e/.auth/state.json, which
// `npm run e2e:login` creates after YOU log in by hand; it is gitignored and never printed.
export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  timeout: 30 * 60 * 1000,
  workers: 1,
  reporter: [["list"]],
  outputDir: "e2e/report/pw-artifacts",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://localhost:5173",
    ignoreHTTPSErrors: true,
    headless: process.env.E2E_HEADLESS === "1",
  },
});
