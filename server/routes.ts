import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  insertPropertySchema,
  insertSavedApartmentSchema,
  insertSearchHistorySchema,
  insertUserPreferencesSchema,
  insertMarketSnapshotSchema,
  insertUserPoiSchema,
  insertCompetitionSetSchema,
  insertCompetitionSetCompetitorSchema,
  insertRenterProfileSchema,
  users,
  propertyUnlocks,
} from "@shared/schema";
import { 
  createUser, 
  authenticateUser, 
  generateToken, 
  verifyToken, 
  getUserById,
  getUserByEmail,
  updateUserType,
  findOrCreateGoogleUser,
  type AuthUser 
} from "./auth";
import { z } from "zod";
import { registerPaymentRoutes } from "./routes/payments";
import { registerLeaseVerificationRoutes } from "./routes/lease-verification";
import { registerJediRoutes } from "./routes/jedi";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const signUpSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  name: z.string().max(255).optional(),
});

const signInSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1),
});

// Landlord property schemas
const createLandlordPropertySchema = z.object({
  name: z.string().min(1).max(500),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  zipCode: z.string().max(20).optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  bedroomsMin: z.number().int().min(0).optional(),
  bedroomsMax: z.number().int().min(0).optional(),
  bathroomsMin: z.number().min(0).optional(),
  bathroomsMax: z.number().min(0).optional(),
  squareFeetMin: z.number().int().min(0).optional(),
  squareFeetMax: z.number().int().min(0).optional(),
  propertyType: z.string().max(50).optional(),
  yearBuilt: z.number().int().optional(),
  unitsCount: z.number().int().optional(),
  targetRent: z.number().min(0).optional(),
  actualRent: z.number().min(0).optional(),
  occupancyStatus: z.enum(['vacant', 'occupied', 'pending', 'maintenance']).default('vacant'),
  currentTenantId: z.string().uuid().optional(),
  leaseStartDate: z.string().datetime().optional(),
  leaseEndDate: z.string().datetime().optional(),
  amenities: z.record(z.unknown()).optional(),
  features: z.record(z.unknown()).optional(),
  petPolicy: z.record(z.unknown()).optional(),
  parking: z.record(z.unknown()).optional(),
  utilities: z.record(z.unknown()).optional(),
  images: z.array(z.string()).optional(),
  description: z.string().optional(),
  phone: z.string().max(50).optional(),
  email: z.string().email().max(255).optional(),
  website: z.string().optional(),
});

const updateLandlordPropertySchema = createLandlordPropertySchema.partial();

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const user = await getUserById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = user;
  next();
}

