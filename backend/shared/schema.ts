import { pgTable, text, serial, integer, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Search history table
export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  query: text("query").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const searchHistoryRelations = relations(searchHistory, ({ one }) => ({
  user: one(users, {
    fields: [searchHistory.userId],
    references: [users.id],
  }),
}));

// Portfolios table
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  assets: many(portfolioAssets),
}));

// Portfolio assets table
export const portfolioAssets = pgTable("portfolio_assets", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id).notNull(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(),
});

export const portfolioAssetsRelations = relations(portfolioAssets, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioAssets.portfolioId],
    references: [portfolios.id],
  }),
}));

// Asset data table (for caching purposes)
export const assetData = pgTable("asset_data", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'stock', 'etf', 'crypto', 'index'
  exchange: text("exchange"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});
