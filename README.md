# Reading Radical

Book review site: React + Vite + Tailwind frontend, Express + MySQL backend.

## Run it (one command)
Make sure MySQL is running, then from the project root:
```
npm run dev
```
This will, automatically:
1. create `server/.env` from the example if it's missing (set `DB_PASS` and `JWT_SECRET` in it),
2. install any missing dependencies,
3. create the `readingradical` database, tables and the 70 seed books on first start,
4. start the API (http://localhost:5000, auto-restarts on change) and the site (http://localhost:5173, opens in your browser).

Press Ctrl+C once to stop both. Run them separately with `npm run dev:server` / `npm run dev:client`.

Set `VITE_API_URL` (see `.env.example`) if the backend is not on `http://localhost:5000`.

## Features
Browse/search books by genre, read and write reviews (average ratings shown on cards),
register/login (JWT, "remember me"), contact/feedback form, legal pages.
