import { pgTable, text, integer, boolean, timestamp, uuid, json, decimal, serial, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  userType: varchar("user_type", { length: 50 }).default("renter"),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("free"),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("inactive"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  emailVerified: boolean("email_verified").default(false),
  avatarUrl: text("avatar_url"),
  phoneNumber: varchar("phone_number", { length: 50 }),
  companyName: varchar("company_name", { length: 255 }),
  role: varchar("role", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalId: varchar("external_id", { length: 255 }).notNull().unique(),
  source: varchar("source", { length: 50 }).notNull(),
  name: varchar("name", { length: 500 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  priceRange: varchar("price_range", { length: 50 }),
  bedroomsMin: integer("bedrooms_min"),
  bedroomsMax: integer("bedrooms_max"),
  bathroomsMin: decimal("bathrooms_min", { precision: 3, scale: 1 }),
  bathroomsMax: decimal("bathrooms_max", { precision: 3, scale: 1 }),
  squareFeetMin: integer("square_feet_min"),
  squareFeetMax: integer("square_feet_max"),
  amenities: json("amenities").$type<Record<string, unknown>>().default({}),
  features: json("features").$type<Record<string, unknown>>().default({}),
  petPolicy: json("pet_policy").$type<Record<string, unknown>>().default({}),
  parking: json("parking").$type<Record<string, unknown>>().default({}),
  utilities: json("utilities").$type<Record<string, unknown>>().default({}),
  images: json("images").$type<string[]>().default([]),
  virtualTourUrl: text("virtual_tour_url"),
  description: text("description"),
  propertyType: varchar("property_type", { length: 50 }),
  yearBuilt: integer("year_built"),
  unitsCount: integer("units_count"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: text("website"),
  managementCompany: varchar("management_company", { length: 255 }),
  aiDescription: text("ai_description"),
  aiTags: json("ai_tags").$type<string[]>().default([]),
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }),
  listingUrl: text("listing_url").notNull(),
  lastSeen: timestamp("last_seen").defaultNow(),
  firstScraped: timestamp("first_scraped").defaultNow(),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isActive: boolean("is_active").default(true),
  // Landlord-specific fields
  landlordId: uuid("landlord_id").references(() => users.id),
  isLandlordOwned: boolean("is_landlord_owned").default(false),
  occupancyStatus: varchar("occupancy_status", { length: 50 }).default("vacant"),
  currentTenantId: uuid("current_tenant_id"),
  leaseStartDate: timestamp("lease_start_date"),
  leaseEndDate: timestamp("lease_end_date"),
  daysVacant: integer("days_vacant").default(0),
  lastOccupiedDate: timestamp("last_occupied_date"),
  targetRent: decimal("target_rent", { precision: 10, scale: 2 }),
  actualRent: decimal("actual_rent", { precision: 10, scale: 2 }),
  // Retention Intelligence fields
  unitNumber: varchar("unit_number", { length: 50 }),
  tenantName: varchar("tenant_name", { length: 255 }),
  marketRent: decimal("market_rent", { precision: 10, scale: 2 }),
  retentionRiskScore: integer("retention_risk_score").default(0),
  lastRiskCalculation: timestamp("last_risk_calculation"),
  riskFactors: json("risk_factors").$type<Array<{
    name: string;
    score: number;
    detail: string;
    impact: 'low' | 'medium' | 'high';
  }>>().default([]),
});

export const savedApartments = pgTable("saved_apartments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  apartmentId: uuid("apartment_id").notNull().references(() => properties.id),
  notes: text("notes"),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searchHistory = pgTable("search_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  searchParameters: json("search_parameters").$type<Record<string, unknown>>().notNull(),
  resultsCount: integer("results_count").default(0),
  searchLocation: json("search_location").$type<Record<string, unknown>>(),
  radius: integer("radius"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPreferences = pgTable("user_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique(),
  preferredCities: json("preferred_cities").$type<string[]>().default([]),
  maxPrice: integer("max_price"),
  minBedrooms: integer("min_bedrooms"),
  minBathrooms: decimal("min_bathrooms", { precision: 3, scale: 1 }),
  requiredAmenities: json("required_amenities").$type<string[]>().default([]),
  emailAlerts: boolean("email_alerts").default(true),
  priceDropAlerts: boolean("price_drop_alerts").default(true),
  newListingAlerts: boolean("new_listing_alerts").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userPois = pgTable("user_pois", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  notes: text("notes"),
  priority: integer("priority"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketSnapshots = pgTable("market_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  totalProperties: integer("total_properties").default(0),
  avgPrice: integer("avg_price"),
  medianPrice: integer("median_price"),
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  priceTrend7d: decimal("price_trend_7d", { precision: 5, scale: 2 }),
  priceTrend30d: decimal("price_trend_30d", { precision: 5, scale: 2 }),
  newListings7d: integer("new_listings_7d").default(0),
  newListings30d: integer("new_listings_30d").default(0),
  activeListings: integer("active_listings").default(0),
  avgDaysOnMarket: decimal("avg_days_on_market", { precision: 5, scale: 1 }),
  studiosCount: integer("studios_count").default(0),
  oneBrCount: integer("one_br_count").default(0),
  twoBrCount: integer("two_br_count").default(0),
  threeBrCount: integer("three_br_count").default(0),
  snapshotDate: timestamp("snapshot_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  // Landlord intelligence fields
  inventoryLevel: decimal("inventory_level", { precision: 5, scale: 2 }),
  leverageScore: integer("leverage_score"),
  rentChange1m: decimal("rent_change_1m", { precision: 5, scale: 2 }),
  rentChange3m: decimal("rent_change_3m", { precision: 5, scale: 2 }),
  rentChange12m: decimal("rent_change_12m", { precision: 5, scale: 2 }),
  supplyTrend: varchar("supply_trend", { length: 50 }),
  demandTrend: varchar("demand_trend", { length: 50 }),
  aiRecommendation: text("ai_recommendation"),
});

export const submarkets = pgTable("submarkets", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCodes: json("zip_codes").$type<string[]>().default([]),
  boundaries: json("boundaries").$type<{
    north: number;
    south: number;
    east: number;
    west: number;
  }>(),
  propertyCount: integer("property_count").default(0),
  totalUnits: integer("total_units").default(0),
  avgRent: decimal("avg_rent", { precision: 10, scale: 2 }),
  vacancyRate: decimal("vacancy_rate", { precision: 5, scale: 4 }),
  rentGrowth30d: decimal("rent_growth_30d", { precision: 5, scale: 4 }),
  avgOpportunityScore: decimal("avg_opportunity_score", { precision: 4, scale: 2 }),
  negotiationSuccessRate: decimal("negotiation_success_rate", { precision: 5, scale: 4 }),
  marketPressure: varchar("market_pressure", { length: 50 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  permissions: json("permissions").$type<{
    endpoints: string[];
    rateLimit: number;
    tier: 'free' | 'basic' | 'premium' | 'enterprise';
  }>().default({ endpoints: ['/api/jedi/*'], rateLimit: 1000, tier: 'free' }),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true),
  requestCount: integer("request_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  guestEmail: varchar("guest_email", { length: 255 }),
  guestName: varchar("guest_name", { length: 255 }),
  amount: integer("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("usd"),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  productType: varchar("product_type", { length: 100 }).default("one_time_unlock"),
  searchCriteria: json("search_criteria").$type<Record<string, unknown>>(),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull(),
  stripeProductId: varchar("stripe_product_id", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull(), // active, past_due, canceled, unpaid, trialing
  planType: varchar("plan_type", { length: 50 }).notNull(), // landlord_starter, landlord_pro, landlord_enterprise, agent_basic, agent_team, agent_brokerage
  userType: varchar("user_type", { length: 50 }).notNull(), // renter, landlord, agent
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("usd"),
  interval: varchar("interval", { length: 20 }).notNull(), // month, year
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  canceledAt: timestamp("canceled_at"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  amount: integer("amount").notNull(), // in cents
  amountPaid: integer("amount_paid").default(0),
  currency: varchar("currency", { length: 3 }).default("usd"),
  status: varchar("status", { length: 50 }).notNull(), // draft, open, paid, uncollectible, void
  invoiceNumber: varchar("invoice_number", { length: 100 }),
  hostedInvoiceUrl: text("hosted_invoice_url"),
  invoicePdf: text("invoice_pdf"),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leaseVerifications = pgTable("lease_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  purchaseId: varchar("purchase_id", { length: 255 }).notNull(),
  guestEmail: varchar("guest_email", { length: 255 }),
  propertyName: varchar("property_name", { length: 500 }),
  finalRent: integer("final_rent").notNull(),
  leaseSignedDate: timestamp("lease_signed_date"),
  moveInDate: timestamp("move_in_date"),
  leaseFileUrl: text("lease_file_url").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  originalAskingRent: integer("original_asking_rent"),
  predictedRent: integer("predicted_rent"),
  actualSavings: integer("actual_savings"),
  refundAmount: integer("refund_amount"),
  refundTier: varchar("refund_tier", { length: 50 }),
  submittedAt: timestamp("submitted_at").defaultNow(),
  verifiedAt: timestamp("verified_at"),
  refundedAt: timestamp("refunded_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pricingAlerts = pgTable("pricing_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  setId: uuid("set_id").references(() => competitionSets.id, { onDelete: 'cascade' }),
  propertyId: uuid("property_id").references(() => properties.id),
  competitorId: uuid("competitor_id"),
  alertType: varchar("alert_type", { length: 50 }).notNull(), // 'price_change' | 'concession' | 'vacancy_risk' | 'market_trend'
  severity: varchar("severity", { length: 20 }).default("info"), // 'info' | 'warning' | 'critical'
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  actionUrl: text("action_url"),
  isRead: boolean("is_read").default(false),
  isDismissed: boolean("is_dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
  dismissedAt: timestamp("dismissed_at"),
});

export const alertPreferences = pgTable("alert_preferences", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  priceChanges: boolean("price_changes").default(true),
  concessions: boolean("concessions").default(true),
  vacancyRisk: boolean("vacancy_risk").default(true),
  marketTrends: boolean("market_trends").default(true),
  deliveryEmail: boolean("delivery_email").default(true),
  deliverySms: boolean("delivery_sms").default(false),
  deliveryInapp: boolean("delivery_inapp").default(true),
  deliveryPush: boolean("delivery_push").default(false),
  frequency: varchar("frequency", { length: 20 }).default("realtime"), // 'realtime' | 'daily' | 'weekly'
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }), // e.g., '22:00'
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }), // e.g., '08:00'
  priceThreshold: decimal("price_threshold", { precision: 10, scale: 2 }).default("50.00"),
  vacancyThreshold: integer("vacancy_threshold").default(30),
  // Retention-specific alert preferences
  renewalReminders: boolean("renewal_reminders").default(true),
  vacancyCostUpdates: boolean("vacancy_cost_updates").default(true),
  riskEscalation: boolean("risk_escalation").default(true),
  retentionWins: boolean("retention_wins").default(true),
  deliveryEmailDigest: boolean("delivery_email_digest").default(false),
  digestDay: varchar("digest_day", { length: 10 }).default("monday"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const competitionSets = pgTable("competition_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownPropertyIds: json("own_property_ids").$type<string[]>().notNull().default([]),
  alertsEnabled: boolean("alerts_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const competitionSetCompetitors = pgTable("competition_set_competitors", {
  id: uuid("id").primaryKey().defaultRandom(),
  setId: uuid("set_id").notNull().references(() => competitionSets.id, { onDelete: "cascade" }),
  propertyId: uuid("property_id").references(() => properties.id),
  address: varchar("address", { length: 500 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareFeet: integer("square_feet"),
  currentRent: decimal("current_rent", { precision: 10, scale: 2 }),
  amenities: json("amenities").$type<string[]>().default([]),
  concessions: json("concessions").$type<Array<{
    type: string;
    description: string;
    value: number;
  }>>().default([]),
  lastUpdated: timestamp("last_updated").defaultNow(),
  source: varchar("source", { length: 50 }).default("manual"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentClients = pgTable("agent_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  status: varchar("status", { length: 50 }).notNull().default("active"), // active, inactive, archived
  stage: varchar("stage", { length: 50 }).default("lead"), // lead, viewing, negotiating, contract, closed
  source: varchar("source", { length: 100 }), // referral, website, walk-in, etc
  budget: json("budget").$type<{ min?: number; max?: number }>(),
  preferredLocations: json("preferred_locations").$type<string[]>().default([]),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  moveInDate: timestamp("move_in_date"),
  notes: text("notes"),
  tags: json("tags").$type<string[]>().default([]),
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high
  assignedProperties: json("assigned_properties").$type<string[]>().default([]),
  lastContact: timestamp("last_contact"),
  nextFollowUp: timestamp("next_follow_up"),
  isArchived: boolean("is_archived").default(false),
  archivedAt: timestamp("archived_at"),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const clientActivity = pgTable("client_activity", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => agentClients.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").notNull().references(() => users.id),
  activityType: varchar("activity_type", { length: 50 }).notNull(), // note, call, email, meeting, viewing, offer, contract
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  propertyId: uuid("property_id").references(() => properties.id),
  metadata: json("metadata").$type<Record<string, unknown>>(),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: uuid("client_id").references(() => users.id),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }),
  clientPhone: varchar("client_phone", { length: 50 }),
  propertyId: uuid("property_id").references(() => properties.id),
  propertyAddress: varchar("property_address", { length: 500 }),
  stage: varchar("stage", { length: 50 }).notNull().default("lead"), // lead, showing, offer, contract, closed
  dealValue: decimal("deal_value", { precision: 12, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  estimatedCommission: decimal("estimated_commission", { precision: 12, scale: 2 }),
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  status: varchar("status", { length: 50 }).default("active"), // active, archived, won, lost
  priority: varchar("priority", { length: 20 }).default("medium"), // low, medium, high
  source: varchar("source", { length: 100 }), // referral, website, cold_call, etc.
  tags: json("tags").$type<string[]>().default([]),
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  stageChangedAt: timestamp("stage_changed_at").defaultNow(),
});

export const dealNotes = pgTable("deal_notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").notNull().references(() => deals.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id),
  note: text("note").notNull(),
  noteType: varchar("note_type", { length: 50 }).default("general"), // general, call, email, meeting, showing
  metadata: json("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================
// AGENT LEADS MANAGEMENT
// ============================================

export const agentLeads = pgTable("agent_leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Contact Information
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  
  // Lead Details
  status: varchar("status", { length: 50 }).notNull().default("new"), // new, contacted, qualified, nurturing, converted, lost
  leadSource: varchar("lead_source", { length: 100 }).notNull(), // website, referral, social, zillow, realtor.com, etc
  propertyInterest: varchar("property_interest", { length: 500 }),
  propertyId: uuid("property_id").references(() => properties.id),
  
  // Lead Scoring (0-100)
  leadScore: integer("lead_score").default(0),
  scoreFactors: json("score_factors").$type<{
    engagement?: number;
    budget?: number;
    timeline?: number;
    motivation?: number;
    responseRate?: number;
  }>(),
  
  // Preferences & Requirements
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  preferredLocations: json("preferred_locations").$type<string[]>().default([]),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  moveInDate: timestamp("move_in_date"),
  timeline: varchar("timeline", { length: 50 }), // immediate, 1-3months, 3-6months, 6+months
  
  // Follow-up Tracking
  lastContactedAt: timestamp("last_contacted_at"),
  nextFollowUpAt: timestamp("next_follow_up_at"),
  followUpCount: integer("follow_up_count").default(0),
  autoFollowUpEnabled: boolean("auto_follow_up_enabled").default(true),
  
  // Interaction History
  totalInteractions: integer("total_interactions").default(0),
  emailsSent: integer("emails_sent").default(0),
  emailsOpened: integer("emails_opened").default(0),
  propertiesViewed: integer("properties_viewed").default(0),
  tourScheduled: boolean("tour_scheduled").default(false),
  tourDate: timestamp("tour_date"),
  
  // Conversion Tracking
  convertedToClientAt: timestamp("converted_to_client_at"),
  convertedClientId: uuid("converted_client_id").references(() => agentClients.id),
  estimatedValue: integer("estimated_value"), // estimated commission value
  
  // Notes & Tags
  notes: text("notes"),
  tags: json("tags").$type<string[]>().default([]),
  
  // Additional Metadata
  metadata: json("metadata").$type<Record<string, unknown>>(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lostAt: timestamp("lost_at"),
  lostReason: varchar("lost_reason", { length: 255 }),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, lastSeen: true, firstScraped: true, lastUpdated: true });
export const insertSavedApartmentSchema = createInsertSchema(savedApartments).omit({ id: true, createdAt: true });
export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({ id: true, createdAt: true });
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMarketSnapshotSchema = createInsertSchema(marketSnapshots).omit({ id: true, createdAt: true });
export const insertUserPoiSchema = createInsertSchema(userPois).omit({ id: true, createdAt: true });
export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeaseVerificationSchema = createInsertSchema(leaseVerifications).omit({ id: true, createdAt: true });
export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPricingAlertSchema = createInsertSchema(pricingAlerts).omit({ id: true, createdAt: true, readAt: true, dismissedAt: true });
export const insertAlertPreferencesSchema = createInsertSchema(alertPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCompetitionSetSchema = createInsertSchema(competitionSets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCompetitionSetCompetitorSchema = createInsertSchema(competitionSetCompetitors).omit({ id: true, createdAt: true, lastUpdated: true });
export const insertAgentClientSchema = createInsertSchema(agentClients).omit({ id: true, createdAt: true, updatedAt: true, archivedAt: true });
export const insertClientActivitySchema = createInsertSchema(clientActivity).omit({ id: true, createdAt: true });
export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true, updatedAt: true, stageChangedAt: true });
export const insertDealNoteSchema = createInsertSchema(dealNotes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAgentLeadSchema = createInsertSchema(agentLeads).omit({ id: true, createdAt: true, updatedAt: true, lostAt: true, convertedToClientAt: true });
export const insertSubmarketSchema = createInsertSchema(submarkets).omit({ id: true, createdAt: true, lastUpdated: true });
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true, updatedAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertSavedApartment = z.infer<typeof insertSavedApartmentSchema>;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type InsertMarketSnapshot = z.infer<typeof insertMarketSnapshotSchema>;
export type InsertUserPoi = z.infer<typeof insertUserPoiSchema>;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type InsertLeaseVerification = z.infer<typeof insertLeaseVerificationSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertPricingAlert = z.infer<typeof insertPricingAlertSchema>;
export type InsertAlertPreferences = z.infer<typeof insertAlertPreferencesSchema>;
export type InsertCompetitionSet = z.infer<typeof insertCompetitionSetSchema>;
export type InsertCompetitionSetCompetitor = z.infer<typeof insertCompetitionSetCompetitorSchema>;
export type InsertAgentClient = z.infer<typeof insertAgentClientSchema>;
export type InsertClientActivity = z.infer<typeof insertClientActivitySchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type InsertDealNote = z.infer<typeof insertDealNoteSchema>;
export type InsertAgentLead = z.infer<typeof insertAgentLeadSchema>;
export type InsertSubmarket = z.infer<typeof insertSubmarketSchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type LeaseVerification = typeof leaseVerifications.$inferSelect;
export type SavedApartment = typeof savedApartments.$inferSelect;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type MarketSnapshot = typeof marketSnapshots.$inferSelect;
export type UserPoi = typeof userPois.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type PricingAlert = typeof pricingAlerts.$inferSelect;
export type AlertPreferences = typeof alertPreferences.$inferSelect;
export type CompetitionSet = typeof competitionSets.$inferSelect;
export type CompetitionSetCompetitor = typeof competitionSetCompetitors.$inferSelect;
export type AgentClient = typeof agentClients.$inferSelect;
export type ClientActivity = typeof clientActivity.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type DealNote = typeof dealNotes.$inferSelect;
export type AgentLead = typeof agentLeads.$inferSelect;
export type Submarket = typeof submarkets.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;

// =====================================================
// RELATIONS - Drizzle ORM Relations for Easy Querying
// =====================================================

// User Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  ownedProperties: many(properties, { relationName: "landlordProperties" }),
  savedApartments: many(savedApartments),
  searchHistory: many(searchHistory),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  pois: many(userPois),
  subscriptions: many(subscriptions),
  invoices: many(invoices),
  competitionSets: many(competitionSets),
  pricingAlerts: many(pricingAlerts),
  alertPreferences: one(alertPreferences, {
    fields: [users.id],
    references: [alertPreferences.userId],
  }),
  agentDeals: many(deals, { relationName: "agentDeals" }),
  clientDeals: many(deals, { relationName: "clientDeals" }),
  dealNotes: many(dealNotes),
  agentLeads: many(agentLeads, { relationName: "agentLeads" }),
}));

// Property Relations
export const propertiesRelations = relations(properties, ({ one, many }) => ({
  landlord: one(users, {
    fields: [properties.landlordId],
    references: [users.id],
    relationName: "landlordProperties",
  }),
  savedBy: many(savedApartments),
  alerts: many(pricingAlerts),
  competitorIn: many(competitionSetCompetitors),
}));

// Competition Set Relations
export const competitionSetsRelations = relations(competitionSets, ({ one, many }) => ({
  user: one(users, {
    fields: [competitionSets.userId],
    references: [users.id],
  }),
  competitors: many(competitionSetCompetitors),
  alerts: many(pricingAlerts),
}));

// Competition Set Competitor Relations
export const competitionSetCompetitorsRelations = relations(competitionSetCompetitors, ({ one }) => ({
  competitionSet: one(competitionSets, {
    fields: [competitionSetCompetitors.setId],
    references: [competitionSets.id],
  }),
  property: one(properties, {
    fields: [competitionSetCompetitors.propertyId],
    references: [properties.id],
  }),
}));

// Pricing Alert Relations
export const pricingAlertsRelations = relations(pricingAlerts, ({ one }) => ({
  user: one(users, {
    fields: [pricingAlerts.userId],
    references: [users.id],
  }),
  competitionSet: one(competitionSets, {
    fields: [pricingAlerts.setId],
    references: [competitionSets.id],
  }),
  property: one(properties, {
    fields: [pricingAlerts.propertyId],
    references: [properties.id],
  }),
}));

// Alert Preferences Relations
export const alertPreferencesRelations = relations(alertPreferences, ({ one }) => ({
  user: one(users, {
    fields: [alertPreferences.userId],
    references: [users.id],
  }),
}));

// Saved Apartments Relations
export const savedApartmentsRelations = relations(savedApartments, ({ one }) => ({
  apartment: one(properties, {
    fields: [savedApartments.apartmentId],
    references: [properties.id],
  }),
}));

// User Preferences Relations
export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

// Subscription Relations
export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  invoices: many(invoices),
}));

// Invoice Relations
export const invoicesRelations = relations(invoices, ({ one }) => ({
  user: one(users, {
    fields: [invoices.userId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
}));

// Agent Client Relations
export const agentClientsRelations = relations(agentClients, ({ one, many }) => ({
  agent: one(users, {
    fields: [agentClients.agentId],
    references: [users.id],
  }),
  activities: many(clientActivity),
}));

// Client Activity Relations
export const clientActivityRelations = relations(clientActivity, ({ one }) => ({
  client: one(agentClients, {
    fields: [clientActivity.clientId],
    references: [agentClients.id],
  }),
  agent: one(users, {
    fields: [clientActivity.agentId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [clientActivity.propertyId],
    references: [properties.id],
  }),
}));

// Deal Relations
export const dealsRelations = relations(deals, ({ one, many }) => ({
  agent: one(users, {
    fields: [deals.agentId],
    references: [users.id],
    relationName: "agentDeals",
  }),
  client: one(users, {
    fields: [deals.clientId],
    references: [users.id],
    relationName: "clientDeals",
  }),
  property: one(properties, {
    fields: [deals.propertyId],
    references: [properties.id],
  }),
  notes: many(dealNotes),
}));

// Deal Note Relations
export const dealNotesRelations = relations(dealNotes, ({ one }) => ({
  deal: one(deals, {
    fields: [dealNotes.dealId],
    references: [deals.id],
  }),
  user: one(users, {
    fields: [dealNotes.userId],
    references: [users.id],
  }),
}));

// Agent Leads Relations
export const agentLeadsRelations = relations(agentLeads, ({ one }) => ({
  agent: one(users, {
    fields: [agentLeads.agentId],
    references: [users.id],
    relationName: "agentLeads",
  }),
  property: one(properties, {
    fields: [agentLeads.propertyId],
    references: [properties.id],
  }),
  convertedClient: one(agentClients, {
    fields: [agentLeads.convertedClientId],
    references: [agentClients.id],
  }),
}));
