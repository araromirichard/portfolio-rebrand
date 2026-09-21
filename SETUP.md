# Portfolio Backend — Setup Guide

## 1. Create a Supabase project (free)

1. Go to https://app.supabase.com and create a new project.
2. Open **SQL Editor** and run everything in `portfolio-api/supabase/schema.sql`.
3. Note your credentials from **Project Settings → API**:
   - Project URL  →  `SUPABASE_URL`
   - **service_role** secret key  →  `SUPABASE_SERVICE_ROLE_KEY`
   - **anon / public** key  →  `SUPABASE_ANON_KEY` (used in admin.html)

## 2. Configure the admin panel

Open `assets/js/admin.js` and fill in the top three constants:

```js
const SUPABASE_URL      = 'https://xxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJ...'      // anon/public key
const API_BASE          = 'https://portfolio-api-xxxx.onrender.com'  // set after step 3
```

Also add your Netlify URL to the Supabase **Auth → URL Configuration → Redirect URLs** list:

```
https://your-site.netlify.app/admin.html
```

## 3. Deploy the API to Render (free)

1. Push this repo to GitHub (make sure `portfolio-api/` is included).
2. Go to https://render.com → **New → Web Service** → connect your repo.
3. Set the **Root Directory** to `portfolio-api`.
4. Render will auto-detect `render.yaml`. Add these env vars in the Render dashboard:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key |
| `ALLOWED_ORIGINS` | `https://your-site.netlify.app,http://localhost:3000` |

5. Deploy. Copy the URL (e.g. `https://portfolio-api-xxxx.onrender.com`).

> **Note:** Render's free tier spins down after 15 min of inactivity.
> The first request after a cold start takes ~30 s. This is fine for a portfolio.

## 4. Wire up the portfolio frontend

Open `assets/js/main.js` and set:

```js
const API_BASE = 'https://portfolio-api-xxxx.onrender.com'
```

Commit + push → Netlify will redeploy automatically.

## 5. Use the admin panel

Visit `https://your-site.netlify.app/admin.html`.  
Enter your email → click the magic link → manage projects & stacks.

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/projects?page=1&limit=6` | — | List projects (paginated) |
| GET | `/api/projects/:id` | — | Single project |
| POST | `/api/projects` | ✓ | Create project |
| PUT | `/api/projects/:id` | ✓ | Update project |
| DELETE | `/api/projects/:id` | ✓ | Delete project |
| GET | `/api/stacks?category=frontend` | — | List stacks |
| GET | `/api/stacks/:id` | — | Single stack |
| POST | `/api/stacks` | ✓ | Create stack |
| PUT | `/api/stacks/:id` | ✓ | Update stack |
| DELETE | `/api/stacks/:id` | ✓ | Delete stack |
| GET | `/health` | — | Health check |
