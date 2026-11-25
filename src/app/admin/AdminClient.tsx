"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BUCKET, CATEGORIES, imageUrl, type Category } from "@/lib/config";
import { toWebp } from "@/lib/resize";
import { embedUrl } from "@/lib/video";
import type { Photo, Video } from "@/lib/types";

type Item = {
  key: string; file: File; preview: string; title: string; category: Category; isPick: boolean;
  status: "ready" | "working" | "done" | "error"; error?: string;
};
type Tab = "upload" | "photos" | "videos";

const field = "min-h-11 rounded-xl border border-line bg-[#1a1a1d] px-3 text-sm text-paper";
const ghostBtn = "min-h-11 rounded-full border border-[#3a3a3d] px-4 text-[13px] font-semibold hover:border-paper";

function titleFromName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\b(img|dsc|pxl)\s?\d+/gi, "").trim();
}

export default function AdminClient({ email, initialPhotos, initialVideos }: {
  email: string; initialPhotos: Photo[]; initialVideos: Video[];
}) {
  const supabase = useMemo(() => createClient(), []);
  const [tab, setTab] = useState<Tab>("upload");
  const [items, setItems] = useState<Item[]>([]);
  const [photos, setPhotos] = useState(initialPhotos);
  const [videos, setVideos] = useState(initialVideos);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function addFiles(files: FileList | File[]) {
    const next = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name)).map((file) => ({
      key: crypto.randomUUID(), file, preview: URL.createObjectURL(file), title: titleFromName(file.name),
      category: "Portrait" as Category, isPick: false, status: "ready" as const,
    }));
    setItems((cur) => [...cur, ...next]);
  }
  const patch = (key: string, p: Partial<Item>) => setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...p } : i)));

  async function uploadAll() {
    setBusy(true);
    let maxPick = Math.max(0, ...photos.map((p) => p.pick_order));
    for (const item of items.filter((i) => i.status === "ready" || i.status === "error")) {
      patch(item.key, { status: "working", error: undefined });
      const id = crypto.randomUUID();
      try {
        const full = await toWebp(item.file, 2400, 0.85);
        const thumb = await toWebp(item.file, 900, 0.8);
        const store = supabase.storage.from(BUCKET);
        const opts = { contentType: "image/webp", cacheControl: "31536000", upsert: false };
        const a = await store.upload(`${id}/full.webp`, full.blob, opts);
        if (a.error) throw a.error;
        const b = await store.upload(`${id}/thumb.webp`, thumb.blob, opts);
        if (b.error) { await store.remove([`${id}/full.webp`]); throw b.error; }
        const { data, error } = await supabase.from("pf_photos").insert({
          storage_path: id, title: item.title.trim(), category: item.category, is_pick: item.isPick,
          pick_order: item.isPick ? ++maxPick : 0, width: full.width, height: full.height,
        }).select().single();
        if (error) { await store.remove([`${id}/full.webp`, `${id}/thumb.webp`]); throw error; }
        setPhotos((cur) => [data as Photo, ...cur]);
        patch(item.key, { status: "done" });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        patch(item.key, {
          status: "error",
          error: /decode|source image|InvalidStateError/i.test(msg) ? "Can't read this file here (HEIC?). Export as JPG and retry." : msg,
        });
      }
    }
    setBusy(false);
  }

  async function updatePhoto(id: string, p: Partial<Photo>) {
    const before = photos;
    setPhotos((cur) => cur.map((x) => (x.id === id ? { ...x, ...p } : x)));
    const { error } = await supabase.from("pf_photos").update(p).eq("id", id);
    if (error) { setPhotos(before); setNote(`Save failed: ${error.message}`); }
  }

  async function deletePhoto(photo: Photo) {
    if (!window.confirm(`Delete "${photo.title || photo.category}" permanently? Its likes go too. This can't be undone.`)) return;
    const { error } = await supabase.from("pf_photos").delete().eq("id", photo.id);
    if (error) { setNote(`Delete failed: ${error.message}`); return; }
    await supabase.storage.from(BUCKET).remove([`${photo.storage_path}/full.webp`, `${photo.storage_path}/thumb.webp`]);
    setPhotos((cur) => cur.filter((x) => x.id !== photo.id));
  }

  const [vUrl, setVUrl] = useState("");
  const [vTitle, setVTitle] = useState("");
  async function addVideo(e: React.FormEvent) {
    e.preventDefault();
    if (!embedUrl(vUrl)) { setNote("That link isn't a YouTube or Instagram post/reel link."); return; }
    const { data, error } = await supabase.from("pf_videos")
      .insert({ url: vUrl.trim(), title: vTitle.trim(), sort: videos.length }).select("id,url,title,sort").single();
    if (error) { setNote(`Couldn't add video: ${error.message}`); return; }
    setVideos((cur) => [...cur, data as Video]);
    setVUrl(""); setVTitle("");
  }
  async function deleteVideo(v: Video) {
    if (!window.confirm(`Remove "${v.title || v.url}" from the site?`)) return;
    const { error } = await supabase.from("pf_videos").delete().eq("id", v.id);
    if (error) setNote(`Couldn't remove: ${error.message}`); else setVideos((cur) => cur.filter((x) => x.id !== v.id));
  }

  const ready = items.filter((i) => i.status === "ready" || i.status === "error").length;
  const tabs: [Tab, string][] = [["upload", "Upload"], ["photos", `Photos (${photos.length})`], ["videos", `Videos (${videos.length})`]];

  return (
    <div className="flex min-h-screen flex-wrap">
      <nav aria-label="Admin" className="flex w-full flex-col gap-1.5 border-b border-[#232326] p-6 md:w-[220px] md:border-b-0 md:border-r">
        <Link href="/" className="mb-4 font-display text-lg font-bold">← Site</Link>
        {tabs.map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)} aria-current={tab === t ? "page" : undefined}
            className={`rounded-xl p-3 text-left text-sm ${tab === t ? "bg-[#1e1e21]" : "hover:bg-[#161618]"}`}>{label}</button>
        ))}
        <span className="mt-4 text-xs text-muted md:mt-auto">Signed in as {email}</span>
      </nav>

      <main className="flex min-w-0 flex-[999_1_560px] flex-col gap-6 p-8">
        {note && (
          <p role="alert" className="rounded-2xl bg-[#2a1416] px-4 py-3 text-sm text-heart">
            {note} <button className="ml-2 underline" onClick={() => setNote(null)}>Dismiss</button>
          </p>
        )}

        {tab === "upload" && (
          <>
            <div>
              <h1 className="font-display text-3xl font-bold">Upload photos</h1>
              <p className="mt-1.5 text-sm text-muted">Resized to WebP in your browser (2400px + 900px thumbnail) before upload.</p>
            </div>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
              className={`flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-2.5 rounded-[20px] border-2 border-dashed p-6 text-center ${dragOver ? "border-paper bg-[#161618]" : "border-[#3a3a3d]"}`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a3a09b" strokeWidth="1.8" aria-hidden="true"><path d="M12 16V4M6 10l6-6 6 6M4 20h16" /></svg>
              <span className="text-base font-semibold">Drop photos here or tap to choose</span>
              <span className="text-[13px] text-muted">JPG, PNG, WebP · HEIC only in Safari</span>
              <input type="file" multiple accept="image/*" className="sr-only" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
            </label>

            <ul className="flex flex-col gap-3">
              {items.map((i) => (
                <li key={i.key} className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#232326] bg-[#151517] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.preview} alt="" className="h-[72px] w-[72px] rounded-xl object-cover" />
                  <label className="flex flex-[2_1_200px] flex-col gap-1 text-xs text-muted">Title
                    <input className={field} value={i.title} disabled={i.status === "done"} onChange={(e) => patch(i.key, { title: e.target.value })} />
                  </label>
                  <label className="flex flex-[1_1_140px] flex-col gap-1 text-xs text-muted">Category
                    <select className={field} value={i.category} disabled={i.status === "done"} onChange={(e) => patch(i.key, { category: e.target.value as Category })}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <button type="button" disabled={i.status === "done"} onClick={() => patch(i.key, { isPick: !i.isPick })} aria-pressed={i.isPick}
                    className={`min-h-11 rounded-full border px-3.5 text-[13px] font-semibold ${i.isPick ? "border-pick bg-pick text-[#1a1406]" : "border-[#3a3a3d]"}`}>
                    {i.isPick ? "★ My pick" : "☆ Add to my picks"}
                  </button>
                  <span className={`min-w-[90px] text-right text-xs ${i.status === "error" ? "text-heart" : "text-muted"}`}>
                    {i.status === "ready" ? "Ready" : i.status === "working" ? "Uploading…" : i.status === "done" ? "Published ✓" : i.error}
                  </span>
                  {i.status !== "done" && i.status !== "working" && (
                    <button type="button" aria-label="Remove from queue" onClick={() => setItems((cur) => cur.filter((x) => x.key !== i.key))}
                      className="h-11 w-11 rounded-full text-muted hover:text-paper">✕</button>
                  )}
                </li>
              ))}
            </ul>
            {items.length > 0 && (
              <div className="flex flex-wrap justify-end gap-3">
                <button className={ghostBtn} disabled={busy} onClick={() => setItems((cur) => cur.filter((i) => i.status !== "done"))}>Clear finished</button>
                <button disabled={busy || ready === 0} onClick={uploadAll}
                  className="min-h-12 rounded-full bg-paper px-6 text-sm font-semibold text-ink disabled:opacity-50">
                  {busy ? "Uploading…" : `Publish ${ready} photo${ready === 1 ? "" : "s"}`}
                </button>
              </div>
            )}
          </>
        )}

        {tab === "photos" && (
          <>
            <h1 className="font-display text-3xl font-bold">Photos</h1>
            {photos.length === 0 && <p className="text-muted">Nothing uploaded yet.</p>}
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {photos.map((p) => (
                <li key={p.id} className="flex flex-col gap-2.5 rounded-2xl border border-[#232326] bg-[#151517] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl(p.storage_path, "thumb")} alt="" className={`h-44 w-full rounded-xl object-cover ${p.published ? "" : "opacity-40"}`} />
                  <span className="text-xs text-muted">♥ {p.like_count} likes</span>
                  <input aria-label="Title" className={field} defaultValue={p.title}
                    onBlur={(e) => e.target.value !== p.title && updatePhoto(p.id, { title: e.target.value })} />
                  <input aria-label="Caption" placeholder="Caption (place, year, lens…)" className={field} defaultValue={p.caption}
                    onBlur={(e) => e.target.value !== p.caption && updatePhoto(p.id, { caption: e.target.value })} />
                  <select aria-label="Category" className={field} value={p.category} onChange={(e) => updatePhoto(p.id, { category: e.target.value as Category })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <div className="flex flex-wrap gap-2">
                    <button aria-pressed={p.is_pick} onClick={() => updatePhoto(p.id, { is_pick: !p.is_pick, pick_order: !p.is_pick ? Math.max(0, ...photos.map((x) => x.pick_order)) + 1 : 0 })}
                      className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${p.is_pick ? "border-pick bg-pick text-[#1a1406]" : "border-[#3a3a3d]"}`}>
                      {p.is_pick ? "★ Pick" : "☆ Pick"}
                    </button>
                    <button aria-pressed={!p.published} onClick={() => updatePhoto(p.id, { published: !p.published })}
                      className="min-h-10 rounded-full border border-[#3a3a3d] px-3 text-xs font-semibold">
                      {p.published ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => deletePhoto(p)} className="ml-auto min-h-10 rounded-full border border-[#4a2226] px-3 text-xs font-semibold text-heart">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {tab === "videos" && (
          <>
            <h1 className="font-display text-3xl font-bold">Videos</h1>
            <form onSubmit={addVideo} className="flex flex-wrap items-end gap-3">
              <label className="flex flex-[3_1_280px] flex-col gap-1 text-xs text-muted">YouTube or Instagram link
                <input required className={field} value={vUrl} onChange={(e) => setVUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…" />
              </label>
              <label className="flex flex-[2_1_180px] flex-col gap-1 text-xs text-muted">Title
                <input className={field} value={vTitle} onChange={(e) => setVTitle(e.target.value)} placeholder="IITG Class Song '24" />
              </label>
              <button className={ghostBtn}>Add</button>
            </form>
            <ul className="flex flex-col gap-2">
              {videos.map((v) => (
                <li key={v.id} className="flex items-center gap-3 rounded-2xl border border-[#232326] bg-[#151517] px-4 py-3 text-sm">
                  <span className="flex-1 truncate">{v.title || v.url}</span>
                  <button onClick={() => deleteVideo(v)} className="min-h-10 rounded-full px-3 text-xs text-heart">Remove</button>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
