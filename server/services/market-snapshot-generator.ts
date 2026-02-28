import { db } from "../db";
import { scrapedProperties, marketSnapshots, propertySnapshots } from "../../shared/schema";
import { sql, eq, and, gte, ilike, desc } from "drizzle-orm";
import type { InsertMarketSnapshot } from "../../shared/schema";

interface CityGroup {
  city: string;
  state: string;
}

interface AggregatedStats {
  totalProperties: number;
  avgPrice: number | null;
  medianPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  avgDaysOnMarket: number | null;
  studiosCount: number;
  oneBrCount: number;
  twoBrCount: number;
  threeBrCount: number;
  newListings7d: number;
  newListings30d: number;
}

async function getCityGroups(): Promise<CityGroup[]> {
  const results = await db
    .select({
      city: scrapedProperties.city,
      state: scrapedProperties.state,
    })
    .from(scrapedProperties)
    .where(
      and(
        sql`${scrapedProperties.city} IS NOT NULL`,
        sql`${scrapedProperties.state} IS NOT NULL`,
        sql`${scrapedProperties.currentPrice} >= 200`,
        sql`${scrapedProperties.currentPrice} <= 15000`
      )
    )
    .groupBy(scrapedProperties.city, scrapedProperties.state);

  return results
    .filter((r) => r.city && r.state)
    .map((r) => ({ city: r.city!, state: r.state! }));
}

const MIN_VALID_RENT = 200;
const MAX_VALID_RENT = 15000;

async function aggregateCity(city: string, state: string): Promise<AggregatedStats> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const priceFilter = and(
    ilike(scrapedProperties.city, city),
    ilike(scrapedProperties.state, state),
    sql`${scrapedProperties.currentPrice} >= ${MIN_VALID_RENT}`,
    sql`${scrapedProperties.currentPrice} <= ${MAX_VALID_RENT}`
  );

  const [stats] = await db
    .select({
      totalProperties: sql<number>`COUNT(*)::int`,
      avgPrice: sql<number>`ROUND(AVG(${scrapedProperties.currentPrice}))::int`,
      minPrice: sql<number>`MIN(${scrapedProperties.currentPrice})::int`,
      maxPrice: sql<number>`MAX(${scrapedProperties.currentPrice})::int`,
      avgDaysOnMarket: sql<number>`ROUND(AVG(${scrapedProperties.daysOnMarket})::numeric, 1)`,
      studiosCount: sql<number>`COUNT(CASE WHEN ${scrapedProperties.bedrooms} = 0 THEN 1 END)::int`,
      oneBrCount: sql<number>`COUNT(CASE WHEN ${scrapedProperties.bedrooms} = 1 THEN 1 END)::int`,
      twoBrCount: sql<number>`COUNT(CASE WHEN ${scrapedProperties.bedrooms} = 2 THEN 1 END)::int`,
      threeBrCount: sql<number>`COUNT(CASE WHEN ${scrapedProperties.bedrooms} >= 3 THEN 1 END)::int`,
      newListings7d: sql<number>`COUNT(CASE WHEN ${scrapedProperties.createdAt} >= ${sevenDaysAgo} THEN 1 END)::int`,
      newListings30d: sql<number>`COUNT(CASE WHEN ${scrapedProperties.createdAt} >= ${thirtyDaysAgo} THEN 1 END)::int`,
    })
    .from(scrapedProperties)
    .where(priceFilter);

  const medianResult = await db.execute(sql`
    SELECT PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY ${scrapedProperties.currentPrice})::int as median_price
    FROM ${scrapedProperties}
    WHERE LOWER(${scrapedProperties.city}) = LOWER(${city})
      AND LOWER(${scrapedProperties.state}) = LOWER(${state})
      AND ${scrapedProperties.currentPrice} >= ${MIN_VALID_RENT}
      AND ${scrapedProperties.currentPrice} <= ${MAX_VALID_RENT}
  `);

  const medianPrice = (medianResult as any).rows?.[0]?.median_price
    ?? (medianResult as any)[0]?.median_price
    ?? null;

  return {
    totalProperties: stats.totalProperties || 0,
    avgPrice: stats.avgPrice,
    medianPrice: medianPrice ? Number(medianPrice) : null,
    minPrice: stats.minPrice,
    maxPrice: stats.maxPrice,
    avgDaysOnMarket: stats.avgDaysOnMarket ? Number(stats.avgDaysOnMarket) : null,
    studiosCount: stats.studiosCount || 0,
    oneBrCount: stats.oneBrCount || 0,
    twoBrCount: stats.twoBrCount || 0,
    threeBrCount: stats.threeBrCount || 0,
    newListings7d: stats.newListings7d || 0,
    newListings30d: stats.newListings30d || 0,
  };
}

