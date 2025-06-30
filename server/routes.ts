import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPairSchema, insertSessionSchema, insertBlocklistSchema, insertActivitySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Pairs routes
  app.get("/api/pairs", async (req, res) => {
    try {
      const pairs = await storage.getAllPairs();
      res.json(pairs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pairs" });
    }
  });

  app.post("/api/pairs", async (req, res) => {
    try {
      const validatedData = insertPairSchema.parse(req.body);
      const pair = await storage.createPair(validatedData);
      
      // Log activity
      await storage.createActivity({
        type: "pair_created",
        message: `New pair created: ${pair.name}`,
        details: `Source: ${pair.sourceChannel} → Destination: ${pair.destinationChannel}`,
        pairId: pair.id,
        severity: "success",
      });
      
      res.status(201).json(pair);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid pair data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create pair" });
      }
    }
  });

  app.patch("/api/pairs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const pair = await storage.updatePair(id, updates);
      
      if (!pair) {
        return res.status(404).json({ message: "Pair not found" });
      }

      // Log activity
      await storage.createActivity({
        type: "pair_updated",
        message: `Pair updated: ${pair.name}`,
        details: `Status changed to: ${pair.status}`,
        pairId: pair.id,
        severity: "info",
      });
      
      res.json(pair);
    } catch (error) {
      res.status(500).json({ message: "Failed to update pair" });
    }
  });

  app.delete("/api/pairs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pair = await storage.getPair(id);
      const deleted = await storage.deletePair(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Pair not found" });
      }

      // Log activity
      if (pair) {
        await storage.createActivity({
          type: "pair_deleted",
          message: `Pair deleted: ${pair.name}`,
          details: `Removed from system`,
          severity: "warning",
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete pair" });
    }
  });

  // Sessions routes
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      
      // Log activity
      await storage.createActivity({
        type: "session_connected",
        message: `New session connected: ${session.name}`,
        details: `Phone: ${session.phone} - Ready for use`,
        sessionId: session.id,
        severity: "success",
      });
      
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid session data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create session" });
      }
    }
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const session = await storage.updateSession(id, updates);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Blocklists routes
  app.get("/api/blocklists", async (req, res) => {
    try {
      const { type, pairId } = req.query;
      let blocklists;
      
      if (type) {
        blocklists = await storage.getBlocklistsByType(type as string);
      } else if (pairId === "global") {
        blocklists = await storage.getGlobalBlocklists();
      } else if (pairId) {
        blocklists = await storage.getPairBlocklists(parseInt(pairId as string));
      } else {
        blocklists = await storage.getAllBlocklists();
      }
      
      res.json(blocklists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blocklists" });
    }
  });

  app.post("/api/blocklists", async (req, res) => {
    try {
      const validatedData = insertBlocklistSchema.parse(req.body);
      const blocklist = await storage.createBlocklist(validatedData);
      res.status(201).json(blocklist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid blocklist data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create blocklist" });
      }
    }
  });

  app.delete("/api/blocklists/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBlocklist(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Blocklist entry not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete blocklist entry" });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    try {
      const validatedData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(validatedData);
      res.status(201).json(activity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid activity data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create activity" });
      }
    }
  });

  // System stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system stats" });
    }
  });

  // Control routes
  app.post("/api/control/pause-all", async (req, res) => {
    try {
      const pairs = await storage.getAllPairs();
      const activePairs = pairs.filter(p => p.status === "active");
      
      for (const pair of activePairs) {
        await storage.updatePair(pair.id, { status: "paused" });
      }

      // Log activity
      await storage.createActivity({
        type: "global_pause",
        message: "All pairs paused by admin",
        details: `${activePairs.length} pairs paused`,
        severity: "warning",
      });
      
      res.json({ success: true, pausedCount: activePairs.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to pause all pairs" });
    }
  });

  app.post("/api/control/resume-all", async (req, res) => {
    try {
      const pairs = await storage.getAllPairs();
      const pausedPairs = pairs.filter(p => p.status === "paused");
      
      for (const pair of pausedPairs) {
        await storage.updatePair(pair.id, { status: "active" });
      }

      // Log activity
      await storage.createActivity({
        type: "global_resume",
        message: "All pairs resumed by admin",
        details: `${pausedPairs.length} pairs resumed`,
        severity: "success",
      });
      
      res.json({ success: true, resumedCount: pausedPairs.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to resume all pairs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
