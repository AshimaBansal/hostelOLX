# HostelOLX Backend

REST API for HostelOLX: marketplace listings, wishlist, buyer–seller chat,
lost & found with claims, categories and campus handover spots.

Built with **Node.js + Express 5**, validation with **zod**.

> **Scope of this folder:** business logic and API only.
> The **database** (PostgreSQL / Neon) and **authentication** are owned by
> other team members. This backend is designed so both can be plugged in
> without rewriting routes or services (see [Integration](#integration-for-teammates)).

## Run locally

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev               # http://localhost:5000
npm test                  # runs the API tests
```

Requires Node.js 22 or newer.

## Folder structure

```text
backend/
├── src/
│   ├── server.js            # starts the HTTP server
│   ├── app.js               # express app: middleware + routes
│   ├── config/env.js        # reads .env
│   ├── routes/              # URL -> controller (+ auth & validation)
│   ├── controllers/         # reads the request, sends the response
│   ├── services/            # business rules (who can do what)
│   ├── repositories/        # data access (in-memory now, PostgreSQL later)
│   ├── store/               # temporary in-memory data + sample seed
│   ├── validators/          # zod schemas for body / query / params
│   ├── middleware/          # auth placeholder, validation, errors
│   └── utils/               # ApiError, pagination, response helper
└── tests/                   # API tests (node:test + supertest)
```

Request flow: `route → middleware (auth, validate) → controller → service → repository`.

## Response format

```jsonc
// success
{ "success": true, "data": { ... }, "meta": { "page": 1, "limit": 12, "total": 14, "totalPages": 2 } }

// error
{ "success": false, "message": "Validation failed", "details": [{ "field": "price", "message": "..." }] }
```

Status codes: `200` OK, `201` created, `204` deleted, `400` bad input,
`401` not logged in, `403` not allowed, `404` not found, `409` duplicate.

## "Logged-in user" for now

Until auth is ready, send the user's profile id in a header:

```
x-user-id: 11111111-1111-4111-8111-111111111111
```

That id is the demo user **Ashi** from the sample data. Routes marked 🔒
need this header. Routes marked 👤 work without it but add extras
(`isMine`, `isWishlisted`) when it is present.

## API endpoints

Base URL: `http://localhost:5000/api`

### General

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Server status |
| GET | `/categories` | All categories with `listingCount` |
| GET | `/handover-spots` | Safe campus meeting spots |
| GET | `/handover-spots/:id` | One handover spot |
| GET | `/stats` | Homepage numbers (active, free, sold, open lost & found) |

### Listings

| Method | Path | Description |
|---|---|---|
| GET 👤 | `/listings` | Browse listings (filters below) |
| GET 👤 | `/listings/:id` | Listing details |
| POST 🔒 | `/listings` | Create listing |
| PATCH 🔒 | `/listings/:id` | Edit own listing |
| PATCH 🔒 | `/listings/:id/status` | `active` / `reserved` / `sold` / `removed` |
| DELETE 🔒 | `/listings/:id` | Remove own listing (soft delete) |

Query filters for `GET /listings`:
`category` (slug, e.g. `study`), `type` (`sale`/`giveaway`/`exchange`),
`featured` (`true`/`false`), `q` (search text), `minPrice`, `maxPrice`,
`sellerId`, `status` (default `active`), `sort` (`newest`, `oldest`,
`price_asc`, `price_desc`), `page`, `limit` (max 50).

Each listing also includes `seller`, `category`, `section`
(`favorites` / `essentials` / `free`, same as the frontend),
`discountPercent`, `isWishlisted` and `isMine`.

Create body:

```json
{
  "title": "Electric Kettle",
  "description": "1.5L, works perfectly",
  "price": 600,
  "originalPrice": 1100,
  "listingType": "sale",
  "itemCondition": "good",
  "category": "appliances",
  "locationText": "Hostel 1",
  "images": ["/images/kettle.png"]
}
```

`itemCondition`: `new`, `like_new`, `good`, `fair`, `poor`.
A `giveaway` must have `price: 0`.

### Wishlist 🔒

| Method | Path | Description |
|---|---|---|
| GET | `/wishlist` | My saved listings |
| POST | `/wishlist/:listingId` | Save (201 new, 200 if already saved) |
| DELETE | `/wishlist/:listingId` | Unsave |

### Chat 🔒

| Method | Path | Description |
|---|---|---|
| GET | `/conversations` | My chats with `otherUser`, `listing`, `lastMessage`, `unreadCount` |
| GET | `/conversations/unread-count` | Total unread messages (for the navbar badge) |
| POST | `/conversations` | Start/reuse chat: `{ "listingId": 1, "message": "Hi!" }` |
| GET | `/conversations/:id` | One chat |
| GET | `/conversations/:id/messages` | Messages, oldest first, with `isMine` |
| POST | `/conversations/:id/messages` | `{ "messageText": "..." }` |
| PATCH | `/conversations/:id/read` | Mark chat as read |

### Lost & Found

| Method | Path | Description |
|---|---|---|
| GET 👤 | `/lost-found` | Items (`type=lost/found`, `status`, `q`, `page`, `limit`) |
| GET 👤 | `/lost-found/:id` | One item, with `claimCount` and `myClaimStatus` |
| POST 🔒 | `/lost-found` | Report: `{ "itemType": "found", "title": "...", "locationDescription": "...", "dateOccurred": "2026-11-01" }` |
| PATCH 🔒 | `/lost-found/:id` | Edit own item / close it |
| POST 🔒 | `/lost-found/:id/claims` | Claim: `{ "claimMessage": "proof of ownership..." }` |
| GET 🔒 | `/lost-found/:id/claims` | Claims on my item (poster only) |
| GET 🔒 | `/claims/mine` | Claims I made |
| PATCH 🔒 | `/claims/:id` | Poster: `approved`/`rejected`; claimant: `cancelled` |

Approving a claim marks the item `claimed` and rejects other pending claims.

### Profiles

| Method | Path | Description |
|---|---|---|
| GET 🔒 | `/profiles/me` | My full profile |
| PATCH 🔒 | `/profiles/me` | Update `fullName`, `phone`, `academicRole`, `hostelName`, `roomNumber`, `avatarUrl` |
| GET | `/profiles/:id` | Public profile (no phone / room number) |

## Integration (for teammates)

**Database member** – Only `src/repositories/*.js` touch data. Replace the
in-memory code inside each function with SQL queries (`pg` + `DATABASE_URL`)
against `database/migrations/001_initial_schema.sql`, keeping the same
function names and returning camelCase objects. Services, controllers and
routes stay unchanged. The sample data in `src/store/seedData.js` matches
`database/seed.sql`.

**Auth member** – Only `src/middleware/auth.js` needs to change. Verify the
token from the `Authorization` header and set `req.user = { id: <profile uuid> }`.
Every protected route already uses `requireAuth` / `optionalAuth`.

**Frontend member** – Call the API at `http://localhost:5000/api` and send
the `x-user-id` header for now. CORS allows `http://localhost:5173` (Vite)
by default; change `CORS_ORIGIN` in `.env` if needed.
