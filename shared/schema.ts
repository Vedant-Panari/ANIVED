import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  boolean, 
  timestamp, 
  decimal,
  jsonb,
  uuid
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  subscriptionTier: varchar("subscription_tier", { length: 20 }).default("free"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Anime table
export const anime = pgTable("anime", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  genres: text("genres").array(),
  studio: varchar("studio", { length: 100 }),
  releaseYear: integer("release_year"),
  episodeCount: integer("episode_count"),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  posterUrl: text("poster_url"),
  bannerUrl: text("banner_url"),
  status: varchar("status", { length: 20 }).default("ongoing"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Episodes table
export const episodes = pgTable("episodes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  animeId: uuid("anime_id").references(() => anime.id).notNull(),
  episodeNumber: integer("episode_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  duration: integer("duration"), // in seconds
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  subtitles: jsonb("subtitles"), // {language: subtitle_url}
  createdAt: timestamp("created_at").defaultNow(),
});

// User watchlist
export const watchlist = pgTable("watchlist", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  animeId: uuid("anime_id").references(() => anime.id).notNull(),
  status: varchar("status", { length: 20 }).default("plan_to_watch"), // watching, completed, plan_to_watch, dropped
  progress: integer("progress").default(0), // episodes watched
  rating: integer("rating"), // 1-10
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Viewing history
export const viewingHistory = pgTable("viewing_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  episodeId: uuid("episode_id").references(() => episodes.id).notNull(),
  watchedAt: timestamp("watched_at").defaultNow(),
  progress: integer("progress").default(0), // seconds watched
  completed: boolean("completed").default(false),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  animeId: uuid("anime_id").references(() => anime.id).notNull(),
  rating: integer("rating").notNull(), // 1-10
  title: varchar("title", { length: 255 }),
  content: text("content"),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum posts
export const forumPosts = pgTable("forum_posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  animeId: uuid("anime_id").references(() => anime.id),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  replies: integer("replies").default(0),
  views: integer("views").default(0),
  isPinned: boolean("is_pinned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Forum replies
export const forumReplies = pgTable("forum_replies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: uuid("post_id").references(() => forumPosts.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchlist: many(watchlist),
  viewingHistory: many(viewingHistory),
  reviews: many(reviews),
  forumPosts: many(forumPosts),
  forumReplies: many(forumReplies),
}));

export const animeRelations = relations(anime, ({ many }) => ({
  episodes: many(episodes),
  watchlist: many(watchlist),
  reviews: many(reviews),
  forumPosts: many(forumPosts),
}));

export const episodesRelations = relations(episodes, ({ one, many }) => ({
  anime: one(anime, {
    fields: [episodes.animeId],
    references: [anime.id],
  }),
  viewingHistory: many(viewingHistory),
}));

export const watchlistRelations = relations(watchlist, ({ one }) => ({
  user: one(users, {
    fields: [watchlist.userId],
    references: [users.id],
  }),
  anime: one(anime, {
    fields: [watchlist.animeId],
    references: [anime.id],
  }),
}));

export const viewingHistoryRelations = relations(viewingHistory, ({ one }) => ({
  user: one(users, {
    fields: [viewingHistory.userId],
    references: [users.id],
  }),
  episode: one(episodes, {
    fields: [viewingHistory.episodeId],
    references: [episodes.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  anime: one(anime, {
    fields: [reviews.animeId],
    references: [anime.id],
  }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [forumPosts.userId],
    references: [users.id],
  }),
  anime: one(anime, {
    fields: [forumPosts.animeId],
    references: [anime.id],
  }),
  replies: many(forumReplies),
}));

export const forumRepliesRelations = relations(forumReplies, ({ one }) => ({
  post: one(forumPosts, {
    fields: [forumReplies.postId],
    references: [forumPosts.id],
  }),
  user: one(users, {
    fields: [forumReplies.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnimeSchema = createInsertSchema(anime).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  id: true,
  createdAt: true,
});

export const insertWatchlistSchema = createInsertSchema(watchlist).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
});

export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  replies: true,
  views: true,
});

export const insertForumReplySchema = createInsertSchema(forumReplies).omit({
  id: true,
  createdAt: true,
  likes: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Anime = typeof anime.$inferSelect;
export type InsertAnime = z.infer<typeof insertAnimeSchema>;
export type Episode = typeof episodes.$inferSelect;
export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type Watchlist = typeof watchlist.$inferSelect;
export type InsertWatchlist = z.infer<typeof insertWatchlistSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type ForumReply = typeof forumReplies.$inferSelect;
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ViewingHistory = typeof viewingHistory.$inferSelect;
