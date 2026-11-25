"use client";

import { useEffect, useRef } from "react";
import { imageUrl } from "@/lib/config";
import type { Photo } from "@/lib/types";
import { Heart } from "./Heart";

export default function Lightbox({ photos, index, liked, signedIn, onLike, onIndex, onClose }: {
  photos: Photo[]; index: number; liked: Set<string>; signedIn: boolean;
  onLike: (id: string) => void; onIndex: (i: number) => void; onClose: () => void;
}) {
  const photo = photos[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const isLiked = photo ? liked.has(photo.id) : false;
  const prev = () => onIndex((index - 1 + photos.length) % photos.length);
  const next = () => onIndex((index + 1) % photos.length);

  // Keyboard: ← → browse, L like, Esc close. Listener lives only while the viewer is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onIndex((index - 1 + photos.length) % photos.length);
      else if (e.key === "ArrowRight") onIndex((index + 1) % photos.length);
      else if (e.key.toLowerCase() === "l" && photo) onLike(photo.id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, photo, onClose, onIndex, onLike]);

  useEffect(() => {
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  if (!photo) return null;
  const title = photo.title || photo.category;

  return (
    <div role="dialog" aria-modal="true" aria-label={title}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#070708] lg:flex-row">
      <div className="relative flex min-h-[60vh] flex-1 items-center justify-center p-6">
        <button ref={closeRef} onClick={onClose} aria-label="Close"
          className="absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-[#1c1c1f] hover:bg-[#2a2a2d]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl(photo.storage_path, "full")} alt={title}
          className="max-h-[85vh] max-w-full rounded-3xl object-contain" />
      </div>
      <aside className="flex flex-col gap-5 bg-[#121214] p-8 lg:w-[360px]">
        <div>
          <p className="mb-1.5 text-xs uppercase tracking-[0.12em] text-muted">{photo.category}</p>
          <h2 className="font-display text-3xl font-bold">{title}</h2>
          {photo.caption && <p className="mt-2.5 text-sm leading-relaxed text-[#b8b5b0]">{photo.caption}</p>}
        </div>
        <button onClick={() => onLike(photo.id)} aria-pressed={isLiked}
          className={`flex min-h-[52px] items-center justify-center gap-2.5 rounded-full border text-[15px] font-semibold transition-colors ${isLiked ? "border-heart bg-heart text-[#140708]" : "border-[#3a3a3d] hover:border-paper"}`}>
          <Heart filled={isLiked} size={20} />
          {isLiked ? "Liked" : "Like"} · {photo.like_count}
        </button>
        {isLiked && !signedIn && (
          <p className="rounded-2xl bg-[#1c1c1f] p-4 text-[13px] leading-relaxed text-[#c9c6c0]">
            Saved on this browser. <a href="/login" className="font-semibold underline">Sign in with your So Far account</a> to keep likes across devices — optional.
          </p>
        )}
        <p className="text-[13px] text-muted">← → to browse · L to like · Esc to close</p>
        {photos.length > 1 && (
          <div className="mt-auto flex gap-3">
            <button onClick={prev} className="min-h-11 flex-1 rounded-full border border-[#3a3a3d] text-sm hover:border-paper">← Previous</button>
            <button onClick={next} className="min-h-11 flex-1 rounded-full border border-[#3a3a3d] text-sm hover:border-paper">Next →</button>
          </div>
        )}
      </aside>
    </div>
  );
}
