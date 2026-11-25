-- Photo portfolio (tarang-kamble site). Lives in the So Far Supabase project so accounts are shared.
-- All objects prefixed pf_ to stay separate from So Far's own tables.
create or replace function public.pf_is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((auth.jwt() ->> 'email') = 'tarangkamble18@gmail.com', false)
$$;

create table public.pf_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  title text not null default '',
  caption text not null default '',
  category text not null default 'Portrait'
    check (category in ('Portrait','Travel','Landscape','Animals','Machines','More')),
  is_pick boolean not null default false,
  pick_order int not null default 0,
  width int not null default 0,
  height int not null default 0,
  like_count int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create index pf_photos_likes_idx on public.pf_photos (like_count desc, created_at desc);

create table public.pf_videos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.pf_likes (
  photo_id uuid not null references public.pf_photos(id) on delete cascade,
  voter text not null,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (photo_id, voter)
);

alter table public.pf_photos enable row level security;
alter table public.pf_videos enable row level security;
alter table public.pf_likes enable row level security;

create policy pf_photos_read on public.pf_photos for select using (published or public.pf_is_admin());
create policy pf_photos_admin on public.pf_photos for all using (public.pf_is_admin()) with check (public.pf_is_admin());
create policy pf_videos_read on public.pf_videos for select using (true);
create policy pf_videos_admin on public.pf_videos for all using (public.pf_is_admin()) with check (public.pf_is_admin());
-- pf_likes: no policies => only reachable through the functions below.

create or replace function public.pf_voter(p_visitor text) returns text
language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is not null then return 'u:' || auth.uid()::text; end if;
  if p_visitor is null or p_visitor !~ '^[0-9a-f-]{36}$' then raise exception 'bad visitor id'; end if;
  return 'v:' || p_visitor;
end $$;

create or replace function public.pf_toggle_like(p_photo uuid, p_visitor text)
returns table (liked boolean, like_count int)
language plpgsql volatile security definer set search_path = '' as $$
declare v text := public.pf_voter(p_visitor); n int;
begin
  if not exists (select 1 from public.pf_photos where id = p_photo and published) then
    raise exception 'photo not found';
  end if;
  delete from public.pf_likes where photo_id = p_photo and voter = v;
  if found then
    update public.pf_photos set like_count = greatest(pf_photos.like_count - 1, 0) where id = p_photo returning pf_photos.like_count into n;
    return query select false, n;
  else
    insert into public.pf_likes (photo_id, voter, user_id) values (p_photo, v, auth.uid());
    update public.pf_photos set like_count = pf_photos.like_count + 1 where id = p_photo returning pf_photos.like_count into n;
    return query select true, n;
  end if;
end $$;

create or replace function public.pf_my_likes(p_visitor text)
returns setof uuid language sql stable security definer set search_path = '' as $$
  select photo_id from public.pf_likes where voter = public.pf_voter(p_visitor)
$$;

revoke all on function public.pf_toggle_like(uuid, text) from public;
revoke all on function public.pf_my_likes(text) from public;
revoke all on function public.pf_voter(text) from public, anon, authenticated;
grant execute on function public.pf_toggle_like(uuid, text) to anon, authenticated;
grant execute on function public.pf_my_likes(text) to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 15728640, array['image/jpeg','image/webp','image/png','image/avif'])
on conflict (id) do nothing;

create policy pf_storage_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and public.pf_is_admin());
create policy pf_storage_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and public.pf_is_admin());
create policy pf_storage_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and public.pf_is_admin());
