-- FindFinancePros initial schema
-- Run this in the Supabase SQL editor, or let scripts/run-migration.js execute it via the service_role key.

create extension if not exists "pgcrypto";

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists public.firms (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  contact text,
  title text,
  email text,
  phone text,
  city text not null,
  city_label text not null,
  province text not null,
  country text not null,
  services text[] default '{}',
  industries text[] default '{}',
  description text,
  website text,
  linkedin text,
  logo_url text,
  tagline text,
  year_founded integer,
  team_size text,
  certifications text[] default '{}',
  languages text[] default '{}',
  service_area text,
  min_engagement text,
  long_description text,
  accepts_new_clients boolean default true,
  free_consultation boolean default false,
  plan text default 'free',
  plan_expires_at timestamptz,
  priority_score integer default 0,
  status text default 'active',
  claimed boolean default false,
  claimed_by_email text,
  claimed_at timestamptz,
  submitted_by text default 'admin',
  source text default 'manual',
  verified_website boolean default false,
  views_count integer default 0,
  inquiries_count integer default 0,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists firms_city_idx on public.firms (city);
create index if not exists firms_status_idx on public.firms (status);
create index if not exists firms_plan_idx on public.firms (plan);
create index if not exists firms_services_idx on public.firms using gin (services);
create index if not exists firms_industries_idx on public.firms using gin (industries);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  province text not null,
  country text not null
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  description text
);

create table if not exists public.industries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label text not null,
  description text
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null,
  phone text,
  company text,
  message text,
  firm_id uuid references public.firms(id) on delete set null,
  city text,
  services_needed text[] default '{}',
  created_at timestamptz default now()
);

create index if not exists leads_firm_id_idx on public.leads (firm_id);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  meta_description text,
  author text,
  author_title text,
  date text,
  read_time text,
  category text,
  tags text[] default '{}',
  content text,
  related_services text[] default '{}',
  related_cities text[] default '{}',
  related_industries text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.firms enable row level security;
alter table public.cities enable row level security;
alter table public.services enable row level security;
alter table public.industries enable row level security;
alter table public.leads enable row level security;
alter table public.blog_posts enable row level security;

-- firms: public read of active firms only
drop policy if exists "firms public read active" on public.firms;
create policy "firms public read active"
  on public.firms for select
  to anon, authenticated
  using (status = 'active');

-- cities / services / industries / blog_posts: public read
drop policy if exists "cities public read" on public.cities;
create policy "cities public read"
  on public.cities for select to anon, authenticated using (true);

drop policy if exists "services public read" on public.services;
create policy "services public read"
  on public.services for select to anon, authenticated using (true);

drop policy if exists "industries public read" on public.industries;
create policy "industries public read"
  on public.industries for select to anon, authenticated using (true);

drop policy if exists "blog_posts public read" on public.blog_posts;
create policy "blog_posts public read"
  on public.blog_posts for select to anon, authenticated using (true);

-- leads: public insert only (visitors submit; nobody reads via anon)
drop policy if exists "leads public insert" on public.leads;
create policy "leads public insert"
  on public.leads for insert
  to anon, authenticated
  with check (true);

-- Writes on all other tables are restricted by default (no policy = denied).
-- The service_role key bypasses RLS and is used for admin/migration tasks.
