import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import {
  insertPropertySchema,
  insertSavedApartmentSchema,
  insertSearchHistorySchema,
  insertUserPreferencesSchema,
  insertMarketSnapshotSchema,
  insertUserPoiSchema,
  insertCompetitionSetSchema,
  insertCompetitionSetCompetitorSchema,
} from "@shared/schema";
import { 
  createUser, 
  authenticateUser, 
  generateToken, 
  verifyToken, 
  getUserById,
  getUserByEmail,
  updateUserType,
  type AuthUser 
} from "./auth";
import { z } from "zod";
import { registerPaymentRoutes } from "./routes/payments";
import { registerLeaseVerificationRoutes } from "./routes/lease-verification";

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

  // Register payment routes
  registerPaymentRoutes(app);
  
  // Register lease verification routes
  registerLeaseVerificationRoutes(app);
}
