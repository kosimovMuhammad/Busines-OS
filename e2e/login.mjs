// Manual login: opens a headed browser, waits for YOU to log in, verifies the session really
// works (a protected page loads without bouncing to /login) and only then saves the auth state
// to e2e/.auth/state.json (gitignored, never printed).
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.env.E2E_BASE_URL ?? "https://localhost:5173";
const isLogin = (u) => /\/login(\/|$)/.test(new URL(u).pathname);
mkdirSync("e2e/.auth", { recursive: true });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await context.newPage();
// Diagnostics (no values): which auth calls happen and whether they set a cookie.
page.on("response", async (r) => {
  if (!r.url().includes(":5129/auth/")) return;
  const h = await r.allHeaders().catch(() => ({}));
  const sc = h["set-cookie"] ? h["set-cookie"].split("\n").map((c) => c.split("=")[0] + " [" + c.split(";").slice(1).map((x) => x.trim().split("=")[0]).join(",") + "]") : "none";
  console.log("auth call", r.request().method(), new URL(r.url()).pathname, r.status(), "set-cookie:", sc);
});
page.on("console", (m) => { if (/cookie|SameSite|blocked/i.test(m.text())) console.log("console:", m.text().slice(0, 300)); });
await page.goto(`${base}/tj/login`);
console.log("Log in in the opened browser window (waiting up to 5 minutes)...");
await page.waitForURL((u) => !isLogin(u.toString()), { timeout: 5 * 60 * 1000 });
await page.waitForLoadState("networkidle").catch(() => {});

// Verify: a hard load of a protected page must stay on it (refresh cookie accepted).
await page.goto(`${base}/tj/dashboard`, { waitUntil: "domcontentloaded" });
await page.waitForLoadState("networkidle", { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1500);
if (isLogin(page.url())) {
  console.error("FAILED: session did not survive a page reload (bounced to /login). Nothing saved.");
  await browser.close();
  process.exit(1);
}
const names = (await context.cookies()).map((c) => c.name).filter((n) => n !== "NEXT_LOCALE");
await context.storageState({ path: "e2e/.auth/state.json" });
console.log(`Saved e2e/.auth/state.json with ${names.length} auth cookie(s) (values not printed).`);
await browser.close();
