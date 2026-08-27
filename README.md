# Crisvin Store

Customer ordering app + owner dashboard, built to run for free.

## What's in this project

```
src/
  config/store.js       ← store name, categories, settings (edit here first)
  lib/supabaseClient.js ← database connection
  lib/interest.js        ← utang interest math
  components/            ← one file per screen/feature
supabase/schema.sql      ← run this once to set up your database
```

Built this way so future changes are easy: a new feature usually means one
new file and one new database table, without touching what already works.

## First-time setup

1. **Install Node.js** if you don't have it: https://nodejs.org (LTS version)

2. **Set up the database**
   - In your Supabase project, go to SQL Editor → New query
   - Paste in everything from `supabase/schema.sql` and click Run
   - This creates all the tables and adds a few starter products

3. **Connect the app to your database**
   - Copy `.env.example` to a new file named `.env`
   - Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from
     Supabase → Project Settings → API

4. **Install and run locally**
   ```
   npm install
   npm run dev
   ```
   Open the link it gives you (usually http://localhost:5173) to test it
   on your own computer before putting it online.

## Putting it online (free)

1. Push this project to a new GitHub repository
2. Go to https://vercel.com → sign up free with your GitHub account
3. "Add New Project" → pick this repo → in Environment Variables, add the
   same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from your `.env`
4. Deploy. Vercel gives you a live link like `crisvin-store.vercel.app`
5. Anyone who opens that link on their phone can tap "Add to Home Screen"
   to install it like a real app

Every time you push a code change to GitHub, Vercel automatically updates
the live site — no extra steps.

## Known next steps

- Add real app icons (`icon-192.png`, `icon-512.png`) referenced in
  `vite.config.js` so the home-screen icon looks right instead of a
  default one
- "Add new product" form with a barcode field, so the scanner gun can
  create new products, not just find existing ones
- Printable receipt view sized for a thermal printer
