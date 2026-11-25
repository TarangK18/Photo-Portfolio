"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, imageUrl, type Category } from "@/lib/config";
import type { Photo, Video } from "@/lib/types";
import { getVisitorId } from "@/lib/visitor";
import { embedUrl } from "@/lib/video";
import { LikeButton } from "./Heart";
import Lightbox from "./Lightbox";

type Filter = "All" | Category;

export default function Gallery({ initialPhotos, videos, userEmail }: {
  initialPhotos: Photo[]; videos: Video[]; userEmail: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [photos, setPhotos] = useState(initialPhotos);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("All");
  const [open, setOpen] = useState<{ list: Photo[]; index: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Which photos has this browser (or signed-in account) already liked?
  useEffect(() => {
    supabase.rpc("pf_my_likes", { p_visitor: getVisitorId() }).then(({ data }) => {
      if (Array.isArray(data)) setLiked(new Set(data as string[]));
    });
  }, [supabase]);

  const toggleLike = useCallback(async (id: string) => {
    const was = liked.has(id);
    // Optimistic update, corrected by the server's answer.
    setLiked((s) => { const n = new Set(s); if (was) n.delete(id); else n.add(id); return n; });
    setPhotos((ps) => ps.map((p) => (p.id === id ? { ...p, like_count: p.like_count + (was ? -1 : 1) } : p)));
    const { data, error } = await supabase.rpc("pf_toggle_like", { p_photo: id, p_visitor: getVisitorId() });
    const row = Array.isArray(data) ? data[0] : null;
    if (error || !row) {
      setError("Couldn't save that like. Try again.");
      setLiked((s) => { const n = new Set(s); if (was) n.add(id); else n.delete(id); return n; });
      setPhotos((ps) => ps.map((p) => (p.id === id ? { ...p, like_count: p.like_count + (was ? 1 : -1) } : p)));
      return;
    }
    setLiked((s) => { const n = new Set(s); if (row.liked) n.add(id); else n.delete(id); return n; });
    setPhotos((ps) => ps.map((p) => (p.id === id ? { ...p, like_count: row.like_count } : p)));
  }, [liked, supabase]);

  // Rankings are fixed at page load so tiles don't jump around while someone is clicking.
  const ranked = initialPhotos.map((p) => photos.find((q) => q.id === p.id) ?? p);
  const top = ranked.filter((p) => p.like_count > 0).slice(0, 4);
  const picks = ranked.filter((p) => p.is_pick).sort((a, b) => a.pick_order - b.pick_order).slice(0, 6);
  const usedCats = CATEGORIES.filter((c) => ranked.some((p) => p.category === c));
  const shown = filter === "All" ? ranked : ranked.filter((p) => p.category === filter);
  const embeds = videos.map((v) => ({ ...v, src: embedUrl(v.url) })).filter((v) => v.src);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-5">
        <a href="#" className="font-display text-xl font-bold">tarang kamble</a>
        <nav aria-label="Sections" className="flex flex-wrap gap-6 text-sm">
          {top.length > 0 && <a href="#loved" className="hover:text-white">Most loved</a>}
          {picks.length > 0 && <a href="#picks" className="hover:text-white">My picks</a>}
          <a href="#all" className="hover:text-white">All work</a>
          {embeds.length > 0 && <a href="#videos" className="hover:text-white">Videos</a>}
          <a href="#about" className="hover:text-white">About</a>
        </nav>
        {userEmail ? (
          <div className="flex items-center gap-3 text-[13px] text-muted">
            <span className="hidden sm:inline">{userEmail}</span>
            <button onClick={signOut} className="min-h-10 rounded-full border border-line px-4 text-paper hover:border-paper">Sign out</button>
          </div>
        ) : (
          <a href="/login" className="flex min-h-10 items-center rounded-full border border-line px-4 text-[13px] hover:border-paper">
            Sign in with So Far
          </a>
        )}
      </header>

      <section className="mx-auto max-w-[1240px] px-6 pb-10 pt-14">
        <p className="mb-3 text-[13px] uppercase tracking-[0.12em] text-muted">Photography</p>
        <h1 className="max-w-[900px] font-display text-[clamp(40px,7vw,88px)] font-bold leading-none">
          People, places and the odd robot.
        </h1>
        <p className="mt-5 max-w-[520px] text-base leading-relaxed text-[#b8b5b0]">
          Shot on a Canon 1300D and a phone. Tap the heart on anything you like — the most loved rise to the top.
        </p>
      </section>

      {error && (
        <div role="alert" className="mx-auto mb-6 max-w-[1240px] px-6">
          <p className="rounded-2xl bg-[#2a1416] px-4 py-3 text-sm text-heart">
            {error} <button className="ml-2 underline" onClick={() => setError(null)}>Dismiss</button>
          </p>
        </div>
      )}

      {top.length > 0 && (
        <section id="loved" className="mx-auto max-w-[1240px] px-6 pb-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-bold">Most loved</h2>
            <span className="text-[13px] text-muted">ranked by visitor likes</span>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {top.map((p, i) => (
              <Tile key={p.id} photo={p} liked={liked.has(p.id)} onLike={() => toggleLike(p.id)}
                onOpen={() => setOpen({ list: top, index: i })} className="h-[300px]" rank={i + 1} />
            ))}
          </div>
        </section>
      )}

      {picks.length > 0 && (
        <section id="picks" className="mx-auto max-w-[1240px] px-6 pb-12">
          <h2 className="mb-1 font-display text-2xl font-bold">My picks</h2>
          <p className="mb-4 text-sm text-muted">The ones I&apos;d frame. Chosen by me, not the algorithm.</p>
          <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
            {picks.map((p, i) => (
              <Tile key={p.id} photo={p} liked={liked.has(p.id)} onLike={() => toggleLike(p.id)}
                onOpen={() => setOpen({ list: picks, index: i })} className="h-[420px] rounded-3xl" showTitle />
            ))}
          </div>
        </section>
      )}

      <section id="all" className="mx-auto max-w-[1240px] px-6 pb-16">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold">All work</h2>
          {usedCats.length > 1 && (
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
              {(["All", ...usedCats] as Filter[]).map((c) => (
                <button key={c} onClick={() => setFilter(c)} aria-pressed={filter === c}
                  className={`min-h-10 rounded-full border border-line px-4 text-[13px] font-medium transition-colors ${filter === c ? "bg-paper text-ink" : "hover:border-paper"}`}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        {shown.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line px-6 py-16 text-center text-muted">
            No photos here yet.
          </p>
        ) : (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {shown.map((p, i) => (
              <div key={p.id} className="mb-4 break-inside-avoid">
                <Tile photo={p} liked={liked.has(p.id)} onLike={() => toggleLike(p.id)}
                  onOpen={() => setOpen({ list: shown, index: i })} natural showCategory />
              </div>
            ))}
          </div>
        )}
      </section>

      {embeds.length > 0 && (
        <section id="videos" className="mx-auto max-w-[1240px] px-6 pb-16">
          <h2 className="mb-4 font-display text-2xl font-bold">Videos</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {embeds.map((v) => (
              <figure key={v.id} className="m-0">
                <iframe src={v.src!} title={v.title || "Video"} loading="lazy" allowFullScreen
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  className="aspect-video w-full rounded-[20px] border border-line bg-[#1c1c1f]" />
                {v.title && <figcaption className="mt-2 text-sm text-muted">{v.title}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      <footer id="about" className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4 border-t border-[#232326] px-6 py-8 text-[13px] text-muted">
        <span>© {new Date().getFullYear()} Tarang Kamble</span>
        <span>
          <a href="https://www.instagram.com/tarang_kamble" className="hover:text-paper">Instagram @tarang_kamble</a>
          {" · "}
          <a href="mailto:tarangkamble18@gmail.com" className="hover:text-paper">tarangkamble18@gmail.com</a>
        </span>
      </footer>

      {open && (
        <Lightbox
          photos={open.list.map((p) => photos.find((q) => q.id === p.id) ?? p)}
          index={open.index}
          liked={liked}
          signedIn={!!userEmail}
          onLike={toggleLike}
          onIndex={(index) => setOpen({ ...open, index })}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function Tile({ photo, liked, onLike, onOpen, className = "", rank, natural, showTitle, showCategory }: {
  photo: Photo; liked: boolean; onLike: () => void; onOpen: () => void; className?: string;
  rank?: number; natural?: boolean; showTitle?: boolean; showCategory?: boolean;
}) {
  const label = photo.title || photo.category;
  return (
    <div className={`group relative overflow-hidden rounded-[20px] bg-[#1c1c1f] ${className}`}>
      <button type="button" onClick={onOpen} aria-label={`Open ${label}`} className="block h-full w-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- pre-sized WebP from storage, no optimiser needed */}
        <img
          src={imageUrl(photo.storage_path, "thumb")}
          alt={label}
          loading="lazy"
          width={photo.width || undefined}
          height={photo.height || undefined}
          className={`w-full transition-transform duration-500 group-hover:scale-[1.03] ${natural ? "h-auto" : "h-full object-cover"}`}
        />
      </button>
      {rank && (
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1.5 font-display text-[13px] font-bold">#{rank}</span>
      )}
      <LikeButton liked={liked} count={photo.like_count} onClick={onLike} className="absolute right-2.5 top-2.5" />
      {(showTitle || showCategory) && (
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-xs">
          {showTitle ? label : photo.category}
        </span>
      )}
    </div>
  );
}
