/**
 * Landlord Dashboard Query Examples
 * 
 * This file demonstrates how to use the new landlord schema with Drizzle ORM.
 * Copy these patterns into your actual backend code.
 */

import { eq, and, desc, count, sql, gt, inArray } from "drizzle-orm";
import { db } from "./db"; // Your database connection
import {
  users,
  properties,
  competitionSets,
  competitionSetCompetitors,
  pricingAlerts,
  alertPreferences,
  marketSnapshots,
} from "../shared/schema";

// =====================================================
// 1. LANDLORD PROPERTIES
// =====================================================

/**
 * Get all properties owned by a landlord
 */
export async function getLandlordProperties(landlordId: string) {
  return await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.landlordId, landlordId),
        eq(properties.isLandlordOwned, true)
      )
    );
}

/**
 * Get portfolio summary with occupancy metrics
 */
export async function getPortfolioSummary(landlordId: string) {
  const result = await db
    .select({
      totalProperties: count(),
      occupied: sql<number>`COUNT(*) FILTER (WHERE ${properties.occupancyStatus} = 'occupied')`,
      vacant: sql<number>`COUNT(*) FILTER (WHERE ${properties.occupancyStatus} = 'vacant')`,
      monthlyRevenue: sql<number>`SUM(CASE WHEN ${properties.occupancyStatus} = 'occupied' THEN ${properties.actualRent} ELSE 0 END)`,
      potentialRevenue: sql<number>`SUM(${properties.targetRent})`,
      avgDaysVacant: sql<number>`AVG(${properties.daysVacant})`,
      totalSquareFeet: sql<number>`SUM(${properties.squareFeetMin})`,
    })
    .from(properties)
    .where(
      and(
        eq(properties.landlordId, landlordId),
        eq(properties.isLandlordOwned, true)
      )
    );

  const stats = result[0];
  
  return {
    totalProperties: stats.totalProperties,
    occupied: stats.occupied,
    vacant: stats.vacant,
    occupancyRate: Number(
      ((stats.occupied / stats.totalProperties) * 100).toFixed(2)
    ),
    monthlyRevenue: stats.monthlyRevenue || 0,
    potentialRevenue: stats.potentialRevenue || 0,
    revenueEfficiency: Number(
      ((stats.monthlyRevenue / stats.potentialRevenue) * 100).toFixed(2)
    ),
    avgDaysVacant: Math.round(stats.avgDaysVacant || 0),
    totalSquareFeet: stats.totalSquareFeet || 0,
  };
}

/**
 * Get vacant properties with vacancy risk
 */
export async function getVacantPropertiesWithRisk(
  landlordId: string,
  riskThreshold: number = 30
) {
  return await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.landlordId, landlordId),
        eq(properties.isLandlordOwned, true),
        eq(properties.occupancyStatus, "vacant"),
        gt(properties.daysVacant, riskThreshold)
      )
    )
    .orderBy(desc(properties.daysVacant));
}

/**
 * Update property occupancy status
 */
export async function updateOccupancyStatus(
  propertyId: string,
  status: "vacant" | "occupied" | "pending",
  tenantId?: string,
  leaseStart?: Date,
  leaseEnd?: Date,
  actualRent?: number
) {
  return await db
    .update(properties)
    .set({
      occupancyStatus: status,
      currentTenantId: tenantId || null,
      leaseStartDate: leaseStart || null,
      leaseEndDate: leaseEnd || null,
      actualRent: actualRent || null,
      daysVacant: status === "occupied" ? 0 : undefined,
      lastOccupiedDate: status === "occupied" ? new Date() : undefined,
    })
    .where(eq(properties.id, propertyId));
}

// =====================================================
// 2. COMPETITION SETS
// =====================================================

/**
 * Create a new competition set
 */
export async function createCompetitionSet(data: {
  userId: string;
  name: string;
  description?: string;
  ownPropertyIds: string[];
  alertsEnabled?: boolean;
}) {
  const result = await db
    .insert(competitionSets)
    .values({
      userId: data.userId,
      name: data.name,
      description: data.description,
      ownPropertyIds: data.ownPropertyIds,
      alertsEnabled: data.alertsEnabled ?? false,
    })
    .returning();

  return result[0];
}

