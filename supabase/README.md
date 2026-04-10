# DEN Fitness Supabase Setup

## What this folder contains

- `schema.sql`
  Creates the ERP tables, role-based policies, and the `profiles` trigger tied to Supabase Auth.
- `../scripts/seed-supabase-staff.mjs`
  Creates the owner and trainer auth users, then upserts their profile/trainer records.

## Setup order

1. Open the Supabase dashboard for your project.
2. Go to `SQL Editor`.
3. If your tables already exist as `profiles + members + attendance + payments`, run [`existing-schema-compat.sql`](/C:/Users/anand/Downloads/DEN/MOBILE_APP/supabase/existing-schema-compat.sql).
4. Only use [`schema.sql`](/C:/Users/anand/Downloads/DEN/MOBILE_APP/supabase/schema.sql) for a brand-new ERP schema, not for your current production structure.
5. Add your service role key in the shell only:
   `PowerShell: $env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"`
6. Make sure your project URL is also available:
   `PowerShell: $env:NEXT_PUBLIC_SUPABASE_URL="https://pepxczgriutjlziwraax.supabase.co"`
7. Run the seed script:
   `node scripts/seed-supabase-staff.mjs`

## Seeded staff accounts

- Owner: `denzil.dsoza@denfitness.in`
- Trainer: `raj.vishwakarma@denfitness.in`
- Trainer: `raj.gupta@denfitness.in`
- Trainer: `arjun@denfitness.in`
- Trainer: `karan@denfitness.in`

Default password for all seeded accounts:

- `DenFitness@2026`

Change these passwords after first login.

## Important note

The publishable key you shared is enough for frontend login and data access under RLS, but it is not enough to create tables or admin users remotely. For remote creation, the missing credential is:

- `SUPABASE_SERVICE_ROLE_KEY`
