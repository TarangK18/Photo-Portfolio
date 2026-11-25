import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/config";
import type { Photo, Video } from "@/lib/types";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin — Tarang Kamble", robots: { index: false } };

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // UI gate only. The real protection is the database: pf_is_admin() in RLS and storage policies.
  if (user?.email !== ADMIN_EMAIL) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="font-display text-3xl font-bold">Admin only</h1>
        <p className="text-muted">{user ? `Signed in as ${user.email}, which isn't the admin account.` : "Sign in with the admin email to continue."}</p>
        <a href="/login?next=/admin" className="flex min-h-11 items-center rounded-full bg-paper px-6 font-semibold text-ink">Sign in</a>
      </main>
    );
  }

  const [photos, videos] = await Promise.all([
    supabase.from("pf_photos").select("*").order("created_at", { ascending: false }),
    supabase.from("pf_videos").select("id,url,title,sort").order("sort"),
  ]);
  return <AdminClient email={user.email} initialPhotos={(photos.data ?? []) as Photo[]} initialVideos={(videos.data ?? []) as Video[]} />;
}
