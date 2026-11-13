-- ============================================================
-- SHADOWZ HUB — Supabase database schema
--
-- HOW TO USE:
-- 1. Go to your Supabase project -> SQL Editor -> New query.
-- 2. Before running, find the line that says:
--      YOUR_OWNER_EMAIL_HERE
--    and replace it with your real owner Gmail address
--    (thunder194786@gmail.com), keeping the quotes.
-- 3. Paste this whole file in and click "Run".
-- 4. Run it only once on a fresh project.
-- ============================================================

-- ---------- Types ----------
create type user_role as enum ('member', 'moderator', 'administrator', 'admin', 'owner');
create type website_status as enum ('draft', 'pending', 'published', 'archived');
create type account_status as enum ('active', 'banned', 'suspended');
create type report_status as enum ('open', 'resolved', 'dismissed');

-- ---------- Tables ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  email text not null,
  role user_role not null default 'member',
  status account_status not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

create table public.websites (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  url text not null,
  logo_url text,
  thumbnail_url text,
  description text not null default '',
  category_id uuid references public.categories(id) on delete set null,
  status website_status not null default 'draft',
  is_new boolean not null default true,
  display_order integer not null default 0,
  visits integer not null default 0,
  clicks integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  website_id uuid not null references public.websites(id) on delete cascade,
  reporter_email text,
  reason text not null,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table public.platform_settings (
  key text primary key,
  value jsonb not null
);

-- ============================================================
-- Owner auto-assignment
-- Runs automatically every time someone registers. Verifies the
-- email on the SERVER (not the frontend) before granting Owner.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    case
      when lower(new.email) = lower('YOUR_OWNER_EMAIL_HERE') then 'owner'
      else 'member'
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Role / permission helper functions (security definer so they
-- bypass RLS safely when used INSIDE policies - this avoids
-- infinite-recursion issues and is the standard Supabase pattern)
-- ============================================================
create or replace function public.current_role_rank()
returns int
language sql stable
security definer set search_path = public
as $$
  select case role
    when 'owner' then 4
    when 'admin' then 3
    when 'administrator' then 2
    when 'moderator' then 1
    else 0
  end
  from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin_or_above()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_rank(), 0) >= 3;
$$;

create or replace function public.is_administrator_or_above()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_rank(), 0) >= 2;
$$;

create or replace function public.is_moderator_or_above()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_rank(), 0) >= 1;
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select role = 'owner' from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- CRITICAL SECURITY TRIGGER
-- Even if someone calls the API directly (bypassing the UI),
-- this trigger makes it impossible to:
--   - change your OWN role or ban/unban status
--   - change ANYONE's role unless you are 'admin' or 'owner'
--   - grant or remove the 'owner' role unless you ARE the owner
-- This is what makes role protection real instead of just hidden buttons.
-- ============================================================
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  acting_rank int;
  acting_is_owner boolean;
begin
  select public.current_role_rank() into acting_rank;
  select public.is_owner() into acting_is_owner;

  -- Only admin-tier (rank >= 3) or owner may ever change role/status at all
  if coalesce(acting_rank, 0) < 3 then
    new.role := old.role;
    new.status := old.status;
  end if;

  -- Only an Owner may touch the Owner boundary
  if (new.role = 'owner' or old.role = 'owner') and new.role is distinct from old.role and not coalesce(acting_is_owner, false) then
    new.role := old.role;
  end if;

  -- Nobody can change their own role/status through a self-row update,
  -- even if they are an admin or owner - must be done from the Users page targeting someone else.
  if auth.uid() = old.id then
    new.role := old.role;
    new.status := old.status;
  end if;

  return new;
end;
$$;

create trigger protect_profile_fields_trigger
  before update on public.profiles
  for each row execute procedure public.protect_profile_fields();

-- ============================================================
-- Visit / click counter RPC
-- ============================================================
create or replace function public.increment_website_counter(site_id uuid, column_name text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if column_name = 'visits' then
    update public.websites set visits = visits + 1 where id = site_id;
  elsif column_name = 'clicks' then
    update public.websites set clicks = clicks + 1 where id = site_id;
  end if;
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.websites enable row level security;
alter table public.audit_logs enable row level security;
alter table public.reports enable row level security;
alter table public.contact_messages enable row level security;
alter table public.platform_settings enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_select_admin" on public.profiles for select using (public.is_admin_or_above());
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_update_admin" on public.profiles for update using (public.is_admin_or_above());

-- categories
create policy "categories_select_public" on public.categories for select using (true);
create policy "categories_write_admin" on public.categories for all
  using (public.is_admin_or_above()) with check (public.is_admin_or_above());

-- websites
create policy "websites_select_published" on public.websites for select using (status = 'published');
create policy "websites_select_admin" on public.websites for select using (public.is_administrator_or_above());
create policy "websites_insert_admin" on public.websites for insert with check (public.is_administrator_or_above());
create policy "websites_update_admin" on public.websites for update using (public.is_administrator_or_above());
create policy "websites_delete_admin" on public.websites for delete using (public.is_administrator_or_above());

-- audit_logs
create policy "audit_logs_select_admin" on public.audit_logs for select using (public.is_admin_or_above());
create policy "audit_logs_insert_admin" on public.audit_logs for insert with check (public.is_administrator_or_above());

-- reports
create policy "reports_insert_public" on public.reports for insert with check (true);
create policy "reports_select_moderator" on public.reports for select using (public.is_moderator_or_above());
create policy "reports_update_moderator" on public.reports for update using (public.is_moderator_or_above());

-- contact_messages
create policy "contact_insert_public" on public.contact_messages for insert with check (true);
create policy "contact_select_admin" on public.contact_messages for select using (public.is_admin_or_above());

-- platform_settings
create policy "settings_select_public" on public.platform_settings for select using (true);
create policy "settings_write_admin" on public.platform_settings for all
  using (public.is_admin_or_above()) with check (public.is_admin_or_above());

-- ============================================================
-- Storage bucket for website logos / thumbnails
-- ============================================================
insert into storage.buckets (id, name, public)
values ('shadowz-assets', 'shadowz-assets', true)
on conflict (id) do nothing;

create policy "shadowz_assets_public_read" on storage.objects
  for select using (bucket_id = 'shadowz-assets');
create policy "shadowz_assets_admin_insert" on storage.objects
  for insert with check (bucket_id = 'shadowz-assets' and public.is_administrator_or_above());
create policy "shadowz_assets_admin_update" on storage.objects
  for update using (bucket_id = 'shadowz-assets' and public.is_administrator_or_above());
create policy "shadowz_assets_admin_delete" on storage.objects
  for delete using (bucket_id = 'shadowz-assets' and public.is_administrator_or_above());

-- ============================================================
-- Starter categories (optional - safe to edit or delete rows after)
-- ============================================================
insert into public.categories (name, slug) values
  ('Gaming', 'gaming'),
  ('Tools', 'tools'),
  ('Community', 'community');
