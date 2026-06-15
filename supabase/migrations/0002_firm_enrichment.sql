-- FindFinancePros — firm enrichment columns
-- Adds structured team rosters and pricing notes captured by the website-scraping
-- pipeline. Run in the Supabase SQL editor (programmatic DDL is disabled on this
-- project), or via a direct Postgres connection.

alter table public.firms
  add column if not exists team jsonb default '[]'::jsonb;

alter table public.firms
  add column if not exists pricing_notes text;

comment on column public.firms.team is
  'Array of {name, title, credentials} extracted from the firm website team page.';
comment on column public.firms.pricing_notes is
  'Free-text pricing details captured from the firm website (beyond min_engagement).';
