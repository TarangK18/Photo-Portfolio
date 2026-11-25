# Tarang Kamble — Photography

Next.js 16 + Supabase (shared with the So Far project, so So Far accounts can sign in).

## Run locally
```
npm install
npm run dev        # http://localhost:3000
```
`.env.local` holds the public Supabase URL + publishable key (see `.env.example`).

## How it works
| Piece | Where |
|---|---|
| Public gallery (Most loved, My picks, All work, Videos) | `src/app/page.tsx`, `src/components/Gallery.tsx` |
| Photo viewer with likes | `src/components/Lightbox.tsx` |
| Admin: upload / edit / videos | `/admin` → `src/app/admin/` (only tarangkamble18@gmail.com) |
| Sign-in (magic link, So Far accounts only) | `/login`, `src/app/auth/callback/route.ts` |
| Database + storage rules | `supabase/migrations/` (tables prefixed `pf_`) |

- Likes need no account: each browser gets a random id in localStorage. Signed-in likes are tied to the account.
- Uploads are resized in the browser to WebP (2400px full + 900px thumb) and stored in the `portfolio` bucket.
- Admin rights are enforced by the database (`pf_is_admin()`), not just by hiding the page.

## Deploy (Vercel)
1. Import the GitHub repo in Vercel; add the two `NEXT_PUBLIC_SUPABASE_*` env vars.
2. Supabase → Authentication → URL Configuration: add `https://<your-domain>/auth/callback` (and `http://localhost:3000/auth/callback`) to Redirect URLs.
