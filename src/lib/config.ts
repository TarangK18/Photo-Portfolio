export const ADMIN_EMAIL = "tarangkamble18@gmail.com";
export const BUCKET = "portfolio";
export const CATEGORIES = ["Portrait", "Travel", "Landscape", "Animals", "Machines", "More"] as const;
export type Category = (typeof CATEGORIES)[number];

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** Public URL of a stored image. size: "thumb" (~900px) or "full" (~2400px). */
export function imageUrl(storagePath: string, size: "thumb" | "full") {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}/${size}.webp`;
}
