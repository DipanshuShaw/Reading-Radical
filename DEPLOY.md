# Deploy: Railway (API + MySQL) + Vercel (frontend)

## 1. Push to GitHub
Commit the whole project. `server/.env` must NOT be committed (it is git-ignored).

## 2. Railway — API + database
1. railway.com → **New Project → Deploy from GitHub repo** → pick this repo.
2. Open the new service → **Settings → Root Directory** = `/server`.
3. In the same project click **+ New → Database → MySQL**. Note the service name (default `MySQL`).
4. API service → **Variables** → add (replace `MySQL` if your DB service is named differently):
   ```
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASS=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=${{MySQL.MYSQLDATABASE}}
   JWT_SECRET=<long random string>
   CORS_ORIGINS=https://reading-radical.vercel.app
   ```
5. API service → **Settings → Networking → Generate Domain**. Copy the URL.
6. Open `<that URL>/api/health` → `{"ok":true}`, then `/api/books` → 70 books
   (tables + books are created automatically on first start).

## 3. Vercel — frontend
1. vercel.com → **Add New → Project** → import the repo (Framework: Vite, Root Directory: repo root).
2. Project name: `reading-radical` (gives `reading-radical.vercel.app` if available).
3. **Environment Variables**: `VITE_API_URL` = your Railway URL (no trailing slash). Deploy.
4. If you change `VITE_API_URL` later, **redeploy** (Vite bakes it in at build time).

## 4. Check
Open https://reading-radical.vercel.app → Explore shows books → write a review → register/login.
