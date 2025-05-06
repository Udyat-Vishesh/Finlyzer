import { db } from "./index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    console.log("Seeding database...");

    // Check if we have search history records already
    const existingSearchHistory = await db.query.searchHistory.findMany({
      limit: 1
    });

    // Only seed if no search history exists
    if (existingSearchHistory.length === 0) {
      console.log("No existing search history found, creating sample data...");

      // Create a demo user if it doesn't exist
      let demoUser = await db.query.users.findFirst({
        where: eq(schema.users.username, "demo")
      });

      if (!demoUser) {
        const [newUser] = await db.insert(schema.users).values({
          username: "demo",
          password: "$2b$10$demopasswordhash" // This is a placeholder, not a real hash
        }).returning();
        
        demoUser = newUser;
        console.log("Created demo user");
      }

      // Create sample search history for demo user
      if (demoUser) {
        const searchQueries = ["AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "BTC-USD", "SPY", "QQQ", "NIFTY"];
        
        for (const query of searchQueries) {
          await db.insert(schema.searchHistory).values({
            userId: demoUser.id,
            query,
            timestamp: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
          });
        }
        console.log("Created sample search history");

        // Create sample portfolios
        const [techPortfolio] = await db.insert(schema.portfolios).values({
          userId: demoUser.id,
          name: "Tech Portfolio",
          createdAt: new Date()
        }).returning();

        if (techPortfolio) {
          const techAssets = [
            { symbol: "AAPL", name: "Apple Inc.", weight: 25 },
            { symbol: "MSFT", name: "Microsoft Corporation", weight: 25 },
            { symbol: "GOOGL", name: "Alphabet Inc.", weight: 25 },
            { symbol: "AMZN", name: "Amazon.com, Inc.", weight: 25 }
          ];

          for (const asset of techAssets) {
            await db.insert(schema.portfolioAssets).values({
              portfolioId: techPortfolio.id,
              symbol: asset.symbol,
              name: asset.name,
              weight: asset.weight
            });
          }
          console.log("Created Tech Portfolio");
        }

        const [balancedPortfolio] = await db.insert(schema.portfolios).values({
          userId: demoUser.id,
          name: "Balanced Portfolio",
          createdAt: new Date()
        }).returning();

        if (balancedPortfolio) {
          const balancedAssets = [
            { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", weight: 40 },
            { symbol: "QQQ", name: "Invesco QQQ Trust", weight: 20 },
            { symbol: "AAPL", name: "Apple Inc.", weight: 20 },
            { symbol: "BTC-USD", name: "Bitcoin USD", weight: 20 }
          ];

          for (const asset of balancedAssets) {
            await db.insert(schema.portfolioAssets).values({
              portfolioId: balancedPortfolio.id,
              symbol: asset.symbol,
              name: asset.name,
              weight: asset.weight
            });
          }
          console.log("Created Balanced Portfolio");
        }
      }
      
      console.log("Seed completed successfully");
    } else {
      console.log("Database already has data, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
