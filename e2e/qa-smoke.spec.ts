import { test, type Page, type BrowserContext } from "@playwright/test";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * Read-only smoke/QA pass. It ONLY navigates (GET) - it never clicks buttons, submits forms,
 * sends messages, touches billing or disconnects integrations. Run: `npm run e2e:qa`
 * (after `npm run e2e:login`). Output: e2e/report/report.md + report.json + screenshots.
 */

const STATE = "e2e/.auth/state.json";
const REPORT_DIR = "e2e/report";
const SHOT_DIR = path.join(REPORT_DIR, "screenshots");
const API_LOG_DIR = process.env.E2E_API_LOG_DIR ?? "../BUSINES OS BECKEND/apps/api/WebApi/logs";
const SLOW_MS = 2000;
const LOCALES = ["tj", "ru", "en"] as const;
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
] as const;

const PAGES = [
  "dashboard", "contacts", "deals", "tasks", "files", "calendar", "search", "communications",
  "contracts", "invoices", "inventory", "reports", "ai", "automation", "profile",
  "settings", "settings/organization", "settings/team", "settings/roles", "settings/security",
  "settings/notifications", "settings/preferences", "settings/integrations", "settings/plan",
  "settings/ai-usage", "settings/platform",
  // redirect-only pages (forward to settings/integrations)
  "whatsapp", "telegram", "email", "instagram",
];
const DETAIL_SECTIONS = ["contacts", "deals", "contracts", "invoices"];
const PUBLIC_PAGES = ["", "login", "register", "accept-invite", "403"];

type Finding = {
  page: string;
  locale: string;
  viewport: string;
  kind: string;
  detail: string;
  screenshot?: string;
};
type Visit = {
  url: string;
  finalUrl: string;
  startedAt: number;
  endedAt: number;
  findings: Finding[];
};

const visits: Visit[] = [];

function isNoise(url: string) {
  return /\/_next\/|webpack-hmr|__nextjs|favicon|fonts\.(googleapis|gstatic)|\.hot-update\./.test(url);
}