export async function registerRoutes(app: Express): Promise<void> {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parseResult = signUpSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: parseResult.error.errors 
        });
      }

      const { email, password, name } = parseResult.data;
      
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "Email already registered" });
      }

      const user = await createUser(email, password, name);
      const token = generateToken(user);

      res.status(201).json({ user, token });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/signin", async (req, res) => {
    try {
      const parseResult = signInSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid data", 
          details: parseResult.error.errors 
        });
      }

      const { email, password } = parseResult.data;
      const user = await authenticateUser(email, password);

      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = generateToken(user);
      res.json({ user, token });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({ error: "Failed to sign in" });
    }
  });

  // Google OAuth — verify Google ID token and sign in or create account
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { credential } = req.body;

      if (!credential) {
        return res.status(400).json({ error: "Google credential is required" });
      }

      const googleRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );

      if (!googleRes.ok) {
        return res.status(401).json({ error: "Invalid Google credential" });
      }

      const payload = await googleRes.json() as {
        email?: string;
        email_verified?: string;
        name?: string;
        picture?: string;
        aud?: string;
      };

      if (!payload.email) {
        return res.status(400).json({ error: "Google account has no email" });
      }

      const expectedClientId = process.env.GOOGLE_CLIENT_ID;
      if (expectedClientId && payload.aud !== expectedClientId) {
        return res.status(401).json({ error: "Token audience mismatch" });
      }

      const user = await findOrCreateGoogleUser(
        payload.email,
        payload.name,
        payload.picture
      );
      const token = generateToken(user);

      res.json({ user, token });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Google authentication failed" });
    }
  });

  app.get("/api/auth/me", authMiddleware, (req, res) => {
    res.json({ user: req.user });
  });

  app.patch("/api/auth/user-type", authMiddleware, async (req, res) => {
    try {
      const { userType } = req.body;
      
      if (!userType || !["renter", "landlord", "agent", "admin"].includes(userType)) {
        return res.status(400).json({ error: "Invalid user type" });
      }

      const updatedUser = await updateUserType(req.user!.id, userType);
      
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating user type:", error);
      res.status(500).json({ error: "Failed to update user type" });
    }
  });

  app.get("/api/properties", async (req, res) => {
    try {
      const { city, state, minPrice, maxPrice, bedrooms, limit } = req.query;
      const properties = await storage.getProperties({
        city: city as string,
        state: state as string,
        minPrice: minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms as string) : undefined,
        limit: limit ? parseInt(limit as string) : 50,
      });
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getPropertyById(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const parseResult = insertPropertySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid property data", 
          details: parseResult.error.errors 
        });
      }
      const property = await storage.createProperty(parseResult.data);
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  app.get("/api/saved-apartments/:userId", async (req, res) => {
    try {
      const apartments = await storage.getSavedApartments(req.params.userId);
      res.json(apartments);
    } catch (error) {
      console.error("Error fetching saved apartments:", error);
      res.status(500).json({ error: "Failed to fetch saved apartments" });
    }
  });

  app.post("/api/saved-apartments", async (req, res) => {
    try {
      const parseResult = insertSavedApartmentSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid saved apartment data", 
          details: parseResult.error.errors 
        });
      }
      const saved = await storage.saveApartment(parseResult.data);
      res.status(201).json(saved);
    } catch (error) {
      console.error("Error saving apartment:", error);
      res.status(500).json({ error: "Failed to save apartment" });
    }
  });

  app.delete("/api/saved-apartments/:userId/:apartmentId", async (req, res) => {
    try {
      await storage.removeSavedApartment(req.params.userId, req.params.apartmentId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing saved apartment:", error);
      res.status(500).json({ error: "Failed to remove saved apartment" });
    }
  });

  app.get("/api/search-history/:userId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const history = await storage.getSearchHistory(req.params.userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ error: "Failed to fetch search history" });
    }
  });

  app.post("/api/search-history", async (req, res) => {
    try {
      const parseResult = insertSearchHistorySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid search history data", 
          details: parseResult.error.errors 
        });
      }
      const entry = await storage.addSearchHistory(parseResult.data);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error adding search history:", error);
      res.status(500).json({ error: "Failed to add search history" });
    }
  });

  app.get("/api/preferences/:userId", async (req, res) => {
    try {
      const preferences = await storage.getUserPreferences(req.params.userId);
      if (!preferences) {
        return res.status(404).json({ error: "Preferences not found" });
      }
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ error: "Failed to fetch preferences" });
    }
  });

  app.post("/api/preferences", async (req, res) => {
    try {
      const parseResult = insertUserPreferencesSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid preferences data", 
          details: parseResult.error.errors 
        });
      }
      const preferences = await storage.upsertUserPreferences(parseResult.data);
      res.json(preferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      res.status(500).json({ error: "Failed to save preferences" });
    }
  });

  app.get("/api/market-snapshots/:city/:state", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const snapshots = await storage.getMarketSnapshots(
        req.params.city,
        req.params.state,
        limit
      );
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching market snapshots:", error);
      res.status(500).json({ error: "Failed to fetch market snapshots" });
    }
  });

  app.post("/api/market-snapshots", async (req, res) => {
    try {
      const parseResult = insertMarketSnapshotSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid market snapshot data", 
          details: parseResult.error.errors 
        });
      }
      const snapshot = await storage.createMarketSnapshot(parseResult.data);
      res.status(201).json(snapshot);
    } catch (error) {
      console.error("Error creating market snapshot:", error);
      res.status(500).json({ error: "Failed to create market snapshot" });
    }
  });

  app.get("/api/pois/:userId", async (req, res) => {
    try {
      const pois = await storage.getUserPois(req.params.userId);
      res.json(pois);
    } catch (error) {
      console.error("Error fetching POIs:", error);
      res.status(500).json({ error: "Failed to fetch POIs" });
    }
  });

  app.post("/api/pois", async (req, res) => {
    try {
      const parseResult = insertUserPoiSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid POI data", 
          details: parseResult.error.errors 
        });
      }
      const poi = await storage.createUserPoi(parseResult.data);
      res.status(201).json(poi);
    } catch (error) {
      console.error("Error creating POI:", error);
      res.status(500).json({ error: "Failed to create POI" });
    }
  });

  app.delete("/api/pois/:userId/:poiId", async (req, res) => {
    try {
      await storage.deleteUserPoi(req.params.userId, req.params.poiId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting POI:", error);
      res.status(500).json({ error: "Failed to delete POI" });
    }
  });

  // ============================================
  // RENTER PROFILE ENDPOINTS
  // ============================================

  app.get("/api/renter-profile", authMiddleware, async (req, res) => {
    try {
      const profile = await storage.getRenterProfile(req.user!.id);
      if (!profile) {
        return res.json(null);
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching renter profile:", error);
      res.status(500).json({ error: "Failed to fetch renter profile" });
    }
  });

  app.post("/api/renter-profile", authMiddleware, async (req, res) => {
    try {
      const profileData = {
        ...req.body,
        userId: req.user!.id,
      };

      const parseResult = insertRenterProfileSchema.safeParse(profileData);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid profile data",
          details: parseResult.error.errors,
        });
      }

      const profile = await storage.upsertRenterProfile(parseResult.data);
      res.json(profile);
    } catch (error) {
      console.error("Error saving renter profile:", error);
      res.status(500).json({ error: "Failed to save renter profile" });
    }
  });

  // ============================================
  // LANDLORD PORTFOLIO MANAGEMENT ENDPOINTS
  // ============================================
  
  // POST /api/landlord/properties - Add a new property to portfolio
  app.post("/api/landlord/properties", authMiddleware, async (req, res) => {
    try {
      // Check if user is a landlord
      if (req.user!.userType !== 'landlord' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Landlord account required." 
        });
      }

      const parseResult = createLandlordPropertySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid property data", 
          details: parseResult.error.errors 
        });
      }

      const propertyData = parseResult.data;
      
      // Generate a unique external ID for landlord properties
      const externalId = `landlord-${req.user!.id}-${Date.now()}`;
      
      const property = await storage.createLandlordProperty({
        ...propertyData,
        externalId,
        source: 'landlord',
        landlordId: req.user!.id,
        isLandlordOwned: true,
        listingUrl: '', // Not needed for landlord-owned properties
        daysVacant: propertyData.occupancyStatus === 'vacant' ? 0 : undefined,
        leaseStartDate: propertyData.leaseStartDate ? new Date(propertyData.leaseStartDate) : undefined,
        leaseEndDate: propertyData.leaseEndDate ? new Date(propertyData.leaseEndDate) : undefined,
      });
      
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating landlord property:", error);
      res.status(500).json({ error: "Failed to create property" });
    }
  });

  // GET /api/landlord/properties - List all properties in portfolio
  app.get("/api/landlord/properties", authMiddleware, async (req, res) => {
    try {
      // Check if user is a landlord
      if (req.user!.userType !== 'landlord' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Landlord account required." 
        });
      }

      const { city, occupancyStatus, sortBy, limit } = req.query;
      
      const properties = await storage.getLandlordProperties(req.user!.id, {
        city: city as string,
        occupancyStatus: occupancyStatus as string,
        sortBy: sortBy as 'daysVacant' | 'targetRent' | 'name' | 'city',
        limit: limit ? parseInt(limit as string) : 50,
      });
      
      res.json({ 
        properties,
        total: properties.length 
      });
    } catch (error) {
      console.error("Error fetching landlord properties:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  // GET /api/landlord/properties/:id - Get specific property details
  app.get("/api/landlord/properties/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is a landlord
      if (req.user!.userType !== 'landlord' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Landlord account required." 
        });
      }

      const property = await storage.getLandlordPropertyById(
        req.user!.id,
        req.params.id
      );
      
      if (!property) {
        return res.status(404).json({ 
          error: "Property not found or access denied" 
        });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching landlord property:", error);
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  // PATCH /api/landlord/properties/:id - Update property
  app.patch("/api/landlord/properties/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is a landlord
      if (req.user!.userType !== 'landlord' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Landlord account required." 
        });
      }

      const parseResult = updateLandlordPropertySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid property data", 
          details: parseResult.error.errors 
        });
      }

      const updateData = parseResult.data;
      
      // Convert date strings to Date objects if present
      if (updateData.leaseStartDate) {
        updateData.leaseStartDate = new Date(updateData.leaseStartDate);
      }
      if (updateData.leaseEndDate) {
        updateData.leaseEndDate = new Date(updateData.leaseEndDate);
      }

      const property = await storage.updateLandlordProperty(
        req.user!.id,
        req.params.id,
        updateData
      );
      
      if (!property) {
        return res.status(404).json({ 
          error: "Property not found or access denied" 
        });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error updating landlord property:", error);
      res.status(500).json({ error: "Failed to update property" });
    }
  });

  // DELETE /api/landlord/properties/:id - Remove property from portfolio
  app.delete("/api/landlord/properties/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is a landlord
      if (req.user!.userType !== 'landlord' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Landlord account required." 
        });
      }

      // First check if property exists and belongs to user
      const property = await storage.getLandlordPropertyById(
        req.user!.id,
        req.params.id
      );
      
      if (!property) {
        return res.status(404).json({ 
          error: "Property not found or access denied" 
        });
      }

      await storage.deleteLandlordProperty(req.user!.id, req.params.id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting landlord property:", error);
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  // GET /api/landlord/portfolio/summary - Get portfolio statistics
  app.get("/api/landlord/portfolio/summary", authMiddleware, async (req, res) => {
    try {
      // Check if user is a landlord
      if (req.user!.userType !== 'landlord' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Landlord account required." 
        });
      }

      const summary = await storage.getPortfolioSummary(req.user!.id);
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching portfolio summary:", error);
      res.status(500).json({ error: "Failed to fetch portfolio summary" });
    }
  });

  // POST /api/landlord/lease-intel - Get lease intelligence for properties
  app.post("/api/landlord/lease-intel", authMiddleware, async (req, res) => {
    try {
      if (req.user!.userType !== 'landlord' && req.user!.userType !== 'admin') {
        return res.status(403).json({
          error: "Access denied. Landlord account required."
        });
      }

      const { propertyIds } = req.body;
      if (!Array.isArray(propertyIds)) {
        return res.status(400).json({ error: "propertyIds must be an array" });
      }

      const intel = await storage.getLeaseIntelligence(req.user!.id, propertyIds);
      res.json(intel);
    } catch (error) {
      console.error("Error fetching lease intelligence:", error);
      res.status(500).json({ error: "Failed to fetch lease intelligence" });
    }
  });

  // Competition Sets Endpoints
  
  // 1. POST /api/competition-sets - Create a new competition set
  app.post("/api/competition-sets", authMiddleware, async (req, res) => {
    try {
      const parseResult = insertCompetitionSetSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid competition set data", 
          details: parseResult.error.errors 
        });
      }

      const { ownPropertyIds } = parseResult.data;
      
      // Validate that all ownPropertyIds exist and belong to the user
      // For now, we'll trust the data since we don't have landlord ownership in properties table yet
      // TODO: Add validation when properties.landlordId is added
      
      const competitionSet = await storage.createCompetitionSet(parseResult.data);
      res.status(201).json(competitionSet);
    } catch (error) {
      console.error("Error creating competition set:", error);
      res.status(500).json({ error: "Failed to create competition set" });
    }
  });

  // 2. GET /api/competition-sets - List all competition sets for authenticated user
  app.get("/api/competition-sets", authMiddleware, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const result = await storage.getCompetitionSets(req.user!.id, { limit, offset });
      res.json(result);
    } catch (error) {
      console.error("Error fetching competition sets:", error);
      res.status(500).json({ error: "Failed to fetch competition sets" });
    }
  });

  // 3. GET /api/competition-sets/:id - Get competition set details
  app.get("/api/competition-sets/:id", authMiddleware, async (req, res) => {
    try {
      const set = await storage.getCompetitionSetById(req.params.id, req.user!.id);
      
      if (!set) {
        return res.status(404).json({ error: "Competition set not found" });
      }

      // Get competitors for this set
      const competitors = await storage.getCompetitorsForSet(req.params.id);
      
      res.json({ ...set, competitors });
    } catch (error) {
      console.error("Error fetching competition set:", error);
      res.status(500).json({ error: "Failed to fetch competition set" });
    }
  });

  // 4. PATCH /api/competition-sets/:id - Update competition set
  app.patch("/api/competition-sets/:id", authMiddleware, async (req, res) => {
    try {
      const allowedFields = ['name', 'description', 'ownPropertyIds', 'alertsEnabled'];
      const updateData: any = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      // Validate name if provided
      if (updateData.name !== undefined) {
        if (typeof updateData.name !== 'string' || updateData.name.trim().length === 0) {
          return res.status(400).json({ error: "Name must be a non-empty string" });
        }
        if (updateData.name.length > 255) {
          return res.status(400).json({ error: "Name must be 255 characters or less" });
        }
      }

      // Validate ownPropertyIds if provided
      if (updateData.ownPropertyIds !== undefined) {
        if (!Array.isArray(updateData.ownPropertyIds)) {
          return res.status(400).json({ error: "ownPropertyIds must be an array" });
        }
      }

      const updated = await storage.updateCompetitionSet(
        req.params.id, 
        req.user!.id, 
        updateData
      );
      
      if (!updated) {
        return res.status(404).json({ error: "Competition set not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating competition set:", error);
      res.status(500).json({ error: "Failed to update competition set" });
    }
  });

  // 5. DELETE /api/competition-sets/:id - Delete competition set
  app.delete("/api/competition-sets/:id", authMiddleware, async (req, res) => {
    try {
      // Verify the set exists and belongs to user before deleting
      const set = await storage.getCompetitionSetById(req.params.id, req.user!.id);
      
      if (!set) {
        return res.status(404).json({ error: "Competition set not found" });
      }

      await storage.deleteCompetitionSet(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting competition set:", error);
      res.status(500).json({ error: "Failed to delete competition set" });
    }
  });

  // 6. POST /api/competition-sets/:id/competitors - Add competitor to set
  app.post("/api/competition-sets/:id/competitors", authMiddleware, async (req, res) => {
    try {
      // Verify the set exists and belongs to user
      const set = await storage.getCompetitionSetById(req.params.id, req.user!.id);
      
      if (!set) {
        return res.status(404).json({ error: "Competition set not found" });
      }

      const parseResult = insertCompetitionSetCompetitorSchema.safeParse({
        ...req.body,
        setId: req.params.id,
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid competitor data", 
          details: parseResult.error.errors 
        });
      }

      // Check for duplicate address in the same set
      const existingCompetitors = await storage.getCompetitorsForSet(req.params.id);
      const duplicate = existingCompetitors.find(
        c => c.address.toLowerCase().trim() === parseResult.data.address.toLowerCase().trim()
      );
      
      if (duplicate) {
        return res.status(409).json({ 
          error: "A competitor with this address already exists in this set" 
        });
      }

      const competitor = await storage.addCompetitorToSet(parseResult.data);
      res.status(201).json(competitor);
    } catch (error) {
      console.error("Error adding competitor:", error);
      res.status(500).json({ error: "Failed to add competitor" });
    }
  });

  // 7. DELETE /api/competition-sets/:id/competitors/:competitorId - Remove competitor
  app.delete("/api/competition-sets/:id/competitors/:competitorId", authMiddleware, async (req, res) => {
    try {
      await storage.removeCompetitorFromSet(
        req.params.id, 
        req.params.competitorId, 
        req.user!.id
      );
      res.status(204).send();
    } catch (error) {
      console.error("Error removing competitor:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to remove competitor" });
    }
  });

  // ============================================
  // AGENT CLIENT MANAGEMENT ENDPOINTS
  // ============================================

  /**
   * POST /api/agent/clients
   * Add a new client
   */
  app.post("/api/agent/clients", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const schema = z.object({
        firstName: z.string().min(1).max(100),
        lastName: z.string().min(1).max(100),
        email: z.string().email().max(255),
        phone: z.string().max(50).optional(),
        status: z.enum(['active', 'inactive', 'archived']).default('active'),
        stage: z.enum(['lead', 'viewing', 'negotiating', 'contract', 'closed']).default('lead'),
        source: z.string().max(100).optional(),
        budget: z.object({
          min: z.number().optional(),
          max: z.number().optional(),
        }).optional(),
        preferredLocations: z.array(z.string()).default([]),
        bedrooms: z.number().int().optional(),
        bathrooms: z.number().optional(),
        moveInDate: z.string().datetime().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).default([]),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
        assignedProperties: z.array(z.string()).default([]),
        nextFollowUp: z.string().datetime().optional(),
        metadata: z.record(z.unknown()).optional(),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid client data", 
          details: parseResult.error.errors 
        });
      }

      const data = parseResult.data;

      // Convert date strings to Date objects
      const clientData: any = {
        ...data,
        agentId: req.user!.id,
      };

      if (data.moveInDate) {
        clientData.moveInDate = new Date(data.moveInDate);
      }

      if (data.nextFollowUp) {
        clientData.nextFollowUp = new Date(data.nextFollowUp);
      }

      const client = await storage.createClient(clientData);
      
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  /**
   * GET /api/agent/clients
   * List clients with filtering and sorting
   */
  app.get("/api/agent/clients", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const { 
        status, 
        stage, 
        search, 
        sortBy, 
        sortOrder, 
        limit, 
        offset 
      } = req.query;

      const result = await storage.getClients(req.user!.id, {
        status: status as string,
        stage: stage as string,
        search: search as string,
        sortBy: sortBy as 'name' | 'createdAt' | 'lastContact' | 'priority',
        sortOrder: sortOrder as 'asc' | 'desc',
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  /**
   * GET /api/agent/clients/:id
   * Get client details
   */
  app.get("/api/agent/clients/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const client = await storage.getClientById(req.params.id, req.user!.id);

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  /**
   * PATCH /api/agent/clients/:id
   * Update client
   */
  app.patch("/api/agent/clients/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const schema = z.object({
        firstName: z.string().min(1).max(100).optional(),
        lastName: z.string().min(1).max(100).optional(),
        email: z.string().email().max(255).optional(),
        phone: z.string().max(50).optional(),
        status: z.enum(['active', 'inactive', 'archived']).optional(),
        stage: z.enum(['lead', 'viewing', 'negotiating', 'contract', 'closed']).optional(),
        source: z.string().max(100).optional(),
        budget: z.object({
          min: z.number().optional(),
          max: z.number().optional(),
        }).optional(),
        preferredLocations: z.array(z.string()).optional(),
        bedrooms: z.number().int().optional(),
        bathrooms: z.number().optional(),
        moveInDate: z.string().datetime().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        assignedProperties: z.array(z.string()).optional(),
        nextFollowUp: z.string().datetime().optional(),
        metadata: z.record(z.unknown()).optional(),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid client data", 
          details: parseResult.error.errors 
        });
      }

      const data: any = { ...parseResult.data };

      // Convert date strings to Date objects
      if (data.moveInDate) {
        data.moveInDate = new Date(data.moveInDate);
      }

      if (data.nextFollowUp) {
        data.nextFollowUp = new Date(data.nextFollowUp);
      }

      const client = await storage.updateClient(req.params.id, req.user!.id, data);

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  /**
   * DELETE /api/agent/clients/:id
   * Archive client (soft delete)
   */
  app.delete("/api/agent/clients/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const client = await storage.archiveClient(req.params.id, req.user!.id);

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error archiving client:", error);
      res.status(500).json({ error: "Failed to archive client" });
    }
  });

  /**
   * GET /api/agent/clients/:id/activity
   * Get client activity history
   */
  app.get("/api/agent/clients/:id/activity", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const { limit, offset } = req.query;

      const result = await storage.getClientActivity(
        req.params.id, 
        req.user!.id, 
        {
          limit: limit ? parseInt(limit as string) : undefined,
          offset: offset ? parseInt(offset as string) : undefined,
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error fetching client activity:", error);
      res.status(500).json({ error: "Failed to fetch client activity" });
    }
  });

  /**
   * POST /api/agent/clients/:id/activity
   * Add activity to client
   */
  app.post("/api/agent/clients/:id/activity", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const schema = z.object({
        activityType: z.enum(['note', 'call', 'email', 'meeting', 'viewing', 'offer', 'contract']),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        propertyId: z.string().uuid().optional(),
        metadata: z.record(z.unknown()).optional(),
        scheduledFor: z.string().datetime().optional(),
        completedAt: z.string().datetime().optional(),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid activity data", 
          details: parseResult.error.errors 
        });
      }

      const data: any = {
        ...parseResult.data,
        clientId: req.params.id,
        agentId: req.user!.id,
      };

      // Convert date strings to Date objects
      if (data.scheduledFor) {
        data.scheduledFor = new Date(data.scheduledFor);
      }

      if (data.completedAt) {
        data.completedAt = new Date(data.completedAt);
      }

      const activity = await storage.createClientActivity(data);

      res.status(201).json(activity);
    } catch (error) {
      console.error("Error creating client activity:", error);
      res.status(500).json({ error: "Failed to create client activity" });
    }
  });

  /**
   * GET /api/agent/dashboard/summary
   * Get agent dashboard overview stats
   */
  app.get("/api/agent/dashboard/summary", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const summary = await storage.getAgentDashboardSummary(req.user!.id);

      res.json(summary);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // ============================================
  // END AGENT CLIENT MANAGEMENT ENDPOINTS
  // ============================================

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ============================================
  // COMPARISON & ANALYTICS ENDPOINTS
  // ============================================

  /**
   * POST /api/comparison
   * Generate a comprehensive comparison report for a property vs competitors
   */
  app.post("/api/comparison", authMiddleware, async (req, res) => {
    try {
      const { propertyId, competitorIds, includeMarketBenchmark = true } = req.body;

      if (!propertyId) {
        return res.status(400).json({ error: "Property ID is required" });
      }

      if (!competitorIds || !Array.isArray(competitorIds) || competitorIds.length === 0) {
        return res.status(400).json({ error: "At least one competitor ID is required" });
      }

      // Fetch the main property
      const property = await storage.getPropertyById(propertyId);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      // Fetch all competitor properties
      const competitors = await Promise.all(
        competitorIds.map(id => storage.getPropertyById(id))
      );

      // Filter out null/undefined competitors
      const validCompetitors = competitors.filter(c => c !== undefined) as Property[];

      if (validCompetitors.length === 0) {
        return res.status(400).json({ error: "No valid competitors found" });
      }

      // Calculate property metrics
      const calculateMetrics = (prop: Property) => {
        const avgPrice = prop.minPrice && prop.maxPrice 
          ? (prop.minPrice + prop.maxPrice) / 2 
          : prop.minPrice || prop.maxPrice || 0;
        
        const avgSqFt = prop.squareFeetMin && prop.squareFeetMax
          ? (prop.squareFeetMin + prop.squareFeetMax) / 2
          : prop.squareFeetMin || prop.squareFeetMax || 0;

        const pricePerSqFt = avgSqFt > 0 ? avgPrice / avgSqFt : 0;

        return {
          id: prop.id,
          name: prop.name,
          address: prop.address,
          currentRent: avgPrice,
          bedrooms: prop.bedroomsMin || 0,
          bathrooms: Number(prop.bathroomsMin) || 0,
          squareFeet: avgSqFt,
          pricePerSqFt: parseFloat(pricePerSqFt.toFixed(2)),
          amenities: prop.amenities || {},
          features: prop.features || {},
          petPolicy: prop.petPolicy || {},
          parking: prop.parking || {},
        };
      };

      const propertyMetrics = calculateMetrics(property);
      const competitorMetrics = validCompetitors.map(calculateMetrics);

      // Calculate market benchmark
      let marketBenchmark = null;
      if (includeMarketBenchmark) {
        const allRents = competitorMetrics.map(c => c.currentRent).filter(r => r > 0);
        const sortedRents = allRents.sort((a, b) => a - b);
        
        const median = sortedRents.length > 0
          ? sortedRents.length % 2 === 0
            ? (sortedRents[sortedRents.length / 2 - 1] + sortedRents[sortedRents.length / 2]) / 2
            : sortedRents[Math.floor(sortedRents.length / 2)]
          : 0;

        const avg = allRents.length > 0 
          ? allRents.reduce((sum, r) => sum + r, 0) / allRents.length 
          : 0;

        // Calculate percentile ranking
        const lowerCount = sortedRents.filter(r => r < propertyMetrics.currentRent).length;
        const percentile = sortedRents.length > 0 
          ? Math.round((lowerCount / sortedRents.length) * 100) 
          : 50;

        marketBenchmark = {
          medianRent: Math.round(median),
          avgRent: Math.round(avg),
          minRent: sortedRents[0] || 0,
          maxRent: sortedRents[sortedRents.length - 1] || 0,
          sampleSize: allRents.length,
          yourPercentile: percentile,
        };
      }

      // Amenity gap analysis
      const allAmenities = new Set<string>();
      competitorMetrics.forEach(comp => {
        if (comp.amenities && typeof comp.amenities === 'object') {
          Object.keys(comp.amenities).forEach(a => allAmenities.add(a));
        }
      });

      const amenityPrevalence = Array.from(allAmenities).map(amenity => {
        const hasAmenity = competitorMetrics.filter(comp => 
          comp.amenities && typeof comp.amenities === 'object' && comp.amenities[amenity]
        ).length;
        const prevalence = (hasAmenity / competitorMetrics.length) * 100;
        const yourPropertyHas = propertyMetrics.amenities 
          && typeof propertyMetrics.amenities === 'object' 
          && propertyMetrics.amenities[amenity];

        return {
          amenity,
          prevalence: Math.round(prevalence),
          yourPropertyHas: !!yourPropertyHas,
        };
      });

      const gaps = amenityPrevalence
        .filter(a => !a.yourPropertyHas && a.prevalence >= 50)
        .map(a => `${a.amenity} (${a.prevalence}% of competitors have it)`);

      const competitiveAdvantages = amenityPrevalence
        .filter(a => a.yourPropertyHas && a.prevalence < 50)
        .map(a => a.amenity);

      // Pricing analysis
      const avgCompetitorRent = marketBenchmark?.avgRent || 0;
      const variance = propertyMetrics.currentRent - avgCompetitorRent;
      const variancePercent = avgCompetitorRent > 0 
        ? ((variance / avgCompetitorRent) * 100) 
        : 0;

      let pricingPosition: 'above_market' | 'at_market' | 'below_market';
      if (variancePercent > 5) pricingPosition = 'above_market';
      else if (variancePercent < -5) pricingPosition = 'below_market';
      else pricingPosition = 'at_market';

      // Generate recommendation
      let recommendation = '';
      if (pricingPosition === 'above_market') {
        const targetRent = Math.round(avgCompetitorRent);
        recommendation = `Your rent is ${Math.abs(Math.round(variancePercent))}% above market average. Consider dropping to $${targetRent}/mo to be competitive.`;
      } else if (pricingPosition === 'below_market') {
        recommendation = `Your rent is ${Math.abs(Math.round(variancePercent))}% below market average. You have room to increase rent.`;
      } else {
        recommendation = 'Your rent is well-positioned at market rate.';
      }

      if (gaps.length > 0) {
        recommendation += ` Missing amenities: ${gaps.slice(0, 3).join(', ')}.`;
      }

      res.json({
        property: propertyMetrics,
        competitors: competitorMetrics,
        marketBenchmark,
        analysis: {
          pricingPosition,
          variance: Math.round(variance),
          variancePercent: parseFloat(variancePercent.toFixed(2)),
          competitiveAdvantages,
          gaps,
          recommendation,
          amenityPrevalence,
        },
        generatedAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Error generating comparison:", error);
      res.status(500).json({ error: "Failed to generate comparison report" });
    }
  });

  /**
   * GET /api/comparison/market-benchmark
   * Get market benchmark data for a specific location and property type
   */
  app.get("/api/comparison/market-benchmark", authMiddleware, async (req, res) => {
    try {
      const { city, state, bedrooms, minSqFt, maxSqFt } = req.query;

      if (!city || !state) {
        return res.status(400).json({ error: "City and state are required" });
      }

      // Build filters
      const filters: any = {
        city: city as string,
        state: state as string,
        limit: 100,
      };

      if (bedrooms) {
        filters.bedrooms = parseInt(bedrooms as string);
      }

      // Fetch properties matching criteria
      const matchingProperties = await storage.getProperties(filters);

      if (matchingProperties.length === 0) {
        return res.status(404).json({ 
          error: "No properties found matching criteria",
          benchmark: null 
        });
      }

      // Calculate market metrics
      const rents = matchingProperties
        .map(p => {
          const avg = p.minPrice && p.maxPrice 
            ? (p.minPrice + p.maxPrice) / 2 
            : p.minPrice || p.maxPrice || 0;
          return avg;
        })
        .filter(r => r > 0);

      const sqFts = matchingProperties
        .map(p => {
          const avg = p.squareFeetMin && p.squareFeetMax
            ? (p.squareFeetMin + p.squareFeetMax) / 2
            : p.squareFeetMin || p.squareFeetMax || 0;
          return avg;
        })
        .filter(s => s > 0);

      const sortedRents = rents.sort((a, b) => a - b);
      const median = sortedRents.length > 0
        ? sortedRents.length % 2 === 0
          ? (sortedRents[sortedRents.length / 2 - 1] + sortedRents[sortedRents.length / 2]) / 2
          : sortedRents[Math.floor(sortedRents.length / 2)]
        : 0;

      const avgRent = rents.length > 0 
        ? rents.reduce((sum, r) => sum + r, 0) / rents.length 
        : 0;

      const avgSqFt = sqFts.length > 0
        ? sqFts.reduce((sum, s) => sum + s, 0) / sqFts.length
        : 0;

      const avgPricePerSqFt = avgSqFt > 0 ? avgRent / avgSqFt : 0;

      // Calculate distribution (quartiles)
      const q1 = sortedRents[Math.floor(sortedRents.length * 0.25)] || 0;
      const q3 = sortedRents[Math.floor(sortedRents.length * 0.75)] || 0;

      // Amenity prevalence
      const amenityCounts: Record<string, number> = {};
      matchingProperties.forEach(p => {
        if (p.amenities && typeof p.amenities === 'object') {
          Object.keys(p.amenities).forEach(amenity => {
            amenityCounts[amenity] = (amenityCounts[amenity] || 0) + 1;
          });
        }
      });

      const topAmenities = Object.entries(amenityCounts)
        .map(([amenity, count]) => ({
          amenity,
          prevalence: Math.round((count / matchingProperties.length) * 100),
        }))
        .sort((a, b) => b.prevalence - a.prevalence)
        .slice(0, 10);

      res.json({
        location: {
          city: city as string,
          state: state as string,
        },
        filters: {
          bedrooms: bedrooms ? parseInt(bedrooms as string) : null,
          minSqFt: minSqFt ? parseInt(minSqFt as string) : null,
          maxSqFt: maxSqFt ? parseInt(maxSqFt as string) : null,
        },
        sampleSize: matchingProperties.length,
        pricing: {
          median: Math.round(median),
          average: Math.round(avgRent),
          min: sortedRents[0] || 0,
          max: sortedRents[sortedRents.length - 1] || 0,
          q1: Math.round(q1),
          q3: Math.round(q3),
          pricePerSqFt: parseFloat(avgPricePerSqFt.toFixed(2)),
        },
        topAmenities,
        generatedAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Error fetching market benchmark:", error);
      res.status(500).json({ error: "Failed to fetch market benchmark" });
    }
  });

  /**
   * GET /api/landlord/analytics/pricing
   * Get pricing analysis for landlord's properties
   */
  app.get("/api/landlord/analytics/pricing", authMiddleware, async (req, res) => {
    try {
      const { city, state, bedrooms } = req.query;

      // Fetch all properties for comparison
      const filters: any = { limit: 200 };
      if (city) filters.city = city as string;
      if (state) filters.state = state as string;
      if (bedrooms) filters.bedrooms = parseInt(bedrooms as string);

      const allProperties = await storage.getProperties(filters);

      if (allProperties.length === 0) {
        return res.status(404).json({ 
          error: "No properties found for analysis" 
        });
      }

      // Calculate market averages by bedroom count
      const byBedroom: Record<number, { rents: number[]; sqFts: number[] }> = {};

      allProperties.forEach(prop => {
        const bedrooms = prop.bedroomsMin || 0;
        const avgRent = prop.minPrice && prop.maxPrice 
          ? (prop.minPrice + prop.maxPrice) / 2 
          : prop.minPrice || prop.maxPrice || 0;
        
        const avgSqFt = prop.squareFeetMin && prop.squareFeetMax
          ? (prop.squareFeetMin + prop.squareFeetMax) / 2
          : prop.squareFeetMin || prop.squareFeetMax || 0;

        if (!byBedroom[bedrooms]) {
          byBedroom[bedrooms] = { rents: [], sqFts: [] };
        }

        if (avgRent > 0) byBedroom[bedrooms].rents.push(avgRent);
        if (avgSqFt > 0) byBedroom[bedrooms].sqFts.push(avgSqFt);
      });

      // Calculate statistics for each bedroom count
      const pricingByBedroom = Object.entries(byBedroom).map(([bedCount, data]) => {
        const sortedRents = data.rents.sort((a, b) => a - b);
        const median = sortedRents.length > 0
          ? sortedRents.length % 2 === 0
            ? (sortedRents[sortedRents.length / 2 - 1] + sortedRents[sortedRents.length / 2]) / 2
            : sortedRents[Math.floor(sortedRents.length / 2)]
          : 0;

        const avg = data.rents.length > 0
          ? data.rents.reduce((sum, r) => sum + r, 0) / data.rents.length
          : 0;

        const avgSqFt = data.sqFts.length > 0
          ? data.sqFts.reduce((sum, s) => sum + s, 0) / data.sqFts.length
          : 0;

        const pricePerSqFt = avgSqFt > 0 ? avg / avgSqFt : 0;

        return {
          bedrooms: parseInt(bedCount),
          sampleSize: data.rents.length,
          median: Math.round(median),
          average: Math.round(avg),
          min: sortedRents[0] || 0,
          max: sortedRents[sortedRents.length - 1] || 0,
          avgSqFt: Math.round(avgSqFt),
          pricePerSqFt: parseFloat(pricePerSqFt.toFixed(2)),
        };
      }).sort((a, b) => a.bedrooms - b.bedrooms);

      // Overall market statistics
      const allRents = allProperties
        .map(p => {
          const avg = p.minPrice && p.maxPrice 
            ? (p.minPrice + p.maxPrice) / 2 
            : p.minPrice || p.maxPrice || 0;
          return avg;
        })
        .filter(r => r > 0);

      const sortedAllRents = allRents.sort((a, b) => a - b);
      const overallMedian = sortedAllRents.length > 0
        ? sortedAllRents.length % 2 === 0
          ? (sortedAllRents[sortedAllRents.length / 2 - 1] + sortedAllRents[sortedAllRents.length / 2]) / 2
          : sortedAllRents[Math.floor(sortedAllRents.length / 2)]
        : 0;

      const overallAvg = allRents.length > 0
        ? allRents.reduce((sum, r) => sum + r, 0) / allRents.length
        : 0;

      res.json({
        location: {
          city: city as string || 'All',
          state: state as string || 'All',
        },
        overallMarket: {
          totalProperties: allProperties.length,
          medianRent: Math.round(overallMedian),
          avgRent: Math.round(overallAvg),
          minRent: sortedAllRents[0] || 0,
          maxRent: sortedAllRents[sortedAllRents.length - 1] || 0,
        },
        pricingByBedroom,
        insights: {
          mostCommonBedrooms: pricingByBedroom.reduce((max, curr) => 
            curr.sampleSize > max.sampleSize ? curr : max, 
            pricingByBedroom[0] || { bedrooms: 0, sampleSize: 0 }
          ).bedrooms,
          priceRange: {
            lowest: sortedAllRents[0] || 0,
            highest: sortedAllRents[sortedAllRents.length - 1] || 0,
            spread: (sortedAllRents[sortedAllRents.length - 1] || 0) - (sortedAllRents[0] || 0),
          },
        },
        generatedAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Error analyzing pricing:", error);
      res.status(500).json({ error: "Failed to analyze pricing" });
    }
  });

  /**
   * GET /api/landlord/analytics/occupancy
   * Get occupancy trends and statistics
   */
  app.get("/api/landlord/analytics/occupancy", authMiddleware, async (req, res) => {
    try {
      const { city, state, days = 30 } = req.query;

      // Fetch market snapshots for trend analysis
      if (!city || !state) {
        return res.status(400).json({ 
          error: "City and state are required for occupancy analysis" 
        });
      }

      const snapshots = await storage.getMarketSnapshots(
        city as string, 
        state as string, 
        parseInt(days as string)
      );

      if (snapshots.length === 0) {
        return res.status(404).json({ 
          error: "No market data found for this location" 
        });
      }

      // Sort snapshots by date
      const sortedSnapshots = snapshots.sort((a, b) => 
        new Date(a.snapshotDate).getTime() - new Date(b.snapshotDate).getTime()
      );

      // Calculate trends
      const inventoryTrend = sortedSnapshots.map(s => ({
        date: s.snapshotDate,
        activeListings: s.activeListings,
        newListings: s.newListings7d,
      }));

      // Calculate velocity (how fast units are getting occupied)
      const avgDaysOnMarket = sortedSnapshots.map(s => ({
        date: s.snapshotDate,
        days: Number(s.avgDaysOnMarket) || 0,
      }));

      // Calculate current vs historical averages
      const currentSnapshot = sortedSnapshots[sortedSnapshots.length - 1];
      const historicalAvgListings = sortedSnapshots.length > 1
        ? sortedSnapshots.slice(0, -1).reduce((sum, s) => sum + (s.activeListings || 0), 0) / (sortedSnapshots.length - 1)
        : currentSnapshot.activeListings || 0;

      const listingChange = currentSnapshot.activeListings && historicalAvgListings > 0
        ? ((currentSnapshot.activeListings - historicalAvgListings) / historicalAvgListings) * 100
        : 0;

      // Determine market health
      let marketHealth: 'hot' | 'balanced' | 'slow';
      const currentDaysOnMarket = Number(currentSnapshot.avgDaysOnMarket) || 0;
      if (currentDaysOnMarket < 15) marketHealth = 'hot';
      else if (currentDaysOnMarket < 30) marketHealth = 'balanced';
      else marketHealth = 'slow';

      res.json({
        location: {
          city: city as string,
          state: state as string,
        },
        currentStatus: {
          activeListings: currentSnapshot.activeListings || 0,
          newListingsLast7Days: currentSnapshot.newListings7d || 0,
          newListingsLast30Days: currentSnapshot.newListings30d || 0,
          avgDaysOnMarket: currentDaysOnMarket,
          marketHealth,
        },
        trends: {
          inventoryTrend,
          avgDaysOnMarketTrend: avgDaysOnMarket,
          listingChangePercent: parseFloat(listingChange.toFixed(2)),
        },
        insights: {
          inventoryDirection: listingChange > 5 ? 'increasing' : listingChange < -5 ? 'decreasing' : 'stable',
          competitionLevel: currentSnapshot.activeListings && currentSnapshot.activeListings > historicalAvgListings 
            ? 'high' 
            : currentSnapshot.activeListings && currentSnapshot.activeListings < historicalAvgListings 
            ? 'low' 
            : 'moderate',
          recommendation: marketHealth === 'hot' 
            ? 'Strong rental market. Consider raising rents or reducing concessions.'
            : marketHealth === 'slow'
            ? 'Slow market. Consider competitive pricing or offering concessions.'
            : 'Balanced market. Maintain current strategy.',
        },
        periodDays: parseInt(days as string),
        generatedAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Error analyzing occupancy:", error);
      res.status(500).json({ error: "Failed to analyze occupancy trends" });
    }
  });

  /**
   * GET /api/landlord/analytics/competition
   * Analyze competition for landlord properties
   */
  app.get("/api/landlord/analytics/competition", authMiddleware, async (req, res) => {
    try {
      const { propertyId, radius = 1, bedrooms } = req.query;

      if (!propertyId) {
        return res.status(400).json({ error: "Property ID is required" });
      }

      // Fetch the main property
      const property = await storage.getPropertyById(propertyId as string);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }

      // Fetch competing properties in the same city/state
      const filters: any = {
        city: property.city,
        state: property.state,
        limit: 100,
      };

      if (bedrooms) {
        filters.bedrooms = parseInt(bedrooms as string);
      } else if (property.bedroomsMin) {
        filters.bedrooms = property.bedroomsMin;
      }

      const competingProperties = await storage.getProperties(filters);

      // Filter out the property itself
      const competitors = competingProperties.filter(p => p.id !== property.id);

      if (competitors.length === 0) {
        return res.status(404).json({ 
          error: "No competing properties found in this market" 
        });
      }

      // Calculate competitive metrics
      const propertyRent = property.minPrice && property.maxPrice
        ? (property.minPrice + property.maxPrice) / 2
        : property.minPrice || property.maxPrice || 0;

      const competitorAnalysis = competitors.map(comp => {
        const compRent = comp.minPrice && comp.maxPrice
          ? (comp.minPrice + comp.maxPrice) / 2
          : comp.minPrice || comp.maxPrice || 0;

        const priceDiff = compRent - propertyRent;
        const priceDiffPercent = propertyRent > 0 ? (priceDiff / propertyRent) * 100 : 0;

        return {
          id: comp.id,
          name: comp.name,
          address: comp.address,
          rent: compRent,
          priceDifference: Math.round(priceDiff),
          priceDifferencePercent: parseFloat(priceDiffPercent.toFixed(2)),
          bedrooms: comp.bedroomsMin || 0,
          bathrooms: Number(comp.bathroomsMin) || 0,
          squareFeet: comp.squareFeetMin || 0,
          cheaper: compRent < propertyRent,
        };
      }).sort((a, b) => a.priceDifference - b.priceDifference);

      // Calculate market position
      const cheaperCount = competitorAnalysis.filter(c => c.cheaper).length;
      const marketPosition = competitors.length > 0
        ? Math.round((cheaperCount / competitors.length) * 100)
        : 50;

      // Price distribution
      const allRents = [propertyRent, ...competitorAnalysis.map(c => c.rent)].filter(r => r > 0);
      const sortedRents = allRents.sort((a, b) => a - b);
      const median = sortedRents.length > 0
        ? sortedRents.length % 2 === 0
          ? (sortedRents[sortedRents.length / 2 - 1] + sortedRents[sortedRents.length / 2]) / 2
          : sortedRents[Math.floor(sortedRents.length / 2)]
        : 0;

      res.json({
        property: {
          id: property.id,
          name: property.name,
          address: property.address,
          rent: propertyRent,
          bedrooms: property.bedroomsMin || 0,
          bathrooms: Number(property.bathroomsMin) || 0,
        },
        competitionSummary: {
          totalCompetitors: competitors.length,
          cheaperCompetitors: cheaperCount,
          moreExpensiveCompetitors: competitors.length - cheaperCount,
          marketPositionPercentile: marketPosition,
          medianCompetitorRent: Math.round(median),
        },
        competitors: competitorAnalysis.slice(0, 20), // Top 20 closest competitors
        priceInsights: {
          lowestCompetitorRent: competitorAnalysis[0]?.rent || 0,
          highestCompetitorRent: competitorAnalysis[competitorAnalysis.length - 1]?.rent || 0,
          avgCompetitorRent: competitors.length > 0
            ? Math.round(competitorAnalysis.reduce((sum, c) => sum + c.rent, 0) / competitors.length)
            : 0,
          yourPositioning: marketPosition >= 75 
            ? 'premium' 
            : marketPosition <= 25 
            ? 'value' 
            : 'mid-market',
        },
        recommendation: marketPosition >= 75
          ? 'Your property is priced in the top 25% of the market. Ensure amenities justify premium pricing.'
          : marketPosition <= 25
          ? 'Your property is priced in the bottom 25% of the market. Consider raising rent or highlighting unique value.'
          : 'Your property is competitively priced in the middle of the market.',
        generatedAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error("Error analyzing competition:", error);
      res.status(500).json({ error: "Failed to analyze competition" });
    }
  });

  // ============================================
  // PRICING ALERTS ENDPOINTS
  // ============================================

  // GET /api/alerts - List alerts for authenticated user
  app.get("/api/alerts", authMiddleware, async (req, res) => {
    try {
      const { unreadOnly, type, severity, limit, offset } = req.query;
      
      const result = await storage.getAlerts(req.user!.id, {
        unreadOnly: unreadOnly === 'true',
        type: type as string,
        severity: severity as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // PATCH /api/alerts/:id - Mark alert as read
  app.patch("/api/alerts/:id", authMiddleware, async (req, res) => {
    try {
      const alert = await storage.markAlertAsRead(req.params.id, req.user!.id);
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      console.error("Error marking alert as read:", error);
      res.status(500).json({ error: "Failed to mark alert as read" });
    }
  });

  // DELETE /api/alerts/:id - Delete alert
  app.delete("/api/alerts/:id", authMiddleware, async (req, res) => {
    try {
      await storage.deleteAlert(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting alert:", error);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  // GET /api/alert-preferences - Get alert preferences
  app.get("/api/alert-preferences", authMiddleware, async (req, res) => {
    try {
      const prefs = await storage.getAlertPreferences(req.user!.id);
      
      // Return default preferences if none exist
      if (!prefs) {
        return res.json({
          userId: req.user!.id,
          priceChanges: true,
          concessions: true,
          vacancyRisk: true,
          marketTrends: true,
          deliveryEmail: true,
          deliverySms: false,
          deliveryInapp: true,
          deliveryPush: false,
          frequency: "realtime",
          priceThreshold: 50.00,
          vacancyThreshold: 30,
        });
      }
      
      res.json(prefs);
    } catch (error) {
      console.error("Error fetching alert preferences:", error);
      res.status(500).json({ error: "Failed to fetch alert preferences" });
    }
  });

  // PATCH /api/alert-preferences - Update alert preferences
  app.patch("/api/alert-preferences", authMiddleware, async (req, res) => {
    try {
      const schema = z.object({
        priceChanges: z.boolean().optional(),
        concessions: z.boolean().optional(),
        vacancyRisk: z.boolean().optional(),
        marketTrends: z.boolean().optional(),
        deliveryEmail: z.boolean().optional(),
        deliverySms: z.boolean().optional(),
        deliveryInapp: z.boolean().optional(),
        deliveryPush: z.boolean().optional(),
        frequency: z.enum(["realtime", "daily", "weekly"]).optional(),
        quietHoursStart: z.string().optional(),
        quietHoursEnd: z.string().optional(),
        priceThreshold: z.number().or(z.string()).optional(),
        vacancyThreshold: z.number().optional(),
      });
      
      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid preferences data", 
          details: parseResult.error.errors 
        });
      }
      
      const prefs = await storage.upsertAlertPreferences({
        userId: req.user!.id,
        ...parseResult.data,
      });
      
      res.json(prefs);
    } catch (error) {
      console.error("Error updating alert preferences:", error);
      res.status(500).json({ error: "Failed to update alert preferences" });
    }
  });

  // POST /api/alerts/generate - Manual alert generation (for testing)
  app.post("/api/alerts/generate", authMiddleware, async (req, res) => {
    try {
      const generatedAlerts: any[] = [];
      
      // Get user's competition sets
      const { sets } = await storage.getCompetitionSets(req.user!.id);
      
      // Get alert preferences
      const prefs = await storage.getAlertPreferences(req.user!.id);
      
      // If alerts are disabled globally, return early
      if (prefs && !prefs.priceChanges && !prefs.concessions && !prefs.vacancyRisk && !prefs.marketTrends) {
        return res.json({ 
          message: "Alert generation skipped - all alert types disabled",
          generated: 0,
          alerts: []
        });
      }
      
      // Generate alerts for each competition set
      for (const set of sets) {
        if (!set.alertsEnabled) continue;
        
        // Get competitors for this set
        const competitors = await storage.getCompetitorsForSet(set.id);
        
        // Price change detection (sample logic)
        if (prefs?.priceChanges !== false) {
          for (const competitor of competitors) {
            // Mock: Generate a random price change alert
            if (Math.random() > 0.7 && competitor.currentRent) {
              const oldPrice = Number(competitor.currentRent);
              const newPrice = oldPrice - Math.floor(Math.random() * 200);
              const priceDiff = oldPrice - newPrice;
              
              if (priceDiff >= Number(prefs?.priceThreshold || 50)) {
                const alert = await storage.createAlert({
                  userId: req.user!.id,
                  propertyId: set.ownPropertyIds[0] as any, // Associate with first own property
                  competitorId: competitor.propertyId as any,
                  alertType: "price_change",
                  severity: priceDiff > 200 ? "critical" : "warning",
                  title: "Competitor Price Drop Detected",
                  message: `${competitor.address} dropped rent from $${oldPrice.toFixed(0)} to $${newPrice.toFixed(0)} (-$${priceDiff.toFixed(0)})`,
                  metadata: {
                    competitorId: competitor.id,
                    competitorAddress: competitor.address,
                    oldPrice,
                    newPrice,
                    priceDiff,
                    setId: set.id,
                    setName: set.name,
                  },
                  actionUrl: `/landlord/comparison?competitorId=${competitor.id}`,
                });
                generatedAlerts.push(alert);
              }
            }
          }
        }
        
        // Concession detection
        if (prefs?.concessions !== false) {
          for (const competitor of competitors) {
            // Mock: Generate concession alert for competitors with concessions
            if (competitor.concessions && Array.isArray(competitor.concessions) && competitor.concessions.length > 0) {
              if (Math.random() > 0.8) {
                const concession = competitor.concessions[0];
                const alert = await storage.createAlert({
                  userId: req.user!.id,
                  propertyId: set.ownPropertyIds[0] as any,
                  competitorId: competitor.propertyId as any,
                  alertType: "concession",
                  severity: "info",
                  title: "New Concession Detected",
                  message: `${competitor.address} is now offering: ${concession.description}`,
                  metadata: {
                    competitorId: competitor.id,
                    competitorAddress: competitor.address,
                    concessions: competitor.concessions,
                    setId: set.id,
                    setName: set.name,
                  },
                  actionUrl: `/landlord/comparison?competitorId=${competitor.id}`,
                });
                generatedAlerts.push(alert);
              }
            }
          }
        }
        
        // Vacancy risk alerts (check own properties)
        if (prefs?.vacancyRisk !== false && set.ownPropertyIds && set.ownPropertyIds.length > 0) {
          for (const propertyId of set.ownPropertyIds) {
            const property = await storage.getPropertyById(propertyId);
            if (property) {
              // Mock vacancy risk calculation
              const daysVacant = (property as any).daysVacant || 0;
              const vacancyThreshold = prefs?.vacancyThreshold || 30;
              
              if (daysVacant > vacancyThreshold && Math.random() > 0.6) {
                const alert = await storage.createAlert({
                  userId: req.user!.id,
                  propertyId: propertyId as any,
                  alertType: "vacancy_risk",
                  severity: daysVacant > 60 ? "critical" : "warning",
                  title: "High Vacancy Risk",
                  message: `${property.address} has been vacant for ${daysVacant} days. Consider adjusting pricing or offering concessions.`,
                  metadata: {
                    propertyId,
                    propertyAddress: property.address,
                    daysVacant,
                    setId: set.id,
                    setName: set.name,
                  },
                  actionUrl: `/landlord/properties/${propertyId}`,
                });
                generatedAlerts.push(alert);
              }
            }
          }
        }
      }
      
      // Market trend alerts (mock)
      if (prefs?.marketTrends !== false && Math.random() > 0.7) {
        const alert = await storage.createAlert({
          userId: req.user!.id,
          alertType: "market_trend",
          severity: "info",
          title: "Market Trend Alert",
          message: "Average rent in your market decreased by 3.2% this month. Consider reviewing your pricing strategy.",
          metadata: {
            trendChange: -3.2,
            period: "monthly",
          },
          actionUrl: `/landlord/market-intelligence`,
        });
        generatedAlerts.push(alert);
      }
      
      res.json({
        message: "Alert generation complete",
        generated: generatedAlerts.length,
        alerts: generatedAlerts,
      });
    } catch (error) {
      console.error("Error generating alerts:", error);
      res.status(500).json({ error: "Failed to generate alerts" });
    }
  });

  // ============================================
  // END PRICING ALERTS ENDPOINTS
  // ============================================

  // ============================================
  // AGENT LEAD MANAGEMENT ENDPOINTS
  // ============================================

  /**
   * POST /api/agent/leads
   * Capture a new lead from a form submission
   */
  app.post("/api/agent/leads", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const schema = z.object({
        firstName: z.string().min(1).max(255),
        lastName: z.string().min(1).max(255),
        email: z.string().email().max(255),
        phone: z.string().max(50).optional(),
        leadSource: z.string().min(1).max(100),
        propertyInterest: z.string().max(500).optional(),
        propertyId: z.string().uuid().optional(),
        budgetMin: z.number().int().min(0).optional(),
        budgetMax: z.number().int().min(0).optional(),
        preferredLocations: z.array(z.string()).default([]),
        bedrooms: z.number().int().min(0).optional(),
        bathrooms: z.number().min(0).optional(),
        moveInDate: z.string().datetime().optional(),
        timeline: z.enum(['immediate', '1-3months', '3-6months', '6+months']).optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).default([]),
        metadata: z.record(z.unknown()).optional(),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid lead data", 
          details: parseResult.error.errors 
        });
      }

      const leadData = {
        ...parseResult.data,
        agentId: req.user!.id,
        moveInDate: parseResult.data.moveInDate ? new Date(parseResult.data.moveInDate) : undefined,
      };

      const lead = await storage.createLead(leadData);
      
      res.status(201).json({ 
        lead,
        message: "Lead captured successfully"
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  /**
   * GET /api/agent/leads
   * List and filter leads for the authenticated agent
   */
  app.get("/api/agent/leads", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const {
        status,
        leadSource,
        search,
        minScore,
        maxScore,
        tags,
        sortBy,
        sortOrder,
        limit,
        offset,
      } = req.query;

      const options: any = {
        status: status as string,
        leadSource: leadSource as string,
        search: search as string,
        minScore: minScore ? parseInt(minScore as string) : undefined,
        maxScore: maxScore ? parseInt(maxScore as string) : undefined,
        tags: tags ? (Array.isArray(tags) ? tags : [tags]) as string[] : undefined,
        sortBy: (sortBy as 'leadScore' | 'createdAt' | 'lastContactedAt' | 'nextFollowUpAt') || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
      };

      const result = await storage.getLeads(req.user!.id, options);
      
      res.json({
        leads: result.leads,
        total: result.total,
        limit: options.limit,
        offset: options.offset,
      });
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  /**
   * GET /api/agent/leads/:id
   * Get a specific lead by ID
   */
  app.get("/api/agent/leads/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const lead = await storage.getLeadById(req.params.id, req.user!.id);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  /**
   * PATCH /api/agent/leads/:id
   * Update lead status and details
   */
  app.patch("/api/agent/leads/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const schema = z.object({
        firstName: z.string().min(1).max(255).optional(),
        lastName: z.string().min(1).max(255).optional(),
        email: z.string().email().max(255).optional(),
        phone: z.string().max(50).optional(),
        status: z.enum(['new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost']).optional(),
        leadSource: z.string().min(1).max(100).optional(),
        propertyInterest: z.string().max(500).optional(),
        propertyId: z.string().uuid().optional(),
        budgetMin: z.number().int().min(0).optional(),
        budgetMax: z.number().int().min(0).optional(),
        preferredLocations: z.array(z.string()).optional(),
        bedrooms: z.number().int().min(0).optional(),
        bathrooms: z.number().min(0).optional(),
        moveInDate: z.string().datetime().optional(),
        timeline: z.enum(['immediate', '1-3months', '3-6months', '6+months']).optional(),
        lastContactedAt: z.string().datetime().optional(),
        nextFollowUpAt: z.string().datetime().optional(),
        followUpCount: z.number().int().optional(),
        autoFollowUpEnabled: z.boolean().optional(),
        totalInteractions: z.number().int().optional(),
        emailsSent: z.number().int().optional(),
        emailsOpened: z.number().int().optional(),
        propertiesViewed: z.number().int().optional(),
        tourScheduled: z.boolean().optional(),
        tourDate: z.string().datetime().optional(),
        estimatedValue: z.number().int().optional(),
        notes: z.string().optional(),
        tags: z.array(z.string()).optional(),
        lostReason: z.string().max(255).optional(),
        metadata: z.record(z.unknown()).optional(),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid update data", 
          details: parseResult.error.errors 
        });
      }

      const updateData: any = { ...parseResult.data };
      
      // Convert date strings to Date objects
      if (updateData.moveInDate) {
        updateData.moveInDate = new Date(updateData.moveInDate);
      }
      if (updateData.lastContactedAt) {
        updateData.lastContactedAt = new Date(updateData.lastContactedAt);
      }
      if (updateData.nextFollowUpAt) {
        updateData.nextFollowUpAt = new Date(updateData.nextFollowUpAt);
      }
      if (updateData.tourDate) {
        updateData.tourDate = new Date(updateData.tourDate);
      }
      
      // If status is being changed to 'lost', set lostAt timestamp
      if (updateData.status === 'lost') {
        updateData.lostAt = new Date();
      }

      const lead = await storage.updateLead(
        req.params.id, 
        req.user!.id, 
        updateData
      );
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  /**
   * POST /api/agent/leads/:id/convert
   * Convert a lead to a client
   */
  app.post("/api/agent/leads/:id/convert", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const result = await storage.convertLeadToClient(
        req.params.id,
        req.user!.id
      );
      
      res.json({
        message: "Lead successfully converted to client",
        lead: result.lead,
        client: result.client,
      });
    } catch (error) {
      console.error("Error converting lead:", error);
      if (error instanceof Error && error.message === "Lead not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to convert lead" });
    }
  });

  /**
   * DELETE /api/agent/leads/:id
   * Delete a lead
   */
  app.delete("/api/agent/leads/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      // Verify the lead exists before deleting
      const lead = await storage.getLeadById(req.params.id, req.user!.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }

      await storage.deleteLead(req.params.id, req.user!.id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  /**
   * GET /api/agent/leads/sources
   * Get lead source analytics (conversion rates, average scores)
   */
  app.get("/api/agent/leads/sources", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const sources = await storage.getLeadSources(req.user!.id);
      
      // Calculate totals
      const totalLeads = sources.reduce((sum, s) => sum + s.count, 0);
      const totalConverted = sources.reduce((sum, s) => 
        sum + Math.round((s.count * s.conversionRate) / 100), 0
      );
      const overallConversionRate = totalLeads > 0 
        ? Math.round((totalConverted / totalLeads) * 100) 
        : 0;

      // Sort by count descending
      const sortedSources = sources.sort((a, b) => b.count - a.count);

      res.json({
        sources: sortedSources,
        summary: {
          totalLeads,
          totalConverted,
          overallConversionRate,
          topSource: sortedSources[0] || null,
          highestConversionSource: sources.reduce((max, s) => 
            s.conversionRate > (max?.conversionRate || 0) ? s : max, 
            sources[0] || null
          ),
        },
      });
    } catch (error) {
      console.error("Error fetching lead sources:", error);
      res.status(500).json({ error: "Failed to fetch lead sources" });
    }
  });

  // ============================================
  // END AGENT LEAD MANAGEMENT ENDPOINTS
  // ============================================

  // ============================================
  // AGENT COMMISSION CALCULATOR & ANALYTICS ENDPOINTS
  // ============================================

  /**
   * POST /api/agent/commission/calculate
   * Calculate commission with splits
   */
  app.post("/api/agent/commission/calculate", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const schema = z.object({
        transactionType: z.enum(['sale', 'rental', 'lease']),
        propertyValue: z.number().positive(),
        rentalMonths: z.number().int().positive().optional(),
        commissionRate: z.number().min(0).max(100),
        commissionType: z.enum(['percentage', 'flat_fee']),
        flatFeeAmount: z.number().min(0).optional(),
        splits: z.array(z.object({
          agentName: z.string(),
          percentage: z.number().min(0).max(100),
          role: z.enum(['listing_agent', 'buyer_agent', 'referral', 'team_lead', 'brokerage']),
        })).optional(),
        expenses: z.array(z.object({
          description: z.string(),
          amount: z.number().min(0),
          category: z.string().optional(),
        })).optional(),
        bonuses: z.array(z.object({
          description: z.string(),
          amount: z.number().min(0),
        })).optional(),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid commission calculation data", 
          details: parseResult.error.errors 
        });
      }

      const data = parseResult.data;

      // Calculate base commission
      let baseCommission: number;
      if (data.commissionType === 'flat_fee') {
        baseCommission = data.flatFeeAmount || 0;
      } else {
        // For rental/lease, calculate based on monthly rent * number of months
        const calculationBase = data.transactionType === 'sale' 
          ? data.propertyValue 
          : data.propertyValue * (data.rentalMonths || 1);
        baseCommission = (calculationBase * data.commissionRate) / 100;
      }

      // Calculate splits
      let splits: any[] = [];
      let totalSplitPercentage = 0;
      
      if (data.splits && data.splits.length > 0) {
        // Validate total split percentage
        totalSplitPercentage = data.splits.reduce((sum, split) => sum + split.percentage, 0);
        
        if (Math.abs(totalSplitPercentage - 100) > 0.01) {
          return res.status(400).json({ 
            error: `Split percentages must total 100%. Current total: ${totalSplitPercentage.toFixed(2)}%` 
          });
        }

        splits = data.splits.map(split => ({
          ...split,
          amount: (baseCommission * split.percentage) / 100,
        }));
      } else {
        // Default: 100% to requesting agent
        splits = [{
          agentName: req.user!.name || req.user!.email,
          percentage: 100,
          role: 'listing_agent',
          amount: baseCommission,
        }];
      }

      // Calculate expenses
      const totalExpenses = data.expenses 
        ? data.expenses.reduce((sum, exp) => sum + exp.amount, 0) 
        : 0;

      // Calculate bonuses
      const totalBonuses = data.bonuses 
        ? data.bonuses.reduce((sum, bonus) => sum + bonus.amount, 0) 
        : 0;

      // Net commission
      const netCommission = baseCommission + totalBonuses - totalExpenses;

      // Commission breakdown by role
      const breakdownByRole = splits.reduce((acc: any, split) => {
        if (!acc[split.role]) {
          acc[split.role] = {
            totalAmount: 0,
            agents: [],
          };
        }
        acc[split.role].totalAmount += split.amount;
        acc[split.role].agents.push({
          name: split.agentName,
          percentage: split.percentage,
          amount: split.amount,
        });
        return acc;
      }, {});

      // Calculate effective commission rate
      const effectiveRate = data.transactionType === 'sale'
        ? (baseCommission / data.propertyValue) * 100
        : (baseCommission / (data.propertyValue * (data.rentalMonths || 1))) * 100;

      const result = {
        calculation: {
          transactionType: data.transactionType,
          propertyValue: data.propertyValue,
          rentalMonths: data.rentalMonths,
          commissionRate: data.commissionRate,
          commissionType: data.commissionType,
          baseCommission: parseFloat(baseCommission.toFixed(2)),
          totalExpenses: parseFloat(totalExpenses.toFixed(2)),
          totalBonuses: parseFloat(totalBonuses.toFixed(2)),
          netCommission: parseFloat(netCommission.toFixed(2)),
          effectiveRate: parseFloat(effectiveRate.toFixed(4)),
        },
        splits: splits.map(split => ({
          ...split,
          amount: parseFloat(split.amount.toFixed(2)),
        })),
        breakdownByRole,
        expenses: data.expenses || [],
        bonuses: data.bonuses || [],
        summary: {
          grossCommission: parseFloat(baseCommission.toFixed(2)),
          netToAgent: parseFloat(netCommission.toFixed(2)),
          totalDeductions: parseFloat(totalExpenses.toFixed(2)),
          totalAdditions: parseFloat(totalBonuses.toFixed(2)),
          numberOfSplits: splits.length,
        },
        calculatedAt: new Date().toISOString(),
      };

      res.json(result);
    } catch (error) {
      console.error("Error calculating commission:", error);
      res.status(500).json({ error: "Failed to calculate commission" });
    }
  });

  /**
   * GET /api/agent/commission/templates
   * List saved commission templates
   */
  app.get("/api/agent/commission/templates", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      // For now, return mock templates (you can implement storage.getCommissionTemplates later)
      const templates = [
        {
          id: "template-1",
          userId: req.user!.id,
          name: "Standard Sale - 50/50 Split",
          description: "Standard sale commission with 50/50 buyer/seller split",
          transactionType: "sale",
          commissionRate: 6.0,
          commissionType: "percentage",
          splits: [
            {
              agentName: "Listing Agent",
              percentage: 50,
              role: "listing_agent",
            },
            {
              agentName: "Buyer Agent",
              percentage: 50,
              role: "buyer_agent",
            },
          ],
          isDefault: true,
          usageCount: 42,
          createdAt: new Date("2024-01-15").toISOString(),
          updatedAt: new Date("2024-01-15").toISOString(),
        },
        {
          id: "template-2",
          userId: req.user!.id,
          name: "Rental - 1 Month Fee",
          description: "Standard rental commission - one month's rent",
          transactionType: "rental",
          commissionRate: 100,
          commissionType: "percentage",
          rentalMonths: 1,
          splits: [
            {
              agentName: "Agent",
              percentage: 80,
              role: "listing_agent",
            },
            {
              agentName: "Brokerage",
              percentage: 20,
              role: "brokerage",
            },
          ],
          isDefault: false,
          usageCount: 18,
          createdAt: new Date("2024-01-20").toISOString(),
          updatedAt: new Date("2024-01-20").toISOString(),
        },
        {
          id: "template-3",
          userId: req.user!.id,
          name: "Luxury Sale - Team Lead",
          description: "High-value sale with team lead commission",
          transactionType: "sale",
          commissionRate: 5.0,
          commissionType: "percentage",
          splits: [
            {
              agentName: "Primary Agent",
              percentage: 60,
              role: "listing_agent",
            },
            {
              agentName: "Team Lead",
              percentage: 25,
              role: "team_lead",
            },
            {
              agentName: "Brokerage",
              percentage: 15,
              role: "brokerage",
            },
          ],
          isDefault: false,
          usageCount: 7,
          createdAt: new Date("2024-02-01").toISOString(),
          updatedAt: new Date("2024-02-01").toISOString(),
        },
      ];

      res.json({
        templates,
        total: templates.length,
      });
    } catch (error) {
      console.error("Error fetching commission templates:", error);
      res.status(500).json({ error: "Failed to fetch commission templates" });
    }
  });

  /**
   * POST /api/agent/commission/templates
   * Save a new commission template
   */
  app.post("/api/agent/commission/templates", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const schema = z.object({
        name: z.string().min(1).max(255),
        description: z.string().max(1000).optional(),
        transactionType: z.enum(['sale', 'rental', 'lease']),
        commissionRate: z.number().min(0).max(100),
        commissionType: z.enum(['percentage', 'flat_fee']),
        flatFeeAmount: z.number().min(0).optional(),
        rentalMonths: z.number().int().positive().optional(),
        splits: z.array(z.object({
          agentName: z.string(),
          percentage: z.number().min(0).max(100),
          role: z.enum(['listing_agent', 'buyer_agent', 'referral', 'team_lead', 'brokerage']),
        })),
        isDefault: z.boolean().optional(),
      });

      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid template data", 
          details: parseResult.error.errors 
        });
      }

      const data = parseResult.data;

      // Validate total split percentage
      const totalSplitPercentage = data.splits.reduce((sum, split) => sum + split.percentage, 0);
      if (Math.abs(totalSplitPercentage - 100) > 0.01) {
        return res.status(400).json({ 
          error: `Split percentages must total 100%. Current total: ${totalSplitPercentage.toFixed(2)}%` 
        });
      }

      // Create template (mock implementation - you can implement storage.createCommissionTemplate later)
      const template = {
        id: `template-${Date.now()}`,
        userId: req.user!.id,
        ...data,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating commission template:", error);
      res.status(500).json({ error: "Failed to create commission template" });
    }
  });

  /**
   * GET /api/agent/analytics/revenue
   * Revenue tracking for agent
   */
  app.get("/api/agent/analytics/revenue", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const { startDate, endDate, groupBy = 'month' } = req.query;

      // Parse dates
      const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
      const end = endDate ? new Date(endDate as string) : new Date();

      // Mock revenue data (you can implement storage.getAgentRevenue later)
      // Generate monthly revenue data
      const monthlyData = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        const month = currentDate.toISOString().substring(0, 7);
        
        // Mock data generation
        const salesCount = Math.floor(Math.random() * 5) + 1;
        const rentalsCount = Math.floor(Math.random() * 8) + 2;
        
        const salesRevenue = salesCount * (Math.random() * 15000 + 8000);
        const rentalsRevenue = rentalsCount * (Math.random() * 2000 + 1000);
        
        monthlyData.push({
          period: month,
          sales: {
            count: salesCount,
            totalCommission: parseFloat(salesRevenue.toFixed(2)),
            avgCommission: parseFloat((salesRevenue / salesCount).toFixed(2)),
          },
          rentals: {
            count: rentalsCount,
            totalCommission: parseFloat(rentalsRevenue.toFixed(2)),
            avgCommission: parseFloat((rentalsRevenue / rentalsCount).toFixed(2)),
          },
          total: {
            transactions: salesCount + rentalsCount,
            revenue: parseFloat((salesRevenue + rentalsRevenue).toFixed(2)),
          },
        });
        
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      // Calculate totals
      const totals = monthlyData.reduce((acc, month) => ({
        totalRevenue: acc.totalRevenue + month.total.revenue,
        totalTransactions: acc.totalTransactions + month.total.transactions,
        totalSales: acc.totalSales + month.sales.count,
        totalRentals: acc.totalRentals + month.rentals.count,
        salesRevenue: acc.salesRevenue + month.sales.totalCommission,
        rentalsRevenue: acc.rentalsRevenue + month.rentals.totalCommission,
      }), {
        totalRevenue: 0,
        totalTransactions: 0,
        totalSales: 0,
        totalRentals: 0,
        salesRevenue: 0,
        rentalsRevenue: 0,
      });

      // Calculate averages
      const avgMonthlyRevenue = monthlyData.length > 0 
        ? totals.totalRevenue / monthlyData.length 
        : 0;

      const avgTransactionValue = totals.totalTransactions > 0
        ? totals.totalRevenue / totals.totalTransactions
        : 0;

      // Year-over-year comparison
      const currentYear = new Date().getFullYear();
      const lastYearSameMonth = monthlyData.find(m => 
        m.period.startsWith(String(currentYear - 1))
      );
      
      const currentMonth = monthlyData[monthlyData.length - 1];
      const yoyGrowth = lastYearSameMonth && lastYearSameMonth.total.revenue > 0
        ? ((currentMonth.total.revenue - lastYearSameMonth.total.revenue) / lastYearSameMonth.total.revenue) * 100
        : 0;

      // Revenue composition
      const revenueComposition = {
        sales: {
          percentage: totals.totalRevenue > 0 
            ? (totals.salesRevenue / totals.totalRevenue) * 100 
            : 0,
          amount: totals.salesRevenue,
        },
        rentals: {
          percentage: totals.totalRevenue > 0 
            ? (totals.rentalsRevenue / totals.totalRevenue) * 100 
            : 0,
          amount: totals.rentalsRevenue,
        },
      };

      res.json({
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          groupBy: groupBy as string,
        },
        summary: {
          totalRevenue: parseFloat(totals.totalRevenue.toFixed(2)),
          totalTransactions: totals.totalTransactions,
          avgMonthlyRevenue: parseFloat(avgMonthlyRevenue.toFixed(2)),
          avgTransactionValue: parseFloat(avgTransactionValue.toFixed(2)),
          yoyGrowth: parseFloat(yoyGrowth.toFixed(2)),
        },
        composition: {
          sales: {
            count: totals.totalSales,
            revenue: parseFloat(totals.salesRevenue.toFixed(2)),
            percentage: parseFloat(revenueComposition.sales.percentage.toFixed(2)),
          },
          rentals: {
            count: totals.totalRentals,
            revenue: parseFloat(totals.rentalsRevenue.toFixed(2)),
            percentage: parseFloat(revenueComposition.rentals.percentage.toFixed(2)),
          },
        },
        timeline: monthlyData,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching revenue analytics:", error);
      res.status(500).json({ error: "Failed to fetch revenue analytics" });
    }
  });

  /**
   * GET /api/agent/analytics/pipeline
   * Pipeline metrics for agent
   */
  app.get("/api/agent/analytics/pipeline", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      // Mock pipeline data (you can implement storage.getAgentPipeline later)
      
      // Pipeline stages
      const stages = [
        {
          stage: "lead",
          name: "New Leads",
          count: 24,
          totalValue: 8750000,
          avgValue: 364583,
          avgDaysInStage: 3,
        },
        {
          stage: "qualified",
          name: "Qualified",
          count: 18,
          totalValue: 6200000,
          avgValue: 344444,
          avgDaysInStage: 7,
        },
        {
          stage: "showing",
          name: "Showing Scheduled",
          count: 12,
          totalValue: 4100000,
          avgValue: 341667,
          avgDaysInStage: 5,
        },
        {
          stage: "offer",
          name: "Offer Submitted",
          count: 6,
          totalValue: 2050000,
          avgValue: 341667,
          avgDaysInStage: 10,
        },
        {
          stage: "negotiation",
          name: "Under Negotiation",
          count: 4,
          totalValue: 1400000,
          avgValue: 350000,
          avgDaysInStage: 8,
        },
        {
          stage: "contract",
          name: "Under Contract",
          count: 3,
          totalValue: 1050000,
          avgValue: 350000,
          avgDaysInStage: 15,
        },
      ];

      // Calculate pipeline metrics
      const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0);
      const totalValue = stages.reduce((sum, stage) => sum + stage.totalValue, 0);
      const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

      // Conversion rates (mock data)
      const conversionRates = [
        {
          from: "lead",
          to: "qualified",
          rate: 75,
          avgDays: 3,
        },
        {
          from: "qualified",
          to: "showing",
          rate: 67,
          avgDays: 7,
        },
        {
          from: "showing",
          to: "offer",
          rate: 50,
          avgDays: 5,
        },
        {
          from: "offer",
          to: "contract",
          rate: 50,
          avgDays: 18,
        },
        {
          from: "contract",
          to: "closed",
          rate: 90,
          avgDays: 30,
        },
      ];

      // Overall conversion rate (lead to closed)
      const overallConversionRate = conversionRates.reduce((rate, conversion) => 
        rate * (conversion.rate / 100), 
        1
      ) * 100;

      // Forecast closed deals
      const forecastClosedDeals = Math.round(totalDeals * (overallConversionRate / 100));
      const forecastRevenue = totalValue * (overallConversionRate / 100);

      // Velocity metrics
      const avgDaysToClose = conversionRates.reduce((sum, conversion) => 
        sum + conversion.avgDays, 
        0
      );

      // Deal age distribution
      const ageDistribution = {
        fresh: Math.floor(totalDeals * 0.4), // < 7 days
        active: Math.floor(totalDeals * 0.35), // 7-30 days
        aging: Math.floor(totalDeals * 0.15), // 30-60 days
        stale: Math.floor(totalDeals * 0.1), // > 60 days
      };

      // Top properties in pipeline (mock data)
      const topProperties = [
        {
          id: "prop-1",
          address: "123 Main St, Boston, MA",
          stage: "contract",
          value: 450000,
          daysInPipeline: 42,
          probability: 90,
        },
        {
          id: "prop-2",
          address: "456 Oak Ave, Cambridge, MA",
          stage: "negotiation",
          value: 380000,
          daysInPipeline: 28,
          probability: 70,
        },
        {
          id: "prop-3",
          address: "789 Pine Rd, Somerville, MA",
          stage: "offer",
          value: 320000,
          daysInPipeline: 35,
          probability: 60,
        },
      ];

      res.json({
        summary: {
          totalDeals,
          totalValue: parseFloat(totalValue.toFixed(2)),
          avgDealValue: parseFloat(avgDealValue.toFixed(2)),
          overallConversionRate: parseFloat(overallConversionRate.toFixed(2)),
          avgDaysToClose,
        },
        stages,
        conversions: conversionRates,
        forecast: {
          expectedClosedDeals: forecastClosedDeals,
          expectedRevenue: parseFloat(forecastRevenue.toFixed(2)),
          confidence: 75,
        },
        velocity: {
          avgDaysToClose,
          ageDistribution,
        },
        topDeals: topProperties,
        insights: {
          bottleneck: "showing", // Stage with lowest conversion
          recommendation: "Focus on improving showing-to-offer conversion rate (currently 50%)",
          dealHealthScore: 78,
        },
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching pipeline analytics:", error);
      res.status(500).json({ error: "Failed to fetch pipeline analytics" });
    }
  });

  /**
   * GET /api/agent/reports/monthly
   * Monthly performance report for agent
   */
  app.get("/api/agent/reports/monthly", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const { year, month } = req.query;
      
      // Default to current month if not provided
      const reportDate = year && month 
        ? new Date(parseInt(year as string), parseInt(month as string) - 1, 1)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

      const reportYear = reportDate.getFullYear();
      const reportMonth = reportDate.getMonth() + 1;
      const monthName = reportDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      // Mock monthly performance data
      const closedDeals = {
        sales: {
          count: 3,
          totalVolume: 1050000,
          avgPrice: 350000,
          totalCommission: 31500,
          avgCommission: 10500,
        },
        rentals: {
          count: 7,
          totalVolume: 21000, // total monthly rent
          avgRent: 3000,
          totalCommission: 14700,
          avgCommission: 2100,
        },
        total: {
          deals: 10,
          volume: 1071000,
          commission: 46200,
        },
      };

      // Activity metrics
      const activities = {
        newLeads: 28,
        showingsScheduled: 42,
        showingsCompleted: 38,
        offersSubmitted: 8,
        offersAccepted: 5,
        contractsSigned: 10,
        dealsLost: 3,
        lossReasons: [
          { reason: "Price too high", count: 1 },
          { reason: "Property sold to another buyer", count: 1 },
          { reason: "Client changed mind", count: 1 },
        ],
      };

      // Performance metrics
      const performance = {
        conversionRate: {
          leadToShowing: (activities.showingsScheduled / activities.newLeads) * 100,
          showingToOffer: (activities.offersSubmitted / activities.showingsCompleted) * 100,
          offerToContract: (activities.contractsSigned / activities.offersSubmitted) * 100,
          overallLeadToClose: (closedDeals.total.deals / activities.newLeads) * 100,
        },
        avgDaysToClose: {
          sales: 42,
          rentals: 18,
          overall: 32,
        },
        clientSatisfaction: {
          avgRating: 4.7,
          reviewsReceived: 8,
          nps: 85,
        },
      };

      // Goals and targets
      const goals = {
        revenueGoal: 50000,
        revenueAchieved: closedDeals.total.commission,
        revenueProgress: (closedDeals.total.commission / 50000) * 100,
        dealsGoal: 12,
        dealsAchieved: closedDeals.total.deals,
        dealsProgress: (closedDeals.total.deals / 12) * 100,
      };

      // Market insights for the month
      const marketInsights = {
        avgDaysOnMarket: 28,
        medianSalePrice: 365000,
        medianRent: 2800,
        inventoryLevel: "low",
        competitionLevel: "high",
        marketTrend: "seller's market",
      };

      // Top performing listings
      const topListings = [
        {
          id: "listing-1",
          address: "123 Main St, Boston, MA",
          type: "sale",
          listPrice: 450000,
          soldPrice: 465000,
          daysOnMarket: 12,
          commission: 13950,
          status: "sold_above_asking",
        },
        {
          id: "listing-2",
          address: "456 Oak Ave, Cambridge, MA",
          type: "rental",
          listRent: 3500,
          actualRent: 3500,
          daysOnMarket: 5,
          commission: 3500,
          status: "rented_at_asking",
        },
      ];

      // Expenses and net income
      const expenses = {
        marketing: 2500,
        transportation: 400,
        professional: 350,
        software: 200,
        other: 150,
        total: 3600,
      };

      const netIncome = closedDeals.total.commission - expenses.total;

      // Comparison to previous month
      const previousMonth = {
        commission: 38500,
        deals: 8,
      };

      const monthOverMonth = {
        commissionChange: closedDeals.total.commission - previousMonth.commission,
        commissionChangePercent: ((closedDeals.total.commission - previousMonth.commission) / previousMonth.commission) * 100,
        dealsChange: closedDeals.total.deals - previousMonth.deals,
        dealsChangePercent: ((closedDeals.total.deals - previousMonth.deals) / previousMonth.deals) * 100,
      };

      // Year-to-date summary
      const ytdSummary = {
        totalCommission: closedDeals.total.commission * reportMonth, // Simple estimate
        totalDeals: closedDeals.total.deals * reportMonth,
        avgMonthlyCommission: closedDeals.total.commission,
        avgMonthlyDeals: closedDeals.total.deals,
      };

      // Recommendations
      const recommendations = [
        {
          category: "Performance",
          priority: "high",
          message: goals.revenueProgress >= 100 
            ? "Excellent! You exceeded your revenue goal this month." 
            : "Focus on closing the remaining pipeline to meet revenue goals.",
        },
        {
          category: "Lead Generation",
          priority: "medium",
          message: "Consider increasing marketing spend to generate more qualified leads.",
        },
        {
          category: "Efficiency",
          priority: "medium",
          message: `Your showing-to-offer conversion is ${performance.conversionRate.showingToOffer.toFixed(0)}%. Industry average is 40-50%.`,
        },
      ];

      res.json({
        report: {
          period: {
            year: reportYear,
            month: reportMonth,
            monthName,
          },
          summary: {
            totalRevenue: parseFloat(closedDeals.total.commission.toFixed(2)),
            totalDeals: closedDeals.total.deals,
            netIncome: parseFloat(netIncome.toFixed(2)),
            profitMargin: parseFloat(((netIncome / closedDeals.total.commission) * 100).toFixed(2)),
          },
          closedDeals,
          activities,
          performance: {
            conversionRate: {
              leadToShowing: parseFloat(performance.conversionRate.leadToShowing.toFixed(2)),
              showingToOffer: parseFloat(performance.conversionRate.showingToOffer.toFixed(2)),
              offerToContract: parseFloat(performance.conversionRate.offerToContract.toFixed(2)),
              overallLeadToClose: parseFloat(performance.conversionRate.overallLeadToClose.toFixed(2)),
            },
            avgDaysToClose: performance.avgDaysToClose,
            clientSatisfaction: performance.clientSatisfaction,
          },
          goals: {
            revenue: {
              goal: goals.revenueGoal,
              achieved: parseFloat(goals.revenueAchieved.toFixed(2)),
              progress: parseFloat(goals.revenueProgress.toFixed(2)),
              remaining: parseFloat((goals.revenueGoal - goals.revenueAchieved).toFixed(2)),
            },
            deals: {
              goal: goals.dealsGoal,
              achieved: goals.dealsAchieved,
              progress: parseFloat(goals.dealsProgress.toFixed(2)),
              remaining: goals.dealsGoal - goals.dealsAchieved,
            },
          },
          marketInsights,
          topListings,
          expenses: {
            breakdown: expenses,
            totalExpenses: parseFloat(expenses.total.toFixed(2)),
          },
          comparison: {
            monthOverMonth: {
              commissionChange: parseFloat(monthOverMonth.commissionChange.toFixed(2)),
              commissionChangePercent: parseFloat(monthOverMonth.commissionChangePercent.toFixed(2)),
              dealsChange: monthOverMonth.dealsChange,
              dealsChangePercent: parseFloat(monthOverMonth.dealsChangePercent.toFixed(2)),
            },
            ytd: {
              totalCommission: parseFloat(ytdSummary.totalCommission.toFixed(2)),
              totalDeals: ytdSummary.totalDeals,
              avgMonthlyCommission: parseFloat(ytdSummary.avgMonthlyCommission.toFixed(2)),
              avgMonthlyDeals: ytdSummary.avgMonthlyDeals,
            },
          },
          recommendations,
        },
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating monthly report:", error);
      res.status(500).json({ error: "Failed to generate monthly report" });
    }
  });

  // ============================================
  // END AGENT COMMISSION CALCULATOR & ANALYTICS ENDPOINTS
  // ============================================

  // ============================================
  // AGENT DEAL PIPELINE ENDPOINTS
  // ============================================

  /**
   * POST /api/agent/deals
   * Create a new deal in the pipeline
   */
  app.post("/api/agent/deals", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const dealSchema = z.object({
        clientId: z.string().uuid().optional(),
        clientName: z.string().min(1).max(255),
        clientEmail: z.string().email().max(255).optional(),
        clientPhone: z.string().max(50).optional(),
        propertyId: z.string().uuid().optional(),
        propertyAddress: z.string().max(500).optional(),
        stage: z.enum(['lead', 'showing', 'offer', 'contract', 'closed']).default('lead'),
        dealValue: z.number().or(z.string()).optional(),
        commissionRate: z.number().or(z.string()).optional(),
        estimatedCommission: z.number().or(z.string()).optional(),
        expectedCloseDate: z.string().datetime().optional(),
        status: z.enum(['active', 'archived', 'won', 'lost']).default('active'),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
        source: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.unknown()).optional(),
      });

      const parseResult = dealSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid deal data", 
          details: parseResult.error.errors 
        });
      }

      const dealData = {
        ...parseResult.data,
        agentId: req.user!.id,
        expectedCloseDate: parseResult.data.expectedCloseDate 
          ? new Date(parseResult.data.expectedCloseDate) 
          : undefined,
      };

      const deal = await storage.createDeal(dealData as any);
      
      res.status(201).json(deal);
    } catch (error) {
      console.error("Error creating deal:", error);
      res.status(500).json({ error: "Failed to create deal" });
    }
  });

  /**
   * GET /api/agent/deals
   * List all deals for the authenticated agent with optional filtering
   */
  app.get("/api/agent/deals", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const { status, stage, clientId, limit, offset } = req.query;
      
      const result = await storage.getDeals(req.user!.id, {
        status: status as string,
        stage: stage as string,
        clientId: clientId as string,
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  /**
   * GET /api/agent/deals/:id
   * Get specific deal details with notes
   */
  app.get("/api/agent/deals/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const deal = await storage.getDealById(req.params.id, req.user!.id);
      
      if (!deal) {
        return res.status(404).json({ 
          error: "Deal not found or access denied" 
        });
      }

      // Fetch notes for this deal
      const notes = await storage.getDealNotes(req.params.id, req.user!.id);
      
      res.json({ ...deal, notes });
    } catch (error) {
      console.error("Error fetching deal:", error);
      res.status(500).json({ error: "Failed to fetch deal" });
    }
  });

  /**
   * PATCH /api/agent/deals/:id
   * Update deal details or move to different stage
   */
  app.patch("/api/agent/deals/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const updateSchema = z.object({
        clientId: z.string().uuid().optional(),
        clientName: z.string().min(1).max(255).optional(),
        clientEmail: z.string().email().max(255).optional(),
        clientPhone: z.string().max(50).optional(),
        propertyId: z.string().uuid().optional(),
        propertyAddress: z.string().max(500).optional(),
        stage: z.enum(['lead', 'showing', 'offer', 'contract', 'closed']).optional(),
        dealValue: z.number().or(z.string()).optional(),
        commissionRate: z.number().or(z.string()).optional(),
        estimatedCommission: z.number().or(z.string()).optional(),
        expectedCloseDate: z.string().datetime().optional(),
        actualCloseDate: z.string().datetime().optional(),
        status: z.enum(['active', 'archived', 'won', 'lost']).optional(),
        priority: z.enum(['low', 'medium', 'high']).optional(),
        source: z.string().max(100).optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.unknown()).optional(),
      });

      const parseResult = updateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid update data", 
          details: parseResult.error.errors 
        });
      }

      const updateData: any = { ...parseResult.data };
      
      // Convert date strings to Date objects
      if (updateData.expectedCloseDate) {
        updateData.expectedCloseDate = new Date(updateData.expectedCloseDate);
      }
      if (updateData.actualCloseDate) {
        updateData.actualCloseDate = new Date(updateData.actualCloseDate);
      }

      const deal = await storage.updateDeal(
        req.params.id,
        req.user!.id,
        updateData
      );
      
      if (!deal) {
        return res.status(404).json({ 
          error: "Deal not found or access denied" 
        });
      }
      
      res.json(deal);
    } catch (error) {
      console.error("Error updating deal:", error);
      res.status(500).json({ error: "Failed to update deal" });
    }
  });

  /**
   * DELETE /api/agent/deals/:id
   * Archive or delete a deal
   */
  app.delete("/api/agent/deals/:id", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const { permanent } = req.query;

      if (permanent === 'true') {
        // Permanently delete the deal
        await storage.deleteDeal(req.params.id, req.user!.id);
        res.status(204).send();
      } else {
        // Archive the deal (soft delete)
        const deal = await storage.archiveDeal(req.params.id, req.user!.id);
        
        if (!deal) {
          return res.status(404).json({ 
            error: "Deal not found or access denied" 
          });
        }
        
        res.json(deal);
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
      res.status(500).json({ error: "Failed to delete deal" });
    }
  });

  /**
   * POST /api/agent/deals/:id/notes
   * Add a note to a deal
   */
  app.post("/api/agent/deals/:id/notes", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const noteSchema = z.object({
        note: z.string().min(1),
        noteType: z.enum(['general', 'call', 'email', 'meeting', 'showing']).default('general'),
        metadata: z.record(z.unknown()).optional(),
      });

      const parseResult = noteSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid note data", 
          details: parseResult.error.errors 
        });
      }

      // Verify the deal exists and belongs to the agent
      const deal = await storage.getDealById(req.params.id, req.user!.id);
      if (!deal) {
        return res.status(404).json({ 
          error: "Deal not found or access denied" 
        });
      }

      const noteData = {
        ...parseResult.data,
        dealId: req.params.id,
        userId: req.user!.id,
      };

      const note = await storage.createDealNote(noteData as any);
      
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating deal note:", error);
      res.status(500).json({ error: "Failed to create deal note" });
    }
  });

  /**
   * GET /api/agent/deals/:id/notes
   * Get all notes for a deal
   */
  app.get("/api/agent/deals/:id/notes", authMiddleware, async (req, res) => {
    try {
      // Check if user is an agent
      if (req.user!.userType !== 'agent' && req.user!.userType !== 'admin') {
        return res.status(403).json({ 
          error: "Access denied. Agent account required." 
        });
      }

      const notes = await storage.getDealNotes(req.params.id, req.user!.id);
      
      res.json(notes);
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      console.error("Error fetching deal notes:", error);
      res.status(500).json({ error: "Failed to fetch deal notes" });
    }
  });

  // ============================================
  // END AGENT DEAL PIPELINE ENDPOINTS
  // ============================================

  // ============================================
  // RENTER ACCESS / FREEMIUM ENDPOINTS
  // ============================================

  app.get("/api/access/status", authMiddleware, async (req, res) => {
    try {
      const userId = req.user!.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const unlocks = await db.select({ propertyId: propertyUnlocks.propertyId })
        .from(propertyUnlocks)
        .where(eq(propertyUnlocks.userId, userId));

      const unlockedPropertyIds = unlocks.map(u => u.propertyId);
      const now = new Date();
      const hasPlanAccess = user.accessExpiresAt ? new Date(user.accessExpiresAt) > now : false;

      let accessType: 'plan' | 'single' | 'none' = 'none';
      if (hasPlanAccess) {
        accessType = 'plan';
      } else if (unlockedPropertyIds.length > 0) {
        accessType = 'single';
      }

      res.json({
        hasAccess: hasPlanAccess,
        accessType,
        planType: user.accessPlanType || null,
        expiresAt: user.accessExpiresAt ? user.accessExpiresAt.toISOString() : null,
        analysesUsed: user.propertyAnalysesUsed || 0,
        analysesLimit: user.propertyAnalysesLimit || null,
        unlockedPropertyIds,
      });
    } catch (error) {
      console.error("Error fetching access status:", error);
      res.status(500).json({ error: "Failed to fetch access status" });
    }
  });

  app.get("/api/access/unlocked-properties/:userId", authMiddleware, async (req, res) => {
    try {
      if (req.user!.id !== req.params.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const unlocks = await db.select({ propertyId: propertyUnlocks.propertyId })
        .from(propertyUnlocks)
        .where(eq(propertyUnlocks.userId, req.params.userId));

      res.json(unlocks.map(u => u.propertyId));
    } catch (error) {
      console.error("Error fetching unlocked properties:", error);
      res.status(500).json({ error: "Failed to fetch unlocked properties" });
    }
  });

  app.post("/api/access/unlock-property", authMiddleware, async (req, res) => {
    try {
      const schema = z.object({ propertyId: z.string().min(1) });
      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid data", details: parseResult.error.errors });
      }

      const { propertyId } = parseResult.data;
      const userId = req.user!.id;

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(propertyId)) {
        const existing = await db.select()
          .from(propertyUnlocks)
          .where(and(eq(propertyUnlocks.userId, userId), eq(propertyUnlocks.propertyId, propertyId)));

        if (existing.length > 0) {
          return res.json(existing[0]);
        }

        const [unlock] = await db.insert(propertyUnlocks).values({
          userId,
          propertyId,
          unlockType: "single",
        }).returning();

        return res.status(201).json(unlock);
      }

      res.status(201).json({
        id: `local-${propertyId}`,
        userId,
        propertyId,
        unlockType: "single",
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error unlocking property:", error);
      res.status(500).json({ error: "Failed to unlock property" });
    }
  });

  app.post("/api/access/activate-plan", authMiddleware, async (req, res) => {
    try {
      const schema = z.object({
        planType: z.enum(["basic", "pro", "premium"]),
      });
      const parseResult = schema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid data", details: parseResult.error.errors });
      }

      const { planType } = parseResult.data;
      const userId = req.user!.id;
      const now = new Date();

      let daysToAdd: number;
      let analysesLimit: number | null;

      switch (planType) {
        case "basic":
          daysToAdd = 7;
          analysesLimit = 5;
          break;
        case "pro":
          daysToAdd = 30;
          analysesLimit = null;
          break;
        case "premium":
          daysToAdd = 90;
          analysesLimit = null;
          break;
      }

      const expiresAt = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

      await db.update(users).set({
        accessExpiresAt: expiresAt,
        accessPlanType: planType,
        propertyAnalysesUsed: 0,
        propertyAnalysesLimit: analysesLimit,
        updatedAt: now,
      }).where(eq(users.id, userId));

      const unlocks = await db.select({ propertyId: propertyUnlocks.propertyId })
        .from(propertyUnlocks)
        .where(eq(propertyUnlocks.userId, userId));

      res.json({
        hasAccess: true,
        accessType: 'plan' as const,
        planType,
        expiresAt: expiresAt.toISOString(),
        analysesUsed: 0,
        analysesLimit,
        unlockedPropertyIds: unlocks.map(u => u.propertyId),
      });
    } catch (error) {
      console.error("Error activating plan:", error);
      res.status(500).json({ error: "Failed to activate plan" });
    }
  });

  // Register payment routes
  registerPaymentRoutes(app);
  
  // Register lease verification routes
  registerLeaseVerificationRoutes(app);
  
  // Register JEDI API routes for B2B market intelligence
  registerJediRoutes(app);
}
