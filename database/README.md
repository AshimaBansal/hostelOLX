
# HostelOLX Database

HostelOLX uses PostgreSQL as its relational database.

## Technology

- PostgreSQL
- Neon PostgreSQL Hosting
- pgAdmin 4
- SQL migrations

## Database Structure

The database stores:

- Student profiles
- Product categories
- Marketplace listings
- Product images
- Wishlists
- Conversations and messages
- Lost and found records
- Claims
- Campus handover spots

## Folder Structure

```text
database/
├── migrations/
│   └── 001_initial_schema.sql
├── schema.sql
├── seed.sql
└── README.md
```

## Local Development

1. Install PostgreSQL.
2. Create a database named hostelolx.
3. Open the database in pgAdmin.
4. Execute the SQL migrations in order.
5. Execute seed.sql.

## Cloud Database

The project uses Neon PostgreSQL for cloud hosting.

Get the database connection details from the
Neon dashboard.

Never commit database credentials to GitHub.

## Database Migrations

Run migrations in numerical order.

Example:

- 001_initial_schema.sql

When making future schema changes, create a
new migration instead of modifying an already
applied migration.

## Backend Integration

The backend will connect to PostgreSQL using
a secure DATABASE_URL environment variable.

The database credentials must remain on the
backend server and must never be exposed to
the React frontend.