async function auditPage(
  page: Page,
  route: string,
  locale: string,
  viewport: string,
  needsAuth: boolean
): Promise<Visit> {
  const findings: Finding[] = [];
  const add = (kind: string, detail: string) => findings.push({ page: route, locale, viewport, kind, detail });
  const starts = new Map<unknown, number>();

  const onConsole = (m: import("@playwright/test").ConsoleMessage) => {
    const t = m.type();
    if (t !== "error" && t !== "warning") return;
    const text = m.text();
    if (/React DevTools|Fast Refresh|\[HMR\]/.test(text)) return;
    // Failed network loads are reported (with status + URL) by the response handler below.
    if (/Failed to load resource/.test(text)) return;
    add(`console.${t}`, text.slice(0, 400));
  };
  const onPageError = (e: Error) => add("pageerror", e.message.slice(0, 400));
  const onRequest = (r: import("@playwright/test").Request) => starts.set(r, Date.now());
  const onResponse = (r: import("@playwright/test").Response) => {
    const url = r.url();
    if (isNoise(url)) return;
    const status = r.status();
    const took = Date.now() - (starts.get(r.request()) ?? Date.now());
    if (status >= 400) add("http." + status, `${r.request().method()} ${url} (${took}ms)`);
    else if (took > SLOW_MS && r.request().resourceType() !== "document" && !/hubs\//.test(url)) {
      add("slow", `${r.request().method()} ${url} ${took}ms`);
    }
  };
  const onFailed = (r: import("@playwright/test").Request) => {
    const url = r.url();
    if (isNoise(url) || /hubs\//.test(url)) return;
    const err = r.failure()?.errorText ?? "";
    if (/ERR_ABORTED/.test(err)) return; // navigations cancelling in-flight calls
    add("request.failed", `${r.method()} ${url} ${err} (CORS if "ERR_FAILED")`);
  };

  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("request", onRequest);
  page.on("response", onResponse);
  page.on("requestfailed", onFailed);

  const startedAt = Date.now();
  const url = `/${locale}/${route}`.replace(/\/$/, "") || `/${locale}`;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(800);
  } catch (e) {
    add("navigation.error", String(e).slice(0, 300));
    if (/ERR_CONNECTION_REFUSED/.test(String(e))) {
      visits.push({ url, finalUrl: url, startedAt, endedAt: Date.now(), findings });
      throw new Error("Aborting: dev server is not reachable (ERR_CONNECTION_REFUSED).");
    }
  }

  const finalUrl = page.url();
  if (needsAuth && /\/login(\/|\?|$)/.test(new URL(finalUrl).pathname)) {
    add("auth.redirected-to-login", "Session missing/expired: run `npm run e2e:login` again");
    visits.push({ url, finalUrl, startedAt, endedAt: Date.now(), findings });
    throw new Error(`Aborting: not authenticated (${route}). Run npm run e2e:login first.`);
  }

  // DOM checks
  const dom = await page
    .evaluate(() => {
      const out: { rawKeys: string[]; latin: string[]; overflow: number; emptyBody: boolean; errorText: string | null } =
        { rawKeys: [], latin: [], overflow: 0, emptyBody: false, errorText: null };
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const rawKey = /^[a-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+){1,}$/;
      const domainLike = /\.(com|io|org|net|tj|ru|ai|app|dev|co|me|pdf|png|jpg|csv|xlsx)$/i;
      const seen = new Set<string>();
      let n: Node | null;
      while ((n = walker.nextNode())) {
        const el = n.parentElement;
        if (!el || /SCRIPT|STYLE|NOSCRIPT/.test(el.tagName)) continue;
        const t = (n.textContent ?? "").trim();
        if (!t || seen.has(t)) continue;
        seen.add(t);
        if (rawKey.test(t) && !domainLike.test(t)) out.rawKeys.push(t.slice(0, 80));
        else if (/^[A-Za-z][A-Za-z ,.'’-]{14,}$/.test(t) && t.split(/\s+/).length >= 3) out.latin.push(t.slice(0, 80));
      }
      out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      out.emptyBody = (document.body.innerText ?? "").trim().length < 20;
      const h = document.body.innerText.match(/Application error|Internal Server Error|This page couldn.t load|Unhandled Runtime Error/i);
      out.errorText = h ? h[0] : null;
      return out;
    })
    .catch(() => null);

  if (dom) {
    for (const k of dom.rawKeys.slice(0, 10)) add("i18n.raw-key", k);
    if (locale !== "en") for (const t of dom.latin.slice(0, 6)) add("i18n.possibly-untranslated", t);
    if (dom.overflow > 1) add("layout.horizontal-overflow", `scrollWidth exceeds viewport by ${dom.overflow}px`);
    if (dom.emptyBody) add("render.empty-body", "page has almost no text");
    if (dom.errorText) add("render.error-text", dom.errorText);
  }

  // Screenshot only when something is wrong.
  if (findings.some((f) => !f.kind.startsWith("i18n.possibly"))) {
    mkdirSync(SHOT_DIR, { recursive: true });
    const file = path.join(SHOT_DIR, `${locale}-${viewport}-${route.replace(/\//g, "_") || "root"}.png`);
    await page.screenshot({ path: file, fullPage: viewport === "mobile" }).catch(() => {});
    for (const f of findings) f.screenshot = file;
  }

  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("request", onRequest);
  page.off("response", onResponse);
  page.off("requestfailed", onFailed);

  return { url, finalUrl, startedAt, endedAt: Date.now(), findings };
}

// ---- backend log correlation -------------------------------------------------------------
function backendLines(from: number, to: number): string[] {
  try {
    const files = readdirSync(API_LOG_DIR).filter((f) => /^dev-.*\.log$/.test(f)).sort();
    const out: string[] = [];
    for (const f of files.slice(-2)) {
      for (const line of readFileSync(path.join(API_LOG_DIR, f), "utf8").split(/\r?\n/)) {
        const m = line.match(/^(\d{4})-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)\.(\d{3}) \[(WRN|ERR|FTL)\]/);
        if (!m) continue;
        const ts = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6], +m[7]).getTime();
        if (ts >= from - 1000 && ts <= to + 3000) out.push(line.slice(0, 400));
      }
    }
    return out;
  } catch {
    return [];
  }
}

