import { SCRAPE_MARKETS, scrapeAndImportApartmentList, scrapeAndImportApartmentsCom, getApifyToken } from "../routes/apify-import";
import { generateMarketSnapshots } from "./market-snapshot-generator";

const SCHEDULE_DAY = 5; // Friday
const SCHEDULE_HOUR = 13; // 1 PM UTC (9 AM ET)
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
  console.log(`[Scheduler] Starting weekly scrape of ${SCRAPE_MARKETS.length} markets (both sources) at ${startTime.toISOString()}`);

  try {
    const apartmentListResults: any[] = [];
    const apartmentsComResults: any[] = [];

    console.log(`[Scheduler] Phase 1: ApartmentList.com — ${SCRAPE_MARKETS.length} markets`);
    for (let i = 0; i < SCRAPE_MARKETS.length; i += CONCURRENCY) {
      const batch = SCRAPE_MARKETS.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map((m) => scrapeAndImportApartmentList(token, m.city, m.state, MAX_ITEMS_PER_MARKET))
      );
      apartmentListResults.push(...batchResults);

      const succeeded = apartmentListResults.filter((r) => r.status === "success").length;
      const totalListings = apartmentListResults.reduce((sum, r) => sum + (r.listings || 0), 0);
      console.log(
        `[Scheduler] ApartmentList progress: ${apartmentListResults.length}/${SCRAPE_MARKETS.length} markets (${succeeded} succeeded, ${totalListings} listings)`
      );
    }

    console.log(`[Scheduler] Phase 2: Apartments.com — ${SCRAPE_MARKETS.length} markets`);
    for (let i = 0; i < SCRAPE_MARKETS.length; i += CONCURRENCY) {
      const batch = SCRAPE_MARKETS.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map((m) => scrapeAndImportApartmentsCom(token, m.city, m.state))
      );
      apartmentsComResults.push(...batchResults);

      const succeeded = apartmentsComResults.filter((r) => r.status === "success").length;
      const totalListings = apartmentsComResults.reduce((sum, r) => sum + (r.listings || 0), 0);
      console.log(
        `[Scheduler] Apartments.com progress: ${apartmentsComResults.length}/${SCRAPE_MARKETS.length} markets (${succeeded} succeeded, ${totalListings} listings)`
      );
    }

    const allResults = [...apartmentListResults, ...apartmentsComResults];
    const summary = {
      total: allResults.length,
      succeeded: allResults.filter((r) => r.status === "success").length,
      failed: allResults.filter((r) => r.status !== "success").length,
      totalListings: allResults.reduce((sum, r) => sum + (r.listings || 0), 0),
      duration: `${Math.round((Date.now() - startTime.getTime()) / 1000)}s`,
      sources: {
        apartmentList: {
          total: apartmentListResults.length,
          succeeded: apartmentListResults.filter((r) => r.status === "success").length,
          listings: apartmentListResults.reduce((sum, r) => sum + (r.listings || 0), 0),
        },
        apartmentsCom: {
          total: apartmentsComResults.length,
          succeeded: apartmentsComResults.filter((r) => r.status === "success").length,
          listings: apartmentsComResults.reduce((sum, r) => sum + (r.listings || 0), 0),
        },
      },
    };

    console.log(`[Scheduler] Full scrape complete: ${summary.succeeded}/${summary.total} succeeded, ${summary.totalListings} listings in ${summary.duration}`);

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
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  console.log(`[Scheduler] Initializing weekly scraper for ${SCRAPE_MARKETS.length} markets`);
  console.log(`[Scheduler] Schedule: Every ${DAYS[SCHEDULE_DAY]} at ${SCHEDULE_HOUR}:00 UTC`);
  scheduleNext();
}

export function getSchedulerStatus() {
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return {
    isRunning,
    lastRunAt: lastRunAt?.toISOString() || null,
    nextRunAt: nextRunAt?.toISOString() || null,
    lastRunResult,
    totalMarkets: SCRAPE_MARKETS.length,
    schedule: `Every ${DAYS[SCHEDULE_DAY]} at ${SCHEDULE_HOUR}:00 UTC (${SCHEDULE_HOUR - 4}:00 AM ET)`,
  };
}

export async function triggerManualRun() {
  return runFullRefresh();
}
