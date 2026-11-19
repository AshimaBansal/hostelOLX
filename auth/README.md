# HostelOLX Backend & Authentication Service

Backend REST API for HostelOLX: campus student marketplace, peer chat, lost & found claims, wishlist, and student requests backed by PostgreSQL (Neon).

## Features

- Google OAuth 2.0 & Email/Password Authentication (Restricted to `@nst.rishihood.edu.in` and `@rishihood.edu.in`)
- Student Profiles with campus residency management
- Marketplace Listings (Paid, Free Giveaway Drops, Lost & Found)
- Persistent Wishlist
- Peer-to-peer Chat & Messaging
- Lost & Found Ownership Claims Workflow
- Student Wanted/Wish Requests
- Safety Handover Spots & Categories
- Secure Image Uploads & Static Serving
- Moderation & Inappropriate Content Reporting (Admin Only)

## Prerequisites

- Node.js 22+
- PostgreSQL (Neon or local)

## Local Setup

### 1. Backend

```bash
cd auth
npm install
npm run dev      # Runs server on http://localhost:4001
npm test         # Runs test suite (117 tests)
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev      # Runs Vite on http://localhost:5173
```

## Database Migrations

Migrations are located in `auth/migrations/` and `database/migrations/`:
- `001_initial_schema.sql`: Core tables (`profiles`, `categories`, `listings`, `listing_images`, `wishlists`, `conversations`, `messages`, `claims`, `handover_spots`)
- `002_authentication.sql`: Auth identities (`auth_identities`, `profile_roles`, `auth_sessions`)
- `003_marketplace_tables.sql`: Student requests (`requests`), reports (`reports`), claim enhancements, category seeds, and handover spots seeds

To apply migration 003:
```bash
psql $DATABASE_URL -f auth/migrations/003_marketplace_tables.sql
```

## API Documentation

Base URL: `http://localhost:4001/api`

### Auth
- `POST /api/auth/google`: Google OAuth login with ID token
- `POST /api/auth/register`: Local email/password registration
- `GET /api/auth/me`: Authenticated user session

### Profiles
- `GET /api/users/me` (or `/api/profiles/me`): Authenticated student profile
- `PATCH /api/users/me` (or `/api/profiles/me`): Update student profile (phone, room, hostel, program)
- `GET /api/users/:id` (or `/api/profiles/:id`): Public profile card

### Listings
- `GET /api/listings`: Browse listings (filters: `search`, `category`, `type`, `section`, `minPrice`, `maxPrice`, `condition`, `status`, `sort`, `page`, `limit`)
- `GET /api/listings/:id`: Detailed listing info
- `POST /api/listings`: Create listing (authenticated, validates price rules)
- `PATCH /api/listings/:id`: Update own listing (authenticated)
- `DELETE /api/listings/:id`: Soft-delete own listing (authenticated)

### Wishlist
- `GET /api/wishlist`: Retrieve saved items (authenticated)
- `POST /api/wishlist/:listingId`: Save item (authenticated)
- `DELETE /api/wishlist/:listingId`: Remove saved item (authenticated)

### Student Requests
- `GET /api/requests`: Active student requests
- `GET /api/requests/:id`: Single request
- `POST /api/requests`: Post a request (authenticated)
- `PATCH /api/requests/:id`: Update own request (authenticated)
- `DELETE /api/requests/:id`: Close own request (authenticated)

### Chat & Messaging
- `GET /api/chats`: User conversation list with unread counts (authenticated)
- `GET /api/chats/:id/messages`: Chronological message history (authenticated)
- `POST /api/chats`: Start or find conversation (authenticated)
- `POST /api/chats/:id/messages`: Send message (authenticated)
- `PATCH /api/chats/:id/read`: Mark conversation as read (authenticated)

### Claims
- `GET /api/claims`: User claims and claims received (authenticated)
- `GET /api/claims/:id`: Single claim details (authenticated)
- `POST /api/listings/:id/claims` (or `POST /api/claims`): Submit claim (authenticated)
- `PATCH /api/claims/:id`: Approve/reject/cancel claim (authenticated)

### Reports & Moderation
- `POST /api/reports`: Report listing or user (authenticated)
- `GET /api/admin/reports`: List all moderation reports (admin only)
- `PATCH /api/admin/reports/:id`: Review and resolve report (admin only)

### Meta & Uploads
- `GET /api/categories`: Product categories
- `GET /api/handover-spots`: Safe campus meeting points
- `GET /api/stats`: Campus activity statistics
- `POST /api/upload`: Base64 image upload (authenticated)
