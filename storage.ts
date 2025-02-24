import { favorites, type Favorite, type InsertFavorite } from "@shared/schema";

export interface IStorage {
  getFavorites(): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(username: string): Promise<void>;
  updatePrivacyStatus(username: string, isPrivate: boolean): Promise<void>;
}

export class MemStorage implements IStorage {
  private favorites: Map<string, Favorite>;
  private currentId: number;

  constructor() {
    this.favorites = new Map();
    this.currentId = 1;
  }

  async getFavorites(): Promise<Favorite[]> {
    return Array.from(this.favorites.values());
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    if (this.favorites.has(insertFavorite.username)) {
      throw new Error("Username already in favorites");
    }

    const favorite: Favorite = {
      id: this.currentId++,
      username: insertFavorite.username,
      isPrivate: null,
      lastChecked: null,
    };

    this.favorites.set(insertFavorite.username, favorite);
    return favorite;
  }

  async removeFavorite(username: string): Promise<void> {
    this.favorites.delete(username);
  }

  async updatePrivacyStatus(username: string, isPrivate: boolean): Promise<void> {
    const favorite = this.favorites.get(username);
    if (favorite) {
      favorite.isPrivate = isPrivate;
      favorite.lastChecked = new Date().toISOString();
      this.favorites.set(username, favorite);
    }
  }
}

export const storage = new MemStorage();