/**
 * Get all competition sets for a user with competitor counts
 */
export async function getCompetitionSetsWithCounts(userId: string) {
  return await db
    .select({
      id: competitionSets.id,
      name: competitionSets.name,
      description: competitionSets.description,
      ownPropertyIds: competitionSets.ownPropertyIds,
      alertsEnabled: competitionSets.alertsEnabled,
      createdAt: competitionSets.createdAt,
      updatedAt: competitionSets.updatedAt,
      competitorCount: sql<number>`COUNT(${competitionSetCompetitors.id})`,
    })
    .from(competitionSets)
    .leftJoin(
      competitionSetCompetitors,
      eq(competitionSetCompetitors.setId, competitionSets.id)
    )
    .where(eq(competitionSets.userId, userId))
    .groupBy(competitionSets.id)
    .orderBy(desc(competitionSets.updatedAt));
}

/**
 * Get competition set details with competitors
 */
export async function getCompetitionSetWithCompetitors(setId: string) {
  const set = await db.query.competitionSets.findFirst({
    where: eq(competitionSets.id, setId),
    with: {
      competitors: {
        where: eq(competitionSetCompetitors.isActive, true),
      },
    },
  });

  return set;
}

/**
 * Add competitor to a competition set
 */
export async function addCompetitor(data: {
  setId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  currentRent?: number;
  amenities?: string[];
  concessions?: Array<{ type: string; description: string; value: number }>;
  source?: "manual" | "scraper" | "api";
  notes?: string;
  propertyId?: string;
}) {
  const result = await db
    .insert(competitionSetCompetitors)
    .values({
      setId: data.setId,
      propertyId: data.propertyId,
      address: data.address,
      latitude: data.latitude ? data.latitude.toString() : null,
      longitude: data.longitude ? data.longitude.toString() : null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms ? data.bathrooms.toString() : null,
      squareFeet: data.squareFeet,
      currentRent: data.currentRent ? data.currentRent.toString() : null,
      amenities: data.amenities || [],
      concessions: data.concessions || [],
      source: data.source || "manual",
      notes: data.notes,
    })
    .returning();

  return result[0];
}

/**
 * Get competitors with effective rent calculation
 */
export async function getCompetitorsWithEffectiveRent(setId: string) {
  const competitors = await db
    .select()
    .from(competitionSetCompetitors)
    .where(
      and(
        eq(competitionSetCompetitors.setId, setId),
        eq(competitionSetCompetitors.isActive, true)
      )
    );

  return competitors.map((competitor) => {
    const concessions = competitor.concessions as Array<{
      type: string;
      description: string;
      value: number;
    }>;

    const totalConcessionValue = concessions.reduce(
      (sum, c) => sum + (c.value || 0),
      0
    );
    const monthlyConcessionValue = totalConcessionValue / 12;

    const currentRent = competitor.currentRent
      ? parseFloat(competitor.currentRent)
      : 0;
    const effectiveMonthlyRent = currentRent - monthlyConcessionValue;

    return {
      ...competitor,
      effectiveMonthlyRent: Math.round(effectiveMonthlyRent),
      totalConcessionValue,
      monthlyConcessionValue: Math.round(monthlyConcessionValue),
    };
  });
}

// =====================================================
// 3. PRICING ALERTS
// =====================================================

/**
 * Get unread alerts for a user
 */
export async function getUnreadAlerts(userId: string) {
  return await db
    .select()
    .from(pricingAlerts)
    .where(and(eq(pricingAlerts.userId, userId), eq(pricingAlerts.isRead, false)))
    .orderBy(
      sql`CASE ${pricingAlerts.severity} 
        WHEN 'critical' THEN 1 
        WHEN 'warning' THEN 2 
        WHEN 'info' THEN 3 
      END`,
      desc(pricingAlerts.createdAt)
    );
}

/**
 * Get alert counts by type
 */