async function getPreviousSnapshot(city: string, state: string) {
  const results = await db
    .select()
    .from(marketSnapshots)
    .where(
      and(
        ilike(marketSnapshots.city, city),
        ilike(marketSnapshots.state, state)
      )
    )
    .orderBy(desc(marketSnapshots.snapshotDate))
    .limit(1);

  return results[0] || null;
}

function calculatePriceTrend(currentAvg: number | null, previousAvg: number | null): string | null {
  if (!currentAvg || !previousAvg || previousAvg === 0) return null;
  const change = ((currentAvg - previousAvg) / previousAvg) * 100;
  return change.toFixed(2);
}

function determineInventoryLevel(totalProperties: number): string {
  if (totalProperties <= 10) return "Low";
  if (totalProperties <= 30) return "Moderate";
  if (totalProperties <= 60) return "High";
  return "Very High";
}

function calculateLeverageScore(stats: AggregatedStats, inventoryLevel: string): number {
  let score = 50;

  if (inventoryLevel === "Very High") score += 20;
  else if (inventoryLevel === "High") score += 10;
  else if (inventoryLevel === "Low") score -= 15;

  if (stats.newListings30d > stats.totalProperties * 0.3) score += 10;
  if (stats.avgDaysOnMarket && stats.avgDaysOnMarket > 30) score += 10;
  if (stats.avgDaysOnMarket && stats.avgDaysOnMarket > 60) score += 5;

  return Math.max(0, Math.min(100, score));
}

function determineSupplyTrend(stats: AggregatedStats): string {
  const ratio = stats.totalProperties > 0 ? stats.newListings30d / stats.totalProperties : 0;
  if (ratio > 0.3) return "Increasing";
  if (ratio > 0.1) return "Stable";
  return "Tightening";
}

function determineDemandTrend(stats: AggregatedStats): string {
  if (stats.avgDaysOnMarket && stats.avgDaysOnMarket < 20) return "Strong";
  if (stats.avgDaysOnMarket && stats.avgDaysOnMarket < 40) return "Moderate";
  return "Cooling";
}

function generateAiRecommendation(
  stats: AggregatedStats,
  inventoryLevel: string,
  leverageScore: number,
  supplyTrend: string,
  demandTrend: string
): string {
  const parts: string[] = [];

  if (leverageScore >= 65) {
    parts.push(
      `${inventoryLevel} inventory with ${stats.totalProperties} active listings gives renters strong negotiating leverage.`
    );
  } else if (leverageScore >= 40) {
    parts.push(
      `Market has ${stats.totalProperties} listings with balanced conditions.`
    );
  } else {
    parts.push(
      `Tight market with only ${stats.totalProperties} listings — limited negotiating room.`
    );
  }

  if (stats.medianPrice) {
    parts.push(`Median rent is $${stats.medianPrice.toLocaleString()}/mo.`);
  }

  if (supplyTrend === "Increasing") {
    parts.push("New listings are rising, which may ease competition.");
  } else if (supplyTrend === "Tightening") {
    parts.push("Supply is tightening — act quickly on good deals.");
  }

  if (demandTrend === "Strong") {
    parts.push("Properties are leasing fast.");
  } else if (demandTrend === "Cooling") {
    parts.push("Demand is softening, creating opportunity for negotiation.");
  }

  return parts.join(" ");
}

