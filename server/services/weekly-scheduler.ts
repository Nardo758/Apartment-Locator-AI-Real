import { SCRAPE_MARKETS, scrapeAndImportApartmentList, getApifyToken } from "../routes/apify-import";
import { generateMarketSnapshots } from "./market-snapshot-generator";

const SCHEDULE_DAY = 0; // Sunday
const SCHEDULE_HOUR = 6; // 6 AM UTC (1 AM ET)
const CONCURRENCY = 2;
const MAX_ITEMS_PER_MARKET = 50;

let schedulerTimer: ReturnType<typeof setTimeout> | null = null;
let isRunning = false;
let lastRunAt: Date | null = null;
let lastRunResult: any = null;
let nextRunAt: Date | null = null;

function getNextRunTime(): Date {
  const now = new Date();
  const next = new Date(now);

  next.setUTCHours(SCHEDULE_HOUR, 0, 0, 0);

  const daysUntilTarget = (SCHEDULE_DAY - now.getUTCDay() + 7) % 7;

  if (daysUntilTarget === 0 && now.getUTCHours() >= SCHEDULE_HOUR) {
    next.setUTCDate(next.getUTCDate() + 7);
  } else {
    next.setUTCDate(next.getUTCDate() + daysUntilTarget);
  }

  return next;
}

async function runFullRefresh(): Promise<any> {
  if (isRunning) {
    console.log("[Scheduler] Scrape already in progress, skipping");
    return { skipped: true, reason: "already running" };
  }

  const token = getApifyToken();
  if (!token) {
    console.error("[Scheduler] APIFY_TOKEN not configured, cannot run scrape");
    return { error: "APIFY_TOKEN not configured" };
  }

  isRunning = true;
  const startTime = new Date();
  console.log(`[Scheduler] Starting weekly scrape of ${SCRAPE_MARKETS.length} markets at ${startTime.toISOString()}`);

  try {
    const results: any[] = [];

    for (let i = 0; i < SCRAPE_MARKETS.length; i += CONCURRENCY) {
      const batch = SCRAPE_MARKETS.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map((m) => scrapeAndImportApartmentList(token, m.city, m.state, MAX_ITEMS_PER_MARKET))
      );
      results.push(...batchResults);

      const succeeded = results.filter((r) => r.status === "success").length;
      const totalListings = results.reduce((sum, r) => sum + (r.listings || 0), 0);
      console.log(
        `[Scheduler] Progress: ${results.length}/${SCRAPE_MARKETS.length} markets (${succeeded} succeeded, ${totalListings} listings)`
      );
    }

    const summary = {
      total: results.length,
      succeeded: results.filter((r) => r.status === "success").length,
      failed: results.filter((r) => r.status !== "success").length,
      totalListings: results.reduce((sum, r) => sum + (r.listings || 0), 0),
      duration: `${Math.round((Date.now() - startTime.getTime()) / 1000)}s`,
      results,
    };

    console.log(`[Scheduler] Scrape complete: ${summary.succeeded}/${summary.total} succeeded, ${summary.totalListings} listings in ${summary.duration}`);

    try {
      console.log("[Scheduler] Generating market snapshots...");
      const snapshotResult = await generateMarketSnapshots();
      console.log(`[Scheduler] Market snapshots: ${snapshotResult.snapshotsCreated} created for ${snapshotResult.citiesProcessed} cities`);
      (summary as any).snapshots = snapshotResult;
    } catch (err) {
      console.error("[Scheduler] Market snapshot generation failed:", err);
    }

    lastRunAt = new Date();
    lastRunResult = summary;
    return summary;
  } catch (error) {
    console.error("[Scheduler] Fatal error during scrape:", error);
    lastRunResult = { error: (error as Error).message };
    return lastRunResult;
  } finally {
    isRunning = false;
  }
}

function scheduleNext() {
  if (schedulerTimer) {
    clearTimeout(schedulerTimer);
  }

  nextRunAt = getNextRunTime();
  let msUntilRun = nextRunAt.getTime() - Date.now();
  if (msUntilRun <= 0) {
    nextRunAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    msUntilRun = nextRunAt.getTime() - Date.now();
  }

  console.log(`[Scheduler] Next run scheduled for ${nextRunAt.toISOString()} (in ${Math.round(msUntilRun / 1000 / 60 / 60)}h)`);

  schedulerTimer = setTimeout(async () => {
    await runFullRefresh();
    scheduleNext();
  }, msUntilRun);
}

export function startWeeklyScheduler() {
  console.log(`[Scheduler] Initializing weekly scraper for ${SCRAPE_MARKETS.length} markets`);
  console.log(`[Scheduler] Schedule: Every Sunday at ${SCHEDULE_HOUR}:00 UTC`);
  scheduleNext();
}

export function getSchedulerStatus() {
  return {
    isRunning,
    lastRunAt: lastRunAt?.toISOString() || null,
    nextRunAt: nextRunAt?.toISOString() || null,
    lastRunResult,
    totalMarkets: SCRAPE_MARKETS.length,
    schedule: `Every Sunday at ${SCHEDULE_HOUR}:00 UTC`,
  };
}

export async function triggerManualRun() {
  return runFullRefresh();
}
