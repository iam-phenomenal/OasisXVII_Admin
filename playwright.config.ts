import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.e2e" });

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3001";
const BACKEND_DIR = process.env.E2E_BACKEND_DIR ?? "../Oasis_XVII_Backend";

/**
 * Dedicated port, not the 3089 the day-to-day dev backend uses. `.env.test`
 * points at a separate database, but `reuseExistingServer` cannot tell one
 * backend process from another — on the shared port it would silently adopt a
 * production-pointed dev server and let the mutation tests write to live data.
 * Only the test backend ever listens on 3090, which is what makes reuse safe.
 */
const API_URL = process.env.E2E_API_URL ?? "http://localhost:3090";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/fixtures/reset-rate-limit.ts",
  fullyParallel: false, // shared backend + shared DB; see plans/010 §8
  workers: 1,
  retries: 0,
  reporter: [["html", { open: "never" }], ["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: BASE_URL,
    // The full Chromium build rather than the default headless shell, which is
    // a separate download this machine does not have.
    channel: "chromium",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      // Runs before login exists — redirect and failed-login coverage.
      name: "anonymous",
      testMatch: /specs\/auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin",
      testIgnore: /specs\/auth\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/admin.json",
      },
    },
  ],

  webServer: [
    {
      // Uses .env.test so the suite never touches the production database.
      command: `bash -c 'set -a; source .env.test; set +a; npm run dev'`,
      cwd: BACKEND_DIR,
      url: `${API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 90_000,
      stdout: "pipe",
      stderr: "pipe",
    },
    {
      // Production build by default: dev-mode compile-on-demand is the main
      // source of first-navigation timeouts. E2E_DEV=1 for fast iteration.
      command: process.env.E2E_DEV
        ? "npm run dev"
        : "npm run build && npm run start",
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      // Overrides the API_URL in .env.local so the admin app talks to the test
      // backend. Next preserves real process env over .env files.
      env: { API_URL },
    },
  ],
});
