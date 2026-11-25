import Gallery from "@/components/Gallery";
import { createClient } from "@/lib/supabase/server";
import type { Photo, Video } from "@/lib/types";

export const dynamic = "force-dynamic"; // like counts change constantly

export default async function Home() {
  const supabase = await createClient();
  const [photos, videos, user] = await Promise.all([
    supabase
      .from("pf_photos")
      .select("*")
      .eq("published", true)
      .order("like_count", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase.from("pf_videos").select("id,url,title,sort").order("sort"),
    supabase.auth.getUser(),
  ]);

  return (
    <Gallery
      initialPhotos={(photos.data ?? []) as Photo[]}
      videos={(videos.data ?? []) as Video[]}
      userEmail={user.data.user?.email ?? null}
    />
  );
}
