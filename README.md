# StreamHub — Frontend

A YouTube-style frontend for the StreamHub Platform API, built with Vue 3
(Composition API), Vue Router, Pinia, and Axios. Video playback uses
`hls.js` since the backend serves `.m3u8` HLS manifests.

This was built directly from `API_DOCUMENTATION.md` and `API_PURPOSE.md` —
every screen maps to a real endpoint; nothing here is mocked.

## Requirements

- Node.js 18+ and npm
- The StreamHub Spring Boot backend running and reachable (defaults to
  `http://localhost:8080`)

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if your backend isn't on localhost:8080
npm run dev
```

The app runs at `http://localhost:5173`. Vite's dev server also proxies
`/api` and `/media` to `http://localhost:8080` (see `vite.config.js`), so
things work even if you don't set `.env` at all for local development.

For production:

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally
```

> **Note:** this project was written by hand in an environment without
> package-registry access, so `npm install` has not actually been run
> against it yet. The code follows standard Vue 3 + Vite conventions
> throughout, but if `npm install` / `npm run dev` surfaces anything (a
> typo, a missing edge case), it should be a quick fix — open an issue in
> your own tracker or just ask for a patch.

## What's implemented

| Area | Screens | Backend endpoints |
|---|---|---|
| Discovery | Home (category chips + grid), Search (client-side filter) | `GET /categories`, `GET /videos` |
| Watch | Player, like/unlike, save to playlist, related videos, free-play paywall | `GET /videos/{id}`, `GET /playback/{id}`, `PATCH /videos/{id}/views`, `POST /likes/{id}`, `GET /likes` |
| Auth | Login, Register (with field-level validation errors) | `POST /auth/login`, `POST /auth/register` |
| Library | Playlists (create/delete), playlist detail (add/remove/reorder), watch history, liked videos | `/playlists/**`, `/history`, `/likes` |
| Subscription | Plan picker, cancel, subscription history | `/subscriptions/**` |
| Admin | Category CRUD | `/categories` (ADMIN) |
| Admin | Analytics dashboard (range picker, stat cards, charts) | `/analytics/visits` (ADMIN/ANALYTIC) |

## Known gaps (matching the API's own gaps)

- **Search** isn't a real backend feature (`GET /videos` only filters by
  `categoryId`) — `SearchView.vue` fetches a page of videos and filters by
  title/category client-side. Swap this out if a real search endpoint is
  added later.
- **No comments, no per-channel subscriptions, no payment gateway** —
  none of these exist in the API (subscriptions here are a single
  platform-wide plan, not per-creator), so the frontend doesn't fake them.
- **Free-play tracking for guests** uses a browser-local id
  (`src/composables/useGuestSession.js`) sent as `x-session-id`, matching
  the backend's guest-tracking mechanism described in `API_PURPOSE.md` §2.

## Project structure

```
src/
  api/          one file per API resource, thin wrappers around axios
  components/   reusable UI (cards, modals, nav, player, charts)
  composables/  guest session id, media URL resolution, formatting
  router/       routes + auth/role guards
  stores/       pinia: auth (session/roles), ui (theme/sidebar/toasts)
  views/        one file per route, views/admin/ for ADMIN-only screens
```

## Auth model

JWT is stored in `localStorage` and attached as `Authorization: Bearer
<token>` on every request (see `src/api/http.js`). A 401 response clears
the stored session automatically. Role gating (`ADMIN`, `ADMIN/ANALYTIC`)
is enforced both in the router (`meta.requiresAdmin` /
`meta.requiresAnalytic`) and by simply not rendering nav links the user
can't use — the backend is still the source of truth for authorization.
