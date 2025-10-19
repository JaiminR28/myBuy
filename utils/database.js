import { db } from "../lib/db";


export const createTables = async () => {
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS wishlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      type TEXT
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS product_list (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wishlist_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      imageUrl TEXT,
      price INTEGER,
      isBought INTEGER NOT NULL DEFAULT 0 CHECK(isBought IN (0,1)),
      description TEXT,
      broughtData TEXT,
      lastUpdated TEXT,
      title NOT NULL,
      FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE
    );
  `);
}

/**
 * Adds a product to multiple wishlists in a single transaction
 * @param {number[]} wishlistIds - Array of wishlist IDs to add the product to
 * @param {string} url - Product URL
 * @param {Object} productData - Product data object
 * @returns {Promise<Object>} Result with success count and inserted IDs
 */
export const addProductToMultipleWishlists = async (wishlistIds, url, productData) => {
  try {
    let successCount = 0;
    const insertedIds = [];
    
    await db.withTransactionAsync(async () => {
      for (const wishlistId of wishlistIds) {
        try {
          const insertResult = await db.runAsync(
            `INSERT INTO product_list (
              wishlist_id, 
              url, 
              imageUrl, 
              price, 
              description, 
              lastUpdated, 
              title
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              wishlistId,
              url,
              productData.imageUrl || null,
              productData.price || null,
              productData.description || null,
              new Date().toISOString(),
              productData.title
            ]
          );
          
          if (insertResult && insertResult.lastInsertRowId) {
            insertedIds.push(insertResult.lastInsertRowId);
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to add product to wishlist ${wishlistId}:`, error);
          // Continue with other wishlists even if one fails
        }
      }
    });
    
    return {
      successCount,
      insertedIds,
      totalRequested: wishlistIds.length
    };
  } catch (error) {
    console.error("Transaction failed:", error);
    throw new Error("Failed to add product to wishlists");
  }
}


