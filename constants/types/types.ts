export type Wishlist = {
  id: number;
  title: string;
  createdAt: string;
  type: string;
};

export type wishlistItem = {
  id: number; // PRIMARY KEY AUTOINCREMENT
  wishlist_id: number; // FK to wishlists.id
  url: string;
  imageUrl?: string | null; // nullable
  price?: number | null; // nullable
  isBought: 0 | 1; // CHECK(isBought IN (0,1))
  description?: string | null; // nullable
  broughtData?: string | null; // nullable
  lastUpdated?: string | null; // nullable
  title: string; // NOT NULL
}

export type wishlistWithItems = {
  id: number;
  title: string;
  createdAt: string;
  type: string;
  wishlistItems : string | wishlistItem[]
}

export type ProductData = {
  title: string;
  price: number | null;
  description?: string | null;
  imageUrl?: string | null;
};
