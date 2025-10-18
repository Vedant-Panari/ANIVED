import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertAnimeSchema,
  insertEpisodeSchema,
  insertWatchlistSchema,
  insertReviewSchema,
  insertForumPostSchema,
  insertForumReplySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Anime routes
  app.get("/api/anime", async (req, res) => {
    try {
      const { 
        genre, 
        studio, 
        year, 
        search, 
        isPremium, 
        page = 1, 
        limit = 20,
        sortBy = 'title',
        sortOrder = 'asc'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      const filters = {
        genre: genre as string,
        studio: studio as string,
        year: year ? Number(year) : undefined,
        search: search as string,
        isPremium: isPremium === 'true',
        offset,
        limit: Number(limit),
        sortBy: sortBy as 'title' | 'rating' | 'releaseYear',
        sortOrder: sortOrder as 'asc' | 'desc'
      };

      const result = await storage.getAllAnime(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching anime:", error);
      res.status(500).json({ message: "Failed to fetch anime" });
    }
  });

  app.get("/api/anime/:id", async (req, res) => {
    try {
      const anime = await storage.getAnime(req.params.id);
      if (!anime) {
        return res.status(404).json({ message: "Anime not found" });
      }
      res.json(anime);
    } catch (error) {
      console.error("Error fetching anime:", error);
      res.status(500).json({ message: "Failed to fetch anime" });
    }
  });

  app.post("/api/anime", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAnimeSchema.parse(req.body);
      const anime = await storage.createAnime(validatedData);
      res.status(201).json(anime);
    } catch (error) {
      console.error("Error creating anime:", error);
      res.status(500).json({ message: "Failed to create anime" });
    }
  });

  app.put("/api/anime/:id", requireAdmin, async (req, res) => {
    try {
      const anime = await storage.updateAnime(req.params.id, req.body);
      res.json(anime);
    } catch (error) {
      console.error("Error updating anime:", error);
      res.status(500).json({ message: "Failed to update anime" });
    }
  });

  app.delete("/api/anime/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAnime(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting anime:", error);
      res.status(500).json({ message: "Failed to delete anime" });
    }
  });

  // Episode routes
  app.get("/api/anime/:animeId/episodes", async (req, res) => {
    try {
      const episodes = await storage.getEpisodesByAnime(req.params.animeId);
      res.json(episodes);
    } catch (error) {
      console.error("Error fetching episodes:", error);
      res.status(500).json({ message: "Failed to fetch episodes" });
    }
  });

  app.get("/api/episodes/:id", async (req, res) => {
    try {
      const episode = await storage.getEpisode(req.params.id);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      res.json(episode);
    } catch (error) {
      console.error("Error fetching episode:", error);
      res.status(500).json({ message: "Failed to fetch episode" });
    }
  });

  app.post("/api/episodes", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertEpisodeSchema.parse(req.body);
      const episode = await storage.createEpisode(validatedData);
      res.status(201).json(episode);
    } catch (error) {
      console.error("Error creating episode:", error);
      res.status(500).json({ message: "Failed to create episode" });
    }
  });

  // Watchlist routes
  app.get("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const { status } = req.query;
      const watchlist = await storage.getUserWatchlist(req.user!.id, status as string);
      res.json(watchlist);
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      res.status(500).json({ message: "Failed to fetch watchlist" });
    }
  });

  app.post("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const validatedData = insertWatchlistSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const watchlistItem = await storage.addToWatchlist(validatedData);
      res.status(201).json(watchlistItem);
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      res.status(500).json({ message: "Failed to add to watchlist" });
    }
  });

  app.put("/api/watchlist/:animeId", requireAuth, async (req, res) => {
    try {
      const watchlistItem = await storage.updateWatchlistItem(
        req.user!.id,
        req.params.animeId,
        req.body
      );
      res.json(watchlistItem);
    } catch (error) {
      console.error("Error updating watchlist:", error);
      res.status(500).json({ message: "Failed to update watchlist" });
    }
  });

  app.delete("/api/watchlist/:animeId", requireAuth, async (req, res) => {
    try {
      await storage.removeFromWatchlist(req.user!.id, req.params.animeId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      res.status(500).json({ message: "Failed to remove from watchlist" });
    }
  });

  // Review routes
  app.get("/api/anime/:animeId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviewsByAnime(req.params.animeId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", requireAuth, async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Forum routes
  app.get("/api/forum/posts", async (req, res) => {
    try {
      const { animeId, page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const posts = await storage.getForumPosts(
        animeId as string,
        offset,
        Number(limit)
      );
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get("/api/forum/posts/:id", async (req, res) => {
    try {
      const post = await storage.getForumPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Forum post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching forum post:", error);
      res.status(500).json({ message: "Failed to fetch forum post" });
    }
  });

  app.post("/api/forum/posts", requireAuth, async (req, res) => {
    try {
      const validatedData = insertForumPostSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const post = await storage.createForumPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(500).json({ message: "Failed to create forum post" });
    }
  });

  app.post("/api/forum/replies", requireAuth, async (req, res) => {
    try {
      const validatedData = insertForumReplySchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const reply = await storage.createForumReply(validatedData);
      res.status(201).json(reply);
    } catch (error) {
      console.error("Error creating forum reply:", error);
      res.status(500).json({ message: "Failed to create forum reply" });
    }
  });

  // Viewing history routes
  app.get("/api/viewing-history", requireAuth, async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const history = await storage.getUserViewingHistory(req.user!.id, Number(limit));
      res.json(history);
    } catch (error) {
      console.error("Error fetching viewing history:", error);
      res.status(500).json({ message: "Failed to fetch viewing history" });
    }
  });

  app.post("/api/viewing-history", requireAuth, async (req, res) => {
    try {
      const history = await storage.addViewingHistory({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(history);
    } catch (error) {
      console.error("Error adding viewing history:", error);
      res.status(500).json({ message: "Failed to add viewing history" });
    }
  });

  // Search route
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ message: "Search query required" });
      }

      const result = await storage.getAllAnime({
        search: q as string,
        limit: 20
      });
      res.json(result);
    } catch (error) {
      console.error("Error searching anime:", error);
      res.status(500).json({ message: "Failed to search anime" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
