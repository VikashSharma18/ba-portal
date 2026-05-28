# BA Portal — Across Assist

Internal Business Analyst Operations & Project Management Portal.

---

## STEP 1 — Supabase Database Setup

1. Go to https://supabase.com and open your project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase_schema.sql` from this folder
5. Copy ALL the contents and paste into the SQL editor
6. Click **Run** (green button)
7. You should see "Success. No rows returned"

That's it — your database, tables, and sample data are ready.

---

## STEP 2 — Upload Code to GitHub

1. Go to https://github.com/VikashSharma18/ba-portal
2. If the repo is empty, click **uploading an existing file**
3. Drag and drop ALL files from this folder
4. Click **Commit changes**

---

## STEP 3 — Deploy on Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project**
3. Select your `ba-portal` repository
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://xgyzhbyuxtikzsajkdgy.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (your anon key)
5. Click **Deploy**
6. Wait 2 minutes — your portal is live!

---

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Supabase (Database + Auth + Storage)
- Vercel (Hosting)

---

## Modules Built (Phase 1)

- ✅ Dashboard
- ✅ Tasks (Board, List, Team Tracker, By Project views)
- ✅ Projects
- ✅ Tracker
- 🔧 BRDs & Docs (Phase 2)
- 🔧 Meetings (Phase 3)
- 🔧 Insurance Ops (Phase 4)
- 🔧 Reports & Knowledge Base (Phase 5)
