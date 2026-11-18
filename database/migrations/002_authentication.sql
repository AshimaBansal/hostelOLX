BEGIN;

-- 1. AUTHENTICATION IDENTITIES
-- A profile can have a local account or a Google account.

CREATE TABLE auth_identities (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    profile_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE CASCADE,

    provider VARCHAR(20) NOT NULL
        CHECK (provider IN ('local', 'google')),

    provider_subject TEXT,

    email VARCHAR(254) NOT NULL,

    password_hash TEXT,

    email_verified BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        (
            provider = 'local'
            AND provider_subject IS NULL
            AND password_hash IS NOT NULL
        )
        OR
        (
            provider = 'google'
            AND provider_subject IS NOT NULL
            AND password_hash IS NULL
        )
    )
);

-- One local account per email, ignoring letter case.
CREATE UNIQUE INDEX idx_auth_local_email
    ON auth_identities (LOWER(email))
    WHERE provider = 'local';

-- Google accounts are identified by Google's stable subject ID.
CREATE UNIQUE INDEX idx_auth_google_subject
    ON auth_identities (provider_subject)
    WHERE provider = 'google';

CREATE UNIQUE INDEX idx_auth_profile_provider
    ON auth_identities (profile_id, provider);

-- 2. PROFILE ROLES
-- Public registration will receive STUDENT.
-- ADMIN must be assigned through a controlled process.

CREATE TABLE profile_roles (
    profile_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE CASCADE,

    role VARCHAR(20) NOT NULL
        CHECK (role IN ('STUDENT', 'ADMIN')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (profile_id, role)
);

-- 3. AUTHENTICATION SESSIONS
-- Only hashed refresh tokens are stored.

CREATE TABLE auth_sessions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    profile_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE CASCADE,

    refresh_token_hash CHAR(64) NOT NULL UNIQUE,

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    last_used_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auth_sessions_profile
    ON auth_sessions (profile_id);

CREATE INDEX idx_auth_sessions_active
    ON auth_sessions (profile_id, expires_at)
    WHERE revoked_at IS NULL;

-- Record successful migration.
INSERT INTO schema_migrations (version)
VALUES ('002_authentication')
ON CONFLICT (version) DO NOTHING;

COMMIT;
