# Supabase setup

## 1. Create the schema

The anon key cannot run DDL. Either:

**Option A — Dashboard (recommended, one-time):**
1. Open https://supabase.com/dashboard/project/khvwtlmfvcipmaiiwgie/sql/new
2. Paste the contents of `supabase/migrations/0001_init.sql`
3. Click **Run**

**Option B — Service role key (scriptable):**
1. Copy the `service_role` key from Project Settings → API
2. Add to `.env.local`: `SUPABASE_SERVICE_ROLE_KEY=...`
3. Run `node scripts/run-migration.mjs`

## 2. Seed data

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (bypasses RLS on writes):

```bash
node scripts/migrate-data.mjs
```

Seeds cities, services, industries, firms, and blog posts from `src/data/*.js`. Upserts on `slug`, so safe to re-run.

## 3. Vercel environment variables

Add these in the Vercel dashboard (Settings → Environment Variables) for **Production**, **Preview**, and **Development**:

| Name                            | Value                                                                 |
| ------------------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | `https://khvwtlmfvcipmaiiwgie.supabase.co`                            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(the anon key from `.env.local`)*                                    |

Or via CLI:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Do **not** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel — it's only for local admin/migration scripts.

After adding variables, redeploy so the new environment is picked up.
