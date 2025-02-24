import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  isPrivate: boolean("is_private"),
  lastChecked: text("last_checked"),
});

export const insertFavoriteSchema = createInsertSchema(favorites)
  .pick({
    username: true,
  })
  .extend({
    username: z.string().min(1).max(30).regex(/^[a-zA-Z0-9._]+$/),
  });

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
