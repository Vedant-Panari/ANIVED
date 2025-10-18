import {
  users,
  anime,
  episodes,
  watchlist,
  reviews,
  forumPosts,
  forumReplies,
  viewingHistory,
  type User,
  type InsertUser,
  type Anime,
  type InsertAnime,
  type Episode,
  type InsertEpisode,
  type Watchlist,
  type InsertWatchlist,
  type Review,
  type InsertReview,
  type ForumPost,
  type InsertForumPost,
  type ForumReply,
  type InsertForumReply,
  type ViewingHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, like, or, sql, count } from "drizzle-orm";
import session, { Store } from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Anime operations
  getAnime(id: string): Promise<Anime | undefined>;
  getAllAnime(filters?: {
    genre?: string;
    studio?: string;
    year?: number;
    search?: string;
    isPremium?: boolean;
    offset?: number;
    limit?: number;
    sortBy?: 'title' | 'rating' | 'releaseYear';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ anime: Anime[]; total: number }>;
  createAnime(anime: InsertAnime): Promise<Anime>;
  updateAnime(id: string, updates: Partial<Anime>): Promise<Anime>;
  deleteAnime(id: string): Promise<void>;

  // Episode operations
  getEpisode(id: string): Promise<Episode | undefined>;
  getEpisodesByAnime(animeId: string): Promise<Episode[]>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: string, updates: Partial<Episode>): Promise<Episode>;
  deleteEpisode(id: string): Promise<void>;

  // Watchlist operations
  getUserWatchlist(userId: string, status?: string): Promise<(Watchlist & { anime: Anime })[]>;
  addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist>;
  updateWatchlistItem(userId: string, animeId: string, updates: Partial<Watchlist>): Promise<Watchlist>;
  removeFromWatchlist(userId: string, animeId: string): Promise<void>;

  // Review operations
  getReviewsByAnime(animeId: string): Promise<(Review & { user: { username: string; profileImageUrl: string | null } })[]>;
  getReviewsByUser(userId: string): Promise<(Review & { anime: { title: string } })[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, updates: Partial<Review>): Promise<Review>;
  deleteReview(id: string): Promise<void>;

  // Forum operations
  getForumPosts(animeId?: string, offset?: number, limit?: number): Promise<(ForumPost & { user: { username: string } })[]>;
  getForumPost(id: string): Promise<(ForumPost & { user: { username: string }; replies: (ForumReply & { user: { username: string } })[] }) | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  createForumReply(reply: InsertForumReply): Promise<ForumReply>;

  // Viewing history operations
  addViewingHistory(history: Omit<ViewingHistory, 'id' | 'watchedAt'>): Promise<ViewingHistory>;
  getUserViewingHistory(userId: string, limit?: number): Promise<(ViewingHistory & { episode: Episode & { anime: Anime } })[]>;

  // Session store
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Anime operations
  async getAnime(id: string): Promise<Anime | undefined> {
    const [animeItem] = await db.select().from(anime).where(eq(anime.id, id));
    return animeItem || undefined;
  }

  async getAllAnime(filters: {
    genre?: string;
    studio?: string;
    year?: number;
    search?: string;
    isPremium?: boolean;
    offset?: number;
    limit?: number;
    sortBy?: 'title' | 'rating' | 'releaseYear';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ anime: Anime[]; total: number }> {
    const {
      genre,
      studio,
      year,
      search,
      isPremium,
      offset = 0,
      limit = 20,
      sortBy = 'title',
      sortOrder = 'asc'
    } = filters;

    let query = db.select().from(anime);
    let countQuery = db.select({ count: count() }).from(anime);

    const conditions = [];

    if (genre) {
      conditions.push(sql`${anime.genres} @> ARRAY[${genre}]`);
    }
    if (studio) {
      conditions.push(eq(anime.studio, studio));
    }
    if (year) {
      conditions.push(eq(anime.releaseYear, year));
    }
    if (search) {
      conditions.push(
        or(
          like(anime.title, `%${search}%`),
          like(anime.description, `%${search}%`)
        )
      );
    }
    if (isPremium !== undefined) {
      conditions.push(eq(anime.isPremium, isPremium));
    }

    if (conditions.length > 0) {
      const whereClause = conditions.length === 1 ? conditions[0] : and(...conditions);
      query = query.where(whereClause);
      countQuery = countQuery.where(whereClause);
    }

    // Sorting
    const sortColumn = sortBy === 'title' ? anime.title : 
                      sortBy === 'rating' ? anime.rating : anime.releaseYear;
    query = query.orderBy(sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn));

    // Pagination
    query = query.offset(offset).limit(limit);

    const [animeResults, countResult] = await Promise.all([
      query.execute(),
      countQuery.execute()
    ]);

    return {
      anime: animeResults,
      total: countResult[0].count as number
    };
  }

  async createAnime(animeData: InsertAnime): Promise<Anime> {
    const [newAnime] = await db.insert(anime).values(animeData).returning();
    return newAnime;
  }

  async updateAnime(id: string, updates: Partial<Anime>): Promise<Anime> {
    const [updatedAnime] = await db
      .update(anime)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(anime.id, id))
      .returning();
    return updatedAnime;
  }

  async deleteAnime(id: string): Promise<void> {
    await db.delete(anime).where(eq(anime.id, id));
  }

  // Episode operations
  async getEpisode(id: string): Promise<Episode | undefined> {
    const [episode] = await db.select().from(episodes).where(eq(episodes.id, id));
    return episode || undefined;
  }

  async getEpisodesByAnime(animeId: string): Promise<Episode[]> {
    return await db
      .select()
      .from(episodes)
      .where(eq(episodes.animeId, animeId))
      .orderBy(asc(episodes.episodeNumber));
  }

  async createEpisode(episode: InsertEpisode): Promise<Episode> {
    const [newEpisode] = await db.insert(episodes).values(episode).returning();
    return newEpisode;
  }

  async updateEpisode(id: string, updates: Partial<Episode>): Promise<Episode> {
    const [updatedEpisode] = await db
      .update(episodes)
      .set(updates)
      .where(eq(episodes.id, id))
      .returning();
    return updatedEpisode;
  }

  async deleteEpisode(id: string): Promise<void> {
    await db.delete(episodes).where(eq(episodes.id, id));
  }

  // Watchlist operations
  async getUserWatchlist(userId: string, status?: string): Promise<(Watchlist & { anime: Anime })[]> {
    const conditions = [eq(watchlist.userId, userId)];
    
    if (status) {
      conditions.push(eq(watchlist.status, status));
    }

    const query = db
      .select()
      .from(watchlist)
      .innerJoin(anime, eq(watchlist.animeId, anime.id))
      .where(and(...conditions));

    const results = await query.orderBy(desc(watchlist.updatedAt));

    return results.map(result => ({
      ...result.watchlist,
      anime: result.anime
    }));
  }

  async addToWatchlist(watchlistItem: InsertWatchlist): Promise<Watchlist> {
    const [newItem] = await db.insert(watchlist).values(watchlistItem).returning();
    return newItem;
  }

  async updateWatchlistItem(userId: string, animeId: string, updates: Partial<Watchlist>): Promise<Watchlist> {
    const [updatedItem] = await db
      .update(watchlist)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(watchlist.userId, userId), eq(watchlist.animeId, animeId)))
      .returning();
    return updatedItem;
  }

  async removeFromWatchlist(userId: string, animeId: string): Promise<void> {
    await db
      .delete(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.animeId, animeId)));
  }

  // Review operations
  async getReviewsByAnime(animeId: string): Promise<(Review & { user: { username: string; profileImageUrl: string | null } })[]> {
    const results = await db
      .select({
        review: reviews,
        user: {
          username: users.username,
          profileImageUrl: users.profileImageUrl
        }
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.animeId, animeId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.review,
      user: result.user
    }));
  }

  async getReviewsByUser(userId: string): Promise<(Review & { anime: { title: string } })[]> {
    const results = await db
      .select({
        review: reviews,
        anime: {
          title: anime.title
        }
      })
      .from(reviews)
      .innerJoin(anime, eq(reviews.animeId, anime.id))
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.review,
      anime: result.anime
    }));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async updateReview(id: string, updates: Partial<Review>): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  async deleteReview(id: string): Promise<void> {
    await db.delete(reviews).where(eq(reviews.id, id));
  }

  // Forum operations
  async getForumPosts(animeId?: string, offset = 0, limit = 10): Promise<(ForumPost & { user: { username: string } })[]> {
    let query = db
      .select({
        post: forumPosts,
        user: {
          username: users.username
        }
      })
      .from(forumPosts)
      .innerJoin(users, eq(forumPosts.userId, users.id));

    if (animeId) {
      query = query.where(eq(forumPosts.animeId, animeId));
    }

    const results = await query
      .orderBy(desc(forumPosts.isPinned), desc(forumPosts.updatedAt))
      .offset(offset)
      .limit(limit);

    return results.map(result => ({
      ...result.post,
      user: result.user
    }));
  }

  async getForumPost(id: string): Promise<(ForumPost & { user: { username: string }; replies: (ForumReply & { user: { username: string } })[] }) | undefined> {
    const [postResult] = await db
      .select({
        post: forumPosts,
        user: {
          username: users.username
        }
      })
      .from(forumPosts)
      .innerJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.id, id));

    if (!postResult) return undefined;

    const repliesResults = await db
      .select({
        reply: forumReplies,
        user: {
          username: users.username
        }
      })
      .from(forumReplies)
      .innerJoin(users, eq(forumReplies.userId, users.id))
      .where(eq(forumReplies.postId, id))
      .orderBy(asc(forumReplies.createdAt));

    return {
      ...postResult.post,
      user: postResult.user,
      replies: repliesResults.map(r => ({
        ...r.reply,
        user: r.user
      }))
    };
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [newPost] = await db.insert(forumPosts).values(post).returning();
    return newPost;
  }

  async createForumReply(reply: InsertForumReply): Promise<ForumReply> {
    const [newReply] = await db.insert(forumReplies).values(reply).returning();
    
    // Increment reply count
    await db
      .update(forumPosts)
      .set({ 
        replies: sql`${forumPosts.replies} + 1`,
        updatedAt: new Date()
      })
      .where(eq(forumPosts.id, reply.postId));

    return newReply;
  }

  // Viewing history operations
  async addViewingHistory(history: Omit<ViewingHistory, 'id' | 'watchedAt'>): Promise<ViewingHistory> {
    const [newHistory] = await db.insert(viewingHistory).values(history).returning();
    return newHistory;
  }

  async getUserViewingHistory(userId: string, limit = 10): Promise<(ViewingHistory & { episode: Episode & { anime: Anime } })[]> {
    const results = await db
      .select()
      .from(viewingHistory)
      .innerJoin(episodes, eq(viewingHistory.episodeId, episodes.id))
      .innerJoin(anime, eq(episodes.animeId, anime.id))
      .where(eq(viewingHistory.userId, userId))
      .orderBy(desc(viewingHistory.watchedAt))
      .limit(limit);

    return results.map(result => ({
      ...result.viewing_history,
      episode: {
        ...result.episodes,
        anime: result.anime
      }
    }));
  }
}

export const storage = new DatabaseStorage();
