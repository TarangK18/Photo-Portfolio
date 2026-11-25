import type { Category } from "./config";

export type Photo = {
  id: string;
  storage_path: string;
  title: string;
  caption: string;
  category: Category;
  is_pick: boolean;
  pick_order: number;
  width: number;
  height: number;
  like_count: number;
  published: boolean;
  created_at: string;
};

export type Video = { id: string; url: string; title: string; sort: number };
