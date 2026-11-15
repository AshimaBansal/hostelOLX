
-- =====================================================
-- HOSTELOLX DATABASE
-- Migration: 001_initial_schema.sql
-- PostgreSQL / Neon
-- =====================================================

BEGIN;


-- Track executed migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(100) PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 1. PROFILES
-- UUID will be supplied by the authentication system.
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    academic_role VARCHAR(100),
    hostel_name VARCHAR(100),
    room_number VARCHAR(30),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

-- 3. LISTINGS
CREATE TABLE listings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    seller_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE RESTRICT,

    category_id BIGINT
        REFERENCES categories(id) ON DELETE SET NULL,

    title VARCHAR(200) NOT NULL,
    description TEXT,

    price NUMERIC(10,2) NOT NULL DEFAULT 0
        CHECK (price >= 0),

    original_price NUMERIC(10,2)
        CHECK (
            original_price IS NULL
            OR original_price >= 0
        ),

    listing_type VARCHAR(20) NOT NULL DEFAULT 'sale'
        CHECK (
            listing_type IN ('sale', 'giveaway', 'exchange')
        ),

    item_condition VARCHAR(20) NOT NULL
        CHECK (
            item_condition IN (
                'new', 'like_new', 'good', 'fair', 'poor'
            )
        ),

    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (
            status IN ('active', 'reserved', 'sold', 'removed')
        ),

    location_text VARCHAR(150),

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        listing_type <> 'giveaway' OR price = 0
    )
);

-- 4. LISTING IMAGES
CREATE TABLE listing_images (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    listing_id BIGINT NOT NULL
        REFERENCES listings(id) ON DELETE CASCADE,

    image_url TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. WISHLISTS
CREATE TABLE wishlists (
    user_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE CASCADE,

    listing_id BIGINT NOT NULL
        REFERENCES listings(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, listing_id)
);

-- 6. CONVERSATIONS
CREATE TABLE conversations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    listing_id BIGINT NOT NULL
        REFERENCES listings(id) ON DELETE RESTRICT,

    buyer_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE RESTRICT,

    seller_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE RESTRICT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (buyer_id <> seller_id),

    UNIQUE (listing_id, buyer_id, seller_id)
);

-- 7. MESSAGES
CREATE TABLE messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    conversation_id BIGINT NOT NULL
        REFERENCES conversations(id) ON DELETE CASCADE,

    sender_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE RESTRICT,

    message_text TEXT NOT NULL
        CHECK (LENGTH(TRIM(message_text)) > 0),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CONVERSATION MEMBERS
-- Tracks each participant's read position separately.
CREATE TABLE conversation_members (
    conversation_id BIGINT NOT NULL
        REFERENCES conversations(id) ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE CASCADE,

    last_read_at TIMESTAMPTZ,

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    PRIMARY KEY (conversation_id, user_id)
);

-- 9. LOST AND FOUND ITEMS
CREATE TABLE lost_found_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    posted_by UUID NOT NULL
        REFERENCES profiles(id) ON DELETE RESTRICT,

    item_type VARCHAR(10) NOT NULL
        CHECK (item_type IN ('lost', 'found')),

    title VARCHAR(200) NOT NULL,
    description TEXT,

    location_description TEXT,
    image_url TEXT,

    date_occurred DATE,

    status VARCHAR(20) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'claimed', 'closed')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. CLAIMS
CREATE TABLE claims (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    item_id BIGINT NOT NULL
        REFERENCES lost_found_items(id) ON DELETE RESTRICT,

    claimant_id UUID NOT NULL
        REFERENCES profiles(id) ON DELETE RESTRICT,

    claim_message TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending', 'approved', 'rejected', 'cancelled'
            )
        ),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (item_id, claimant_id)
);

-- 11. HANDOVER SPOTS
CREATE TABLE handover_spots (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,
    badge VARCHAR(100),

    timings VARCHAR(100),

    description TEXT,
    recommended_for TEXT,

    location_description TEXT NOT NULL,

    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (
        latitude IS NULL OR latitude BETWEEN -90 AND 90
    ),

    CHECK (
        longitude IS NULL OR longitude BETWEEN -180 AND 180
    )
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_listings_seller
    ON listings(seller_id);

CREATE INDEX idx_listings_category
    ON listings(category_id);

CREATE INDEX idx_listings_status
    ON listings(status);

CREATE INDEX idx_listings_created
    ON listings(created_at DESC);

CREATE INDEX idx_listing_images_listing
    ON listing_images(listing_id);

CREATE INDEX idx_wishlists_listing
    ON wishlists(listing_id);

CREATE INDEX idx_conversations_buyer
    ON conversations(buyer_id);

CREATE INDEX idx_conversations_seller
    ON conversations(seller_id);

CREATE INDEX idx_messages_conversation_created
    ON messages(conversation_id, created_at DESC);

CREATE INDEX idx_lost_found_status
    ON lost_found_items(status);

CREATE INDEX idx_claims_item
    ON claims(item_id);

CREATE INDEX idx_claims_claimant
    ON claims(claimant_id);

-- Record successful migration
INSERT INTO schema_migrations (version)
VALUES ('001_initial_schema')
ON CONFLICT (version) DO NOTHING;

COMMIT;