export async function getAlertCounts(userId: string) {
  const result = await db
    .select({
      total: count(),
      unread: sql<number>`COUNT(*) FILTER (WHERE ${pricingAlerts.isRead} = false)`,
      critical: sql<number>`COUNT(*) FILTER (WHERE ${pricingAlerts.severity} = 'critical')`,
      warning: sql<number>`COUNT(*) FILTER (WHERE ${pricingAlerts.severity} = 'warning')`,
    })
    .from(pricingAlerts)
    .where(eq(pricingAlerts.userId, userId));

  return result[0];
}

/**
 * Create a new alert
 */
export async function createAlert(data: {
  userId: string;
  setId?: string;
  propertyId?: string;
  competitorId?: string;
  alertType: "price_change" | "concession" | "vacancy_risk" | "market_trend";
  severity?: "info" | "warning" | "critical";
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
}) {
  const result = await db
    .insert(pricingAlerts)
    .values({
      userId: data.userId,
      setId: data.setId,
      propertyId: data.propertyId,
      competitorId: data.competitorId,
      alertType: data.alertType,
      severity: data.severity || "info",
      title: data.title,
      message: data.message,
      metadata: data.metadata,
      actionUrl: data.actionUrl,
    })
    .returning();

  return result[0];
}

/**
 * Mark alert as read
 */
export async function markAlertAsRead(alertId: string) {
  return await db
    .update(pricingAlerts)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(pricingAlerts.id, alertId));
}

/**
 * Dismiss alert
 */
export async function dismissAlert(alertId: string) {
  return await db
    .update(pricingAlerts)
    .set({
      isDismissed: true,
      dismissedAt: new Date(),
    })
    .where(eq(pricingAlerts.id, alertId));
}

/**
 * Bulk mark alerts as read
 */
export async function markAllAlertsAsRead(userId: string) {
  return await db
    .update(pricingAlerts)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(and(eq(pricingAlerts.userId, userId), eq(pricingAlerts.isRead, false)));
}

// =====================================================
// 4. ALERT PREFERENCES
// =====================================================

/**
 * Get or create alert preferences for a user
 */
export async function getOrCreateAlertPreferences(userId: string) {
  let prefs = await db
    .select()
    .from(alertPreferences)
    .where(eq(alertPreferences.userId, userId))
    .limit(1);

  if (prefs.length === 0) {
    const result = await db
      .insert(alertPreferences)
      .values({ userId })
      .returning();
    prefs = result;
  }

  return prefs[0];
}

/**
 * Update alert preferences
 */
export async function updateAlertPreferences(
  userId: string,
  updates: Partial<{
    priceChanges: boolean;
    concessions: boolean;
    vacancyRisk: boolean;
    marketTrends: boolean;
    deliveryEmail: boolean;
    deliverySms: boolean;
    deliveryInapp: boolean;
    deliveryPush: boolean;
    frequency: "realtime" | "daily" | "weekly";
    quietHoursStart: string;
    quietHoursEnd: string;
    priceThreshold: number;
    vacancyThreshold: number;
  }>
) {
  return await db
    .update(alertPreferences)
    .set(updates)
    .where(eq(alertPreferences.userId, userId))
    .returning();
}

/**
 * Check if user should receive an alert now (respect quiet hours)
 */
