import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFavoriteSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check account privacy status
  app.post("/api/check", async (req, res) => {
    const { username } = req.body;
    
    try {
      // Simulate Instagram API call
      const isPrivate = Math.random() < 0.5;
      res.json({ isPrivate });
    } catch (error) {
      res.status(500).json({ message: "Failed to check account status" });
    }
  });

  // Get all favorites
  app.get("/api/favorites", async (_req, res) => {
    const favorites = await storage.getFavorites();
    res.json(favorites);
  });

  // Add favorite
  app.post("/api/favorites", async (req, res) => {
    try {
      const favorite = insertFavoriteSchema.parse(req.body);
      const result = await storage.addFavorite(favorite);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid username format" });
    }
  });

  // Remove favorite
  app.delete("/api/favorites/:username", async (req, res) => {
    try {
      await storage.removeFavorite(req.params.username);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Update privacy status
  app.post("/api/favorites/:username/status", async (req, res) => {
    try {
      const { isPrivate } = req.body;
      await storage.updatePrivacyStatus(req.params.username, isPrivate);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
