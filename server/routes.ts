import type { Express } from "express";
import { storage } from "./storage";
import {
  insertPropertySchema,
  insertSavedApartmentSchema,
  insertSearchHistorySchema,
  insertUserPreferencesSchema,
  insertMarketSnapshotSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<void> {
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

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
}
