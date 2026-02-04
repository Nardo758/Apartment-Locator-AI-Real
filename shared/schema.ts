import { pgTable, text, integer, boolean, timestamp, uuid, json, decimal, serial, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  subscriptionTier: varchar("subscription_tier", { length: 50 }).default("free"),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("inactive"),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  emailVerified: boolean("email_verified").default(false),
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

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, lastSeen: true, firstScraped: true, lastUpdated: true });
export const insertSavedApartmentSchema = createInsertSchema(savedApartments).omit({ id: true, createdAt: true });
export const insertSearchHistorySchema = createInsertSchema(searchHistory).omit({ id: true, createdAt: true });
export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMarketSnapshotSchema = createInsertSchema(marketSnapshots).omit({ id: true, createdAt: true });
export const insertUserPoiSchema = createInsertSchema(userPois).omit({ id: true, createdAt: true });
export const insertPurchaseSchema = createInsertSchema(purchases).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLeaseVerificationSchema = createInsertSchema(leaseVerifications).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type InsertSavedApartment = z.infer<typeof insertSavedApartmentSchema>;
export type InsertSearchHistory = z.infer<typeof insertSearchHistorySchema>;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type InsertMarketSnapshot = z.infer<typeof insertMarketSnapshotSchema>;
export type InsertUserPoi = z.infer<typeof insertUserPoiSchema>;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type InsertLeaseVerification = z.infer<typeof insertLeaseVerificationSchema>;

export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type LeaseVerification = typeof leaseVerifications.$inferSelect;
export type SavedApartment = typeof savedApartments.$inferSelect;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type MarketSnapshot = typeof marketSnapshots.$inferSelect;
export type UserPoi = typeof userPois.$inferSelect;
