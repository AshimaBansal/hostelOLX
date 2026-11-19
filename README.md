# HostelOLX

HostelOLX is a student-focused marketplace platform designed to help students buy, sell, and exchange items within their campus community.

The platform provides authentication, product listings, student profiles, wishlists, chat, requests, and lost-and-found functionality.

## Project Structure

```text
hostelOLX/
├── auth/
│   ├── migrations/
│   ├── src/
│   │   ├── modules/
│   │   └── utils/
│   ├── tests/
│   └── README.md
├── backend/
├── database/
│   └── migrations/
└── frontend/
    └── src/
        ├── Components/
        ├── context/
        └── services/
```

## Main Features

- Student registration and login
- Google authentication
- Institutional email verification
- JWT-based authentication
- User profiles
- Create, view, update, and delete listings
- Wishlist management
- Student requests
- Chat and messaging
- Lost-and-found claims
- Report management
- Image uploads
- Marketplace categories and handover locations

## Technology Stack

- **Frontend:** React, Vite, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** Google OAuth and JWT
- **Validation:** Zod
- **Testing:** Node.js test runner

## Authentication

HostelOLX uses Google authentication and local registration with institutional email restrictions.

The backend verifies Google ID tokens, validates email domains, and issues JWT access tokens.

Protected API routes use JWT middleware to identify authenticated users.

## Backend Modules

The backend is organised into separate modules:

- Profiles
- Listings
- Wishlist
- Requests
- Chats
- Claims
- Reports
- Uploads
- Meta information

Each module separates its responsibilities across routes, controllers, services, repositories, and validators where applicable.

## Database

PostgreSQL is used for persistent storage.

Database migrations are maintained in the `database/migrations/` and `auth/migrations/` directories.

## Running the Project

### 1. Clone the repository

```bash
git clone https://github.com/AshimaBansal/hostelOLX.git
cd hostelOLX
```

### 2. Install dependencies

Install dependencies separately in the frontend and backend/authentication directories using their respective package files.

### 3. Configure environment variables

Create local environment files using the corresponding example files where available.

Do not commit `.env` files or expose credentials.

### 4. Start the backend

Run the backend using the start script defined in its `package.json`.

### 5. Start the frontend

Run the frontend using its Vite development script.

## Testing

The authentication and marketplace backend modules include automated tests.

Run the test script from the authentication directory using its `package.json` configuration.

## Project Objective

The objective of HostelOLX is to create a convenient and trusted campus marketplace where students can exchange goods and communicate with other students within their institution.