function writeReport() {
  mkdirSync(REPORT_DIR, { recursive: true });
  const all = visits.flatMap((v) => v.findings.map((f) => ({ ...f, from: v.startedAt, to: v.endedAt })));
  const sev = (k: string) =>
    /pageerror|navigation|render\.|http\.5|auth\./.test(k) ? "High"
    : /http\.4|request\.failed|console\.error|i18n\.raw|slow/.test(k) ? "Medium" : "Low";
  const order = ["High", "Medium", "Low"];

  // Group identical issues across locales/viewports.
  const groups = new Map<string, { sev: string; kind: string; detail: string; where: Set<string>; shot?: string; log: Set<string> }>();
  for (const f of all) {
    const key = `${f.kind}|${f.page}|${f.detail.replace(/\d{3,}ms|\d+ms/g, "Nms")}`;
    let g = groups.get(key);
    if (!g) {
      g = { sev: sev(f.kind), kind: f.kind, detail: f.detail, where: new Set(), shot: f.screenshot, log: new Set() };
      groups.set(key, g);
    }
    g.where.add(`${f.locale}/${f.viewport}:/${f.page}`);
    for (const l of backendLines(f.from, f.to)) g.log.add(l);
  }

  const lines: string[] = [`# QA smoke report`, ``, `Visits: ${visits.length} - findings: ${all.length} - unique issues: ${groups.size}`, ``];
  for (const s of order) {
    const items = [...groups.values()].filter((g) => g.sev === s);
    lines.push(`## ${s} (${items.length})`, ``);
    for (const g of items) {
      lines.push(`- **${g.kind}** ${g.detail}`);
      lines.push(`  - where: ${[...g.where].slice(0, 8).join(", ")}${g.where.size > 8 ? ` (+${g.where.size - 8} more)` : ""}`);
      if (g.shot) lines.push(`  - screenshot: ${g.shot}`);
      if (g.log.size) lines.push(`  - backend log: ${[...g.log].slice(0, 3).join(" | ")}`);
    }
    lines.push(``);
  }
  writeFileSync(path.join(REPORT_DIR, "report.md"), lines.join("\n"));
  writeFileSync(path.join(REPORT_DIR, "report.json"), JSON.stringify({ visits, all }, null, 2));
  console.log(`\nQA report: ${path.resolve(REPORT_DIR, "report.md")}`);
}

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  if (!existsSync(STATE)) throw new Error("No auth state - run `npm run e2e:login` first.");
});
test.afterAll(() => writeReport());

for (const vp of VIEWPORTS) {
  test(`authenticated pages - ${vp.name}`, async ({ browser }) => {
    const context: BrowserContext = await browser.newContext({
      storageState: STATE,
      ignoreHTTPSErrors: true,
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();
    for (const locale of LOCALES) {
      for (const route of PAGES) {
        visits.push(await auditPage(page, route, locale, vp.name, true));
      }
      // Detail pages: follow the first record link of each list (read-only).
      for (const section of DETAIL_SECTIONS) {
        await page.goto(`/${locale}/${section}`, { waitUntil: "domcontentloaded" }).catch(() => {});
        await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
        const href = await page
          .locator(`a[href*="/${section}/"]`)
          .evaluateAll((els, sec) => {
            const re = new RegExp(`/${sec}/[^/?#]+$`);
            const a = (els as HTMLAnchorElement[]).find((e) => re.test(e.getAttribute("href") ?? ""));
            return a ? new URL(a.href).pathname : null;
          }, section)
          .catch(() => null);
        if (href) visits.push(await auditPage(page, href.replace(new RegExp(`^/${locale}/`), ""), locale, vp.name, true));
      }
    }
    await context.close();
  });

  test(`public pages - ${vp.name}`, async ({ browser }) => {
    const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    for (const locale of LOCALES) {
      for (const route of PUBLIC_PAGES) visits.push(await auditPage(page, route, locale, vp.name, false));
    }
    await context.close();
  });
}
