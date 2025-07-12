import { db } from "../lib/db";


export const createTables = async () => {
db.transaction(tx => {
  tx.executeSql(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS wishlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      type TEXT
    );
  `);
  tx.executeSql(`
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
});
}