export async function shouldSendAlertNow(userId: string): Promise<boolean> {
  const prefs = await getOrCreateAlertPreferences(userId);

  if (!prefs.quietHoursStart || !prefs.quietHoursEnd) {
    return true;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight
  
  const [startHour, startMin] = prefs.quietHoursStart.split(":").map(Number);
  const [endHour, endMin] = prefs.quietHoursEnd.split(":").map(Number);
  
  const quietStart = startHour * 60 + startMin;
  const quietEnd = endHour * 60 + endMin;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (quietStart > quietEnd) {
    return currentTime < quietStart && currentTime >= quietEnd;
  }

  // Normal quiet hours (e.g., 01:00 to 06:00)
  return currentTime < quietStart || currentTime >= quietEnd;
}

// =====================================================
// 5. MARKET INTELLIGENCE
// =====================================================

/**
 * Get market snapshot with landlord intelligence
 */
export async function getMarketIntelligence(city: string, state: string) {
  return await db
    .select()
    .from(marketSnapshots)
    .where(
      and(eq(marketSnapshots.city, city), eq(marketSnapshots.state, state))
    )
    .orderBy(desc(marketSnapshots.snapshotDate))
    .limit(1);
}

// =====================================================
// 6. COMPARISON & BENCHMARKING
// =====================================================

/**
 * Generate comparison report for a property vs competitors
 */
export async function generateComparisonReport(
  propertyId: string,
  competitorIds: string[]
) {
  // Get the main property
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);

  if (property.length === 0) {
    throw new Error("Property not found");
  }

  // Get competitors
  const competitors = await db
    .select()
    .from(competitionSetCompetitors)
    .where(inArray(competitionSetCompetitors.id, competitorIds));

  // Calculate statistics
  const rents = competitors
    .map((c) => (c.currentRent ? parseFloat(c.currentRent) : 0))
    .filter((r) => r > 0);

  const avgRent = rents.reduce((sum, r) => sum + r, 0) / rents.length;
  const medianRent = rents.sort((a, b) => a - b)[Math.floor(rents.length / 2)];
  const minRent = Math.min(...rents);
  const maxRent = Math.max(...rents);

  const yourRent = property[0].actualRent
    ? parseFloat(property[0].actualRent)
    : 0;
  const variance = yourRent - medianRent;
  const variancePercent = (variance / medianRent) * 100;

  return {
    property: property[0],
    competitors: competitors,
    marketBenchmark: {
      medianRent: Math.round(medianRent),
      avgRent: Math.round(avgRent),
      minRent: Math.round(minRent),
      maxRent: Math.round(maxRent),
      sampleSize: rents.length,
    },
    analysis: {
      pricingPosition:
        variance > 50 ? "above_market" : variance < -50 ? "below_market" : "at_market",
      variance: Math.round(variance),
      variancePercent: variancePercent.toFixed(2),
    },
  };
}

// =====================================================
// 7. BACKGROUND JOB HELPERS
// =====================================================

/**
 * Increment days vacant for all vacant properties (run daily)
 */
export async function incrementDaysVacant() {
  return await db
    .update(properties)
    .set({
      daysVacant: sql`${properties.daysVacant} + 1`,
    })
    .where(
      and(
        eq(properties.isLandlordOwned, true),
        eq(properties.occupancyStatus, "vacant")
      )
    );
}

/**
 * Detect properties at risk of extended vacancy
 */
export async function detectVacancyRiskAlerts(threshold: number = 30) {
  const atRiskProperties = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.isLandlordOwned, true),
        eq(properties.occupancyStatus, "vacant"),
        gt(properties.daysVacant, threshold)
      )
    );

  // Create alerts for each at-risk property
  for (const property of atRiskProperties) {
    if (!property.landlordId) continue;

    await createAlert({
      userId: property.landlordId,
      propertyId: property.id,
      alertType: "vacancy_risk",
      severity: property.daysVacant > threshold * 2 ? "critical" : "warning",
      title: "Vacancy Risk Alert",
      message: `${property.name} has been vacant for ${property.daysVacant} days (threshold: ${threshold})`,
      metadata: {
        propertyAddress: property.address,
        daysVacant: property.daysVacant,
        threshold,
      },
      actionUrl: `/landlord/properties/${property.id}`,
    });
  }

  return atRiskProperties.length;
}

/**
 * Example: Detect price changes in competitors (simplified)
 */
export async function detectCompetitorPriceChanges() {
  // This would typically compare current prices with historical snapshots
  // For demonstration, we'll show the structure
  
  // Pseudo-code:
  // 1. Get all active competition set competitors
  // 2. Compare current_rent with previous snapshot
  // 3. If change > price_threshold, create alert
  // 4. Store new snapshot for next comparison

  console.log("Price change detection would run here");
  return 0;
}
