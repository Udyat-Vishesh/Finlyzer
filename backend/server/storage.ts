import { db } from "@db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

// Storage interface for database operations
export const storage = {
  // Function to get search history for a user
  async getSearchHistory(userId: number) {
    return await db.query.searchHistory.findMany({
      where: eq(schema.searchHistory.userId, userId),
      orderBy: (history) => [schema.searchHistory.timestamp, "desc"],
      limit: 10,
    });
  },

  // Function to save a search query
  async saveSearchQuery(userId: number, query: string) {
    return await db.insert(schema.searchHistory).values({
      userId,
      query,
      timestamp: new Date(),
    }).returning();
  },

  // Function to get saved portfolios
  async getUserPortfolios(userId: number) {
    return await db.query.portfolios.findMany({
      where: eq(schema.portfolios.userId, userId),
      with: {
        assets: true,
      },
    });
  },

  // Function to save a portfolio
  async savePortfolio(userId: number, name: string, assets: { symbol: string; name: string; weight: number }[]) {
    const [portfolio] = await db.insert(schema.portfolios).values({
      userId,
      name,
      createdAt: new Date(),
    }).returning();

    // Insert portfolio assets
    if (portfolio) {
      for (const asset of assets) {
        await db.insert(schema.portfolioAssets).values({
          portfolioId: portfolio.id,
          symbol: asset.symbol,
          name: asset.name,
          weight: asset.weight,
        });
      }
    }

    return portfolio;
  },

  // Delete a portfolio
  async deletePortfolio(portfolioId: number) {
    // First delete associated assets
    await db.delete(schema.portfolioAssets)
      .where(eq(schema.portfolioAssets.portfolioId, portfolioId));
    
    // Then delete the portfolio
    return await db.delete(schema.portfolios)
      .where(eq(schema.portfolios.id, portfolioId))
      .returning();
  }
};
