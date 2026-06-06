# Neon PostgreSQL Deployment

This app stores workflow cases in Neon PostgreSQL through the `DATABASE_URL` environment variable.

## 1. Configure Environment Variables

Local development:

```bash
export DATABASE_URL="postgres://USER:PASSWORD@HOST/database?sslmode=require"
npm run dev
```

Vercel:

1. Open the Vercel project settings.
2. Go to **Environment Variables**.
3. Add `DATABASE_URL` for Production, Preview, and Development as needed.
4. Use the Neon pooled or direct connection string with SSL enabled.
5. Redeploy after saving the variable.

## 2. Run Migrations

Run these scripts in order using the Neon SQL Editor:

```text
migrations/001_create_cases_and_events.sql
migrations/002_seed_demo_cases.sql
```

Or run them with `psql`:

```bash
psql "$DATABASE_URL" -f migrations/001_create_cases_and_events.sql
psql "$DATABASE_URL" -f migrations/002_seed_demo_cases.sql
```

The seed migration inserts the current demo workflow cases so `/ops/cases` remains populated after the app switches to Postgres-only reads.

## 3. Deploy

1. Confirm `DATABASE_URL` exists in the target Vercel environment.
2. Confirm both migrations have completed successfully.
3. Deploy the app.
4. Open `/ops/cases`.

## 4. Smoke Test

After deployment:

1. Open `/ops/cases` and confirm `YC-2401`, `YC-2402`, and `YC-2403` appear.
2. Open `/intake`, create a workflow case, and confirm the app redirects to `/ops/cases/{id}`.
3. Return to `/ops/cases` and confirm the new intake case appears.
4. Open a case detail page and click an approval-state action.
5. Refresh the detail page and confirm the state persists.
6. In Neon, confirm audit rows exist:

```sql
select case_id, event_type, from_state, to_state, message, created_at
from case_events
order by created_at desc
limit 20;
```

## 5. Rollback

Run rollback scripts in reverse order:

```bash
psql "$DATABASE_URL" -f migrations/rollback/002_seed_demo_cases.sql
psql "$DATABASE_URL" -f migrations/rollback/001_create_cases_and_events.sql
```

Or paste them into the Neon SQL Editor in the same order.

The schema rollback drops both `case_events` and `cases`, so use it only when the case data can be discarded or has already been exported.
