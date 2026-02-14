CREATE TABLE "agent_clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"stage" varchar(50) DEFAULT 'lead',
	"source" varchar(100),
	"budget" json,
	"preferred_locations" json DEFAULT '[]'::json,
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"move_in_date" timestamp,
	"notes" text,
	"tags" json DEFAULT '[]'::json,
	"priority" varchar(20) DEFAULT 'medium',
	"assigned_properties" json DEFAULT '[]'::json,
	"last_contact" timestamp,
	"next_follow_up" timestamp,
	"is_archived" boolean DEFAULT false,
	"archived_at" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "agent_leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"lead_source" varchar(100) NOT NULL,
	"property_interest" varchar(500),
	"property_id" uuid,
	"lead_score" integer DEFAULT 0,
	"score_factors" json,
	"budget_min" integer,
	"budget_max" integer,
	"preferred_locations" json DEFAULT '[]'::json,
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"move_in_date" timestamp,
	"timeline" varchar(50),
	"last_contacted_at" timestamp,
	"next_follow_up_at" timestamp,
	"follow_up_count" integer DEFAULT 0,
	"auto_follow_up_enabled" boolean DEFAULT true,
	"total_interactions" integer DEFAULT 0,
	"emails_sent" integer DEFAULT 0,
	"emails_opened" integer DEFAULT 0,
	"properties_viewed" integer DEFAULT 0,
	"tour_scheduled" boolean DEFAULT false,
	"tour_date" timestamp,
	"converted_to_client_at" timestamp,
	"converted_client_id" uuid,
	"estimated_value" integer,
	"notes" text,
	"tags" json DEFAULT '[]'::json,
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"lost_at" timestamp,
	"lost_reason" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "alert_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"price_changes" boolean DEFAULT true,
	"concessions" boolean DEFAULT true,
	"vacancy_risk" boolean DEFAULT true,
	"market_trends" boolean DEFAULT true,
	"delivery_email" boolean DEFAULT true,
	"delivery_sms" boolean DEFAULT false,
	"delivery_inapp" boolean DEFAULT true,
	"delivery_push" boolean DEFAULT false,
	"frequency" varchar(20) DEFAULT 'realtime',
	"quiet_hours_start" varchar(5),
	"quiet_hours_end" varchar(5),
	"price_threshold" numeric(10, 2) DEFAULT '50.00',
	"vacancy_threshold" integer DEFAULT 30,
	"renewal_reminders" boolean DEFAULT true,
	"vacancy_cost_updates" boolean DEFAULT true,
	"risk_escalation" boolean DEFAULT true,
	"retention_wins" boolean DEFAULT true,
	"delivery_email_digest" boolean DEFAULT false,
	"digest_day" varchar(10) DEFAULT 'monday',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "alert_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"key_hash" varchar(255) NOT NULL,
	"key_prefix" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"permissions" json DEFAULT '{"endpoints":["/api/jedi/*"],"rateLimit":1000,"tier":"free"}'::json,
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"request_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_key_hash_unique" UNIQUE("key_hash")
);
--> statement-breakpoint
CREATE TABLE "client_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"property_id" uuid,
	"metadata" json,
	"scheduled_for" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competition_set_competitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"set_id" uuid NOT NULL,
	"property_id" uuid,
	"address" varchar(500) NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"square_feet" integer,
	"current_rent" numeric(10, 2),
	"amenities" json DEFAULT '[]'::json,
	"concessions" json DEFAULT '[]'::json,
	"last_updated" timestamp DEFAULT now(),
	"source" varchar(50) DEFAULT 'manual',
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competition_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"own_property_ids" json DEFAULT '[]'::json NOT NULL,
	"alerts_enabled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deal_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"note" text NOT NULL,
	"note_type" varchar(50) DEFAULT 'general',
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"client_id" uuid,
	"client_name" varchar(255) NOT NULL,
	"client_email" varchar(255),
	"client_phone" varchar(50),
	"property_id" uuid,
	"property_address" varchar(500),
	"stage" varchar(50) DEFAULT 'lead' NOT NULL,
	"deal_value" numeric(12, 2),
	"commission_rate" numeric(5, 2),
	"estimated_commission" numeric(12, 2),
	"expected_close_date" timestamp,
	"actual_close_date" timestamp,
	"status" varchar(50) DEFAULT 'active',
	"priority" varchar(20) DEFAULT 'medium',
	"source" varchar(100),
	"tags" json DEFAULT '[]'::json,
	"metadata" json DEFAULT '{}'::json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"stage_changed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid,
	"stripe_invoice_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"amount_paid" integer DEFAULT 0,
	"currency" varchar(3) DEFAULT 'usd',
	"status" varchar(50) NOT NULL,
	"invoice_number" varchar(100),
	"hosted_invoice_url" text,
	"invoice_pdf" text,
	"period_start" timestamp,
	"period_end" timestamp,
	"due_date" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_stripe_invoice_id_unique" UNIQUE("stripe_invoice_id")
);
--> statement-breakpoint
CREATE TABLE "lease_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_id" varchar(255) NOT NULL,
	"guest_email" varchar(255),
	"property_name" varchar(500),
	"final_rent" integer NOT NULL,
	"lease_signed_date" timestamp,
	"move_in_date" timestamp,
	"lease_file_url" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"original_asking_rent" integer,
	"predicted_rent" integer,
	"actual_savings" integer,
	"refund_amount" integer,
	"refund_tier" varchar(50),
	"submitted_at" timestamp DEFAULT now(),
	"verified_at" timestamp,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"total_properties" integer DEFAULT 0,
	"avg_price" integer,
	"median_price" integer,
	"min_price" integer,
	"max_price" integer,
	"price_trend_7d" numeric(5, 2),
	"price_trend_30d" numeric(5, 2),
	"new_listings_7d" integer DEFAULT 0,
	"new_listings_30d" integer DEFAULT 0,
	"active_listings" integer DEFAULT 0,
	"avg_days_on_market" numeric(5, 1),
	"studios_count" integer DEFAULT 0,
	"one_br_count" integer DEFAULT 0,
	"two_br_count" integer DEFAULT 0,
	"three_br_count" integer DEFAULT 0,
	"snapshot_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"inventory_level" numeric(5, 2),
	"leverage_score" integer,
	"rent_change_1m" numeric(5, 2),
	"rent_change_3m" numeric(5, 2),
	"rent_change_12m" numeric(5, 2),
	"supply_trend" varchar(50),
	"demand_trend" varchar(50),
	"ai_recommendation" text
);
--> statement-breakpoint
CREATE TABLE "pricing_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"set_id" uuid,
	"property_id" uuid,
	"competitor_id" uuid,
	"alert_type" varchar(50) NOT NULL,
	"severity" varchar(20) DEFAULT 'info',
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"metadata" json,
	"action_url" text,
	"is_read" boolean DEFAULT false,
	"is_dismissed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"read_at" timestamp,
	"dismissed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"source" varchar(50) NOT NULL,
	"name" varchar(500) NOT NULL,
	"address" varchar(500) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip_code" varchar(20),
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"min_price" integer,
	"max_price" integer,
	"price_range" varchar(50),
	"bedrooms_min" integer,
	"bedrooms_max" integer,
	"bathrooms_min" numeric(3, 1),
	"bathrooms_max" numeric(3, 1),
	"square_feet_min" integer,
	"square_feet_max" integer,
	"amenities" json DEFAULT '{}'::json,
	"features" json DEFAULT '{}'::json,
	"pet_policy" json DEFAULT '{}'::json,
	"parking" json DEFAULT '{}'::json,
	"utilities" json DEFAULT '{}'::json,
	"images" json DEFAULT '[]'::json,
	"virtual_tour_url" text,
	"description" text,
	"property_type" varchar(50),
	"year_built" integer,
	"units_count" integer,
	"phone" varchar(50),
	"email" varchar(255),
	"website" text,
	"management_company" varchar(255),
	"ai_description" text,
	"ai_tags" json DEFAULT '[]'::json,
	"sentiment_score" numeric(3, 2),
	"listing_url" text NOT NULL,
	"last_seen" timestamp DEFAULT now(),
	"first_scraped" timestamp DEFAULT now(),
	"last_updated" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"landlord_id" uuid,
	"is_landlord_owned" boolean DEFAULT false,
	"occupancy_status" varchar(50) DEFAULT 'vacant',
	"current_tenant_id" uuid,
	"lease_start_date" timestamp,
	"lease_end_date" timestamp,
	"days_vacant" integer DEFAULT 0,
	"last_occupied_date" timestamp,
	"target_rent" numeric(10, 2),
	"actual_rent" numeric(10, 2),
	"unit_number" varchar(50),
	"tenant_name" varchar(255),
	"market_rent" numeric(10, 2),
	"retention_risk_score" integer DEFAULT 0,
	"last_risk_calculation" timestamp,
	"risk_factors" json DEFAULT '[]'::json,
	CONSTRAINT "properties_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "property_unlocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"property_id" uuid NOT NULL,
	"unlock_type" varchar(50) DEFAULT 'single' NOT NULL,
	"purchase_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"guest_email" varchar(255),
	"guest_name" varchar(255),
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd',
	"stripe_payment_intent_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"product_type" varchar(100) DEFAULT 'one_time_unlock',
	"search_criteria" json,
	"unlocked_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "purchases_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "renter_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_rent" integer,
	"lease_expiration_date" timestamp,
	"budget" integer,
	"move_in_date" timestamp,
	"preferred_location" varchar(255),
	"preferred_zip_code" varchar(20),
	"commute_days_per_week" integer DEFAULT 5,
	"commute_mode" varchar(20) DEFAULT 'driving',
	"vehicle_mpg" integer DEFAULT 28,
	"gas_price" numeric(5, 2),
	"transit_pass" integer DEFAULT 0,
	"time_value_per_hour" integer,
	"preferred_bedrooms" varchar(20),
	"preferred_bathrooms" varchar(20),
	"required_amenities" json DEFAULT '[]'::json,
	"deal_breakers" json DEFAULT '[]'::json,
	"lifestyle_priorities" json DEFAULT '[]'::json,
	"setup_progress" integer DEFAULT 0,
	"completed_steps" json DEFAULT '[]'::json,
	"has_completed_setup" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "renter_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "saved_apartments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"apartment_id" uuid NOT NULL,
	"notes" text,
	"rating" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "search_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"search_parameters" json NOT NULL,
	"results_count" integer DEFAULT 0,
	"search_location" json,
	"radius" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "submarkets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip_codes" json DEFAULT '[]'::json,
	"boundaries" json,
	"property_count" integer DEFAULT 0,
	"total_units" integer DEFAULT 0,
	"avg_rent" numeric(10, 2),
	"vacancy_rate" numeric(5, 4),
	"rent_growth_30d" numeric(5, 4),
	"avg_opportunity_score" numeric(4, 2),
	"negotiation_success_rate" numeric(5, 4),
	"market_pressure" varchar(50),
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"stripe_subscription_id" varchar(255) NOT NULL,
	"stripe_customer_id" varchar(255) NOT NULL,
	"stripe_price_id" varchar(255) NOT NULL,
	"stripe_product_id" varchar(255),
	"status" varchar(50) NOT NULL,
	"plan_type" varchar(50) NOT NULL,
	"user_type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'usd',
	"interval" varchar(20) NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"cancel_at_period_end" boolean DEFAULT false,
	"canceled_at" timestamp,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subscriptions_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "user_pois" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(500) NOT NULL,
	"category" varchar(100) NOT NULL,
	"latitude" numeric(10, 8) NOT NULL,
	"longitude" numeric(11, 8) NOT NULL,
	"notes" text,
	"priority" integer,
	"priority_level" varchar(20) DEFAULT 'medium',
	"transport_mode" varchar(20) DEFAULT 'driving',
	"max_commute_time" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"preferred_cities" json DEFAULT '[]'::json,
	"max_price" integer,
	"min_bedrooms" integer,
	"min_bathrooms" numeric(3, 1),
	"required_amenities" json DEFAULT '[]'::json,
	"email_alerts" boolean DEFAULT true,
	"price_drop_alerts" boolean DEFAULT true,
	"new_listing_alerts" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"name" varchar(255),
	"user_type" varchar(50) DEFAULT 'renter',
	"subscription_tier" varchar(50) DEFAULT 'free',
	"subscription_status" varchar(50) DEFAULT 'inactive',
	"stripe_customer_id" varchar(255),
	"email_verified" boolean DEFAULT false,
	"avatar_url" text,
	"phone_number" varchar(50),
	"company_name" varchar(255),
	"role" varchar(100),
	"access_expires_at" timestamp,
	"access_plan_type" varchar(50),
	"property_analyses_used" integer DEFAULT 0,
	"property_analyses_limit" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "agent_clients" ADD CONSTRAINT "agent_clients_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD CONSTRAINT "agent_leads_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD CONSTRAINT "agent_leads_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_leads" ADD CONSTRAINT "agent_leads_converted_client_id_agent_clients_id_fk" FOREIGN KEY ("converted_client_id") REFERENCES "public"."agent_clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_preferences" ADD CONSTRAINT "alert_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_activity" ADD CONSTRAINT "client_activity_client_id_agent_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."agent_clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_activity" ADD CONSTRAINT "client_activity_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_activity" ADD CONSTRAINT "client_activity_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_set_competitors" ADD CONSTRAINT "competition_set_competitors_set_id_competition_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."competition_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_set_competitors" ADD CONSTRAINT "competition_set_competitors_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_sets" ADD CONSTRAINT "competition_sets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_notes" ADD CONSTRAINT "deal_notes_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deal_notes" ADD CONSTRAINT "deal_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_alerts" ADD CONSTRAINT "pricing_alerts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_alerts" ADD CONSTRAINT "pricing_alerts_set_id_competition_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."competition_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pricing_alerts" ADD CONSTRAINT "pricing_alerts_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_landlord_id_users_id_fk" FOREIGN KEY ("landlord_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_unlocks" ADD CONSTRAINT "property_unlocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_unlocks" ADD CONSTRAINT "property_unlocks_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "renter_profiles" ADD CONSTRAINT "renter_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_apartments" ADD CONSTRAINT "saved_apartments_apartment_id_properties_id_fk" FOREIGN KEY ("apartment_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;