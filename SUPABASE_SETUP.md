# 🚀 Supabase Setup Guide

## Step 1: Create a Supabase Project (2 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `bne-validation` (or any name you like)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you (e.g., `eu-central-1` for Germany)
4. Click **"Create new project"** and wait ~2 minutes for setup

---

## Step 2: Create Database Tables (1 minute)

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"+ New query"**
3. Copy the entire contents of `supabase-schema.sql` from this project
4. Paste it into the SQL editor
5. Click **"Run"** (or Cmd+Enter)
6. You should see "Success. No rows returned." - that's correct!

---

## Step 3: Get Your API Keys (30 seconds)

1. In Supabase dashboard, click **"Project Settings"** (gear icon at bottom)
2. Click **"API"** in the submenu
3. You'll see:
   - **Project URL**: Copy this (looks like `https://xxxx.supabase.co`)
   - **anon public key**: Copy this (long string starting with `eyJhbG...`)

---

## Step 4: Configure Your App (30 seconds)

1. Create a `.env` file in the `bne-dashboard` folder:

```bash
cd /Volumes/MaxStore/02_Current_Projects/BNE\ KIT\ VALIDATION/bne-dashboard
cp .env.example .env
```

2. Edit `.env` and paste your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-long-key
```

3. Restart the dev server:

```bash
npm run dev
```

---

## Step 5: Verify Connection ✅

1. Open the dashboard in your browser
2. Look at the sidebar - you should see:
   - 🟢 **"Cloud Sync Active"** = Connected!
   - ⚪ **"Local Only"** = Not connected (check your .env file)

---

## Step 6: Share with Your Co-Founder

### Option A: Both use localhost during development
- Share your `.env` file securely (NOT via email/Slack - use a password manager)
- Both of you run `npm run dev` locally
- Both connect to the same Supabase database

### Option B: Deploy to Vercel (Recommended for production)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
```

Then share the Vercel URL with your co-founder!

---

## 🔄 Real-Time Sync

Once connected:
- ✅ Tasks you add appear on your co-founder's screen **instantly**
- ✅ Interviews are synced **in real-time**
- ✅ Goals and settings are shared
- ✅ Data is backed up to the cloud automatically
- ✅ Local storage is kept as a backup (works offline too!)

---

## 💰 Free Tier Limits (More than enough for you)

| Feature | Free Tier Limit | Your Usage |
|---------|-----------------|------------|
| Database | 500MB | ~0.1% |
| API Requests | Unlimited | ✅ |
| Realtime | Unlimited | ✅ |
| Auth Users | 50,000 MAU | 2 users |

---

## 🆘 Troubleshooting

### "Local Only" shows despite configuring .env

1. Make sure `.env` is in the root `bne-dashboard` folder
2. Restart the dev server (`npm run dev`)
3. Check browser console for errors (F12 → Console)

### Changes not syncing

1. Check both users have the same `VITE_SUPABASE_URL`
2. Verify RLS policies are enabled (Step 2 SQL includes this)
3. Check browser console for Supabase errors

### Want to reset all data?

```sql
-- Run in Supabase SQL Editor to clear everything
DELETE FROM tasks;
DELETE FROM interviews;
DELETE FROM goals WHERE id = 1;
INSERT INTO goals (id) VALUES (1);
```

---

## 🎉 You're Ready!

Your BNE Validation Dashboard is now:
- ☁️ Synced to the cloud
- 👥 Accessible by both co-founders
- 🔄 Real-time collaborative
- 💾 Backed up automatically

Happy validating! 🚀