export async function generateMarketSnapshots(
  filterCities?: CityGroup[]
): Promise<{ citiesProcessed: number; snapshotsCreated: number; errors: string[] }> {
  const cities = filterCities || (await getCityGroups());
  let snapshotsCreated = 0;
  const errors: string[] = [];

  for (const { city, state } of cities) {
    try {
      const stats = await aggregateCity(city, state);

      if (stats.totalProperties === 0) continue;

      const previous = await getPreviousSnapshot(city, state);

      let priceTrend7d: string | null = null;
      let priceTrend30d: string | null = null;
      let rentChange1m: string | null = null;

      if (previous?.avgPrice && stats.avgPrice) {
        const prevDate = previous.snapshotDate ? new Date(previous.snapshotDate) : null;
        const daysSincePrev = prevDate
          ? Math.round((Date.now() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
          : null;

        const pctChange = ((stats.avgPrice - previous.avgPrice) / previous.avgPrice * 100).toFixed(2);

        if (daysSincePrev !== null && daysSincePrev <= 10) {
          priceTrend7d = pctChange;
        }
        if (daysSincePrev !== null && daysSincePrev <= 35) {
          priceTrend30d = pctChange;
        }

        rentChange1m = pctChange;
      }

      const inventoryLevel = determineInventoryLevel(stats.totalProperties);
      const leverageScore = calculateLeverageScore(stats, inventoryLevel);
      const supplyTrend = determineSupplyTrend(stats);
      const demandTrend = determineDemandTrend(stats);
      const aiRecommendation = generateAiRecommendation(
        stats,
        inventoryLevel,
        leverageScore,
        supplyTrend,
        demandTrend
      );

      const inventoryLevelNumeric = stats.totalProperties <= 10 ? 25
        : stats.totalProperties <= 30 ? 50
        : stats.totalProperties <= 60 ? 75
        : 95;

      const snapshotData: InsertMarketSnapshot = {
        city,
        state,
        totalProperties: stats.totalProperties,
        avgPrice: stats.avgPrice,
        medianPrice: stats.medianPrice,
        minPrice: stats.minPrice,
        maxPrice: stats.maxPrice,
        priceTrend7d: priceTrend7d ?? undefined,
        priceTrend30d: priceTrend30d ?? undefined,
        newListings7d: stats.newListings7d,
        newListings30d: stats.newListings30d,
        activeListings: stats.totalProperties,
        avgDaysOnMarket: stats.avgDaysOnMarket != null ? String(stats.avgDaysOnMarket) : undefined,
        studiosCount: stats.studiosCount,
        oneBrCount: stats.oneBrCount,
        twoBrCount: stats.twoBrCount,
        threeBrCount: stats.threeBrCount,
        inventoryLevel: String(inventoryLevelNumeric),
        leverageScore,
        rentChange1m: rentChange1m ?? undefined,
        rentChange3m: previous?.rentChange3m ?? undefined,
        rentChange12m: previous?.rentChange12m ?? undefined,
        supplyTrend,
        demandTrend,
        aiRecommendation,
      };

      await db.insert(marketSnapshots).values(snapshotData);
      snapshotsCreated++;
    } catch (err) {
      const msg = `Failed to generate snapshot for ${city}, ${state}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(msg);
      errors.push(msg);
    }
  }

  return {
    citiesProcessed: cities.length,
    snapshotsCreated,
    errors,
  };
}

export async function generateSnapshotsForCities(
  cities: Array<{ city: string; state: string }>
): Promise<{ citiesProcessed: number; snapshotsCreated: number; errors: string[] }> {
  return generateMarketSnapshots(cities);
}
