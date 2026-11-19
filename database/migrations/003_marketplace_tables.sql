BEGIN;

INSERT INTO categories (name, slug)
VALUES
    ('Study', 'study'),
    ('Appliances', 'appliances'),
    ('Seating', 'seating'),
    ('Decor', 'decor')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO handover_spots (name, badge, timings, description, recommended_for, location_description)
VALUES
    ('Hostel 1 Courtyard', 'North Wing', '7:00 AM - 10:30 PM', 'Benches near the main entry arch. Great for Hostels 1 & 2 residents.', 'Study lamps, bedding, heavier decor', 'Near Hostel 1 main entry'),
    ('Nescafe Circle', 'Central Campus', '8:00 AM - 11:30 PM', 'Outdoor umbrella tables near the cafeteria. Best for busy daytime trades between lectures.', 'Books, electronics, quick handoffs', 'Outdoor cafeteria area'),
    ('Central Library Steps', 'Quiet Zone', '9:00 AM - 9:00 PM', 'Right under the shaded atrium pillars. Safe, well-lit, CCTV monitored.', 'Textbooks, calculators, stationery', 'Central Library entrance'),
    ('Maker Space Porch', 'Tech Wing', '10:00 AM - 8:00 PM', 'Wide porch equipped with test power sockets. Ideal to verify appliances work.', 'Electronics, kettle, speakers, lamps', 'Maker Space entrance')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS program VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50);

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_listing_type_check;
ALTER TABLE listings ADD CONSTRAINT listings_listing_type_check
    CHECK (listing_type IN ('sale', 'giveaway', 'free', 'lost_found', 'lost-found', 'exchange'));

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE listings ADD CONSTRAINT listings_status_check
    CHECK (status IN ('active', 'reserved', 'sold', 'inactive', 'removed'));

ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_check;
ALTER TABLE listings ADD CONSTRAINT listings_check
    CHECK (
        (listing_type NOT IN ('giveaway', 'free', 'lost_found', 'lost-found') OR price = 0)
        AND
        (listing_type <> 'sale' OR price > 0)
    );

ALTER TABLE claims ADD COLUMN IF NOT EXISTS listing_id BIGINT REFERENCES listings(id) ON DELETE CASCADE;
ALTER TABLE claims ALTER COLUMN item_id DROP NOT NULL;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS proof_details TEXT;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS meeting_location VARCHAR(150);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS meeting_time VARCHAR(100);
ALTER TABLE claims ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE claims DROP CONSTRAINT IF EXISTS claims_status_check;
ALTER TABLE claims ADD CONSTRAINT claims_status_check
    CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_claims_listing_claimant
    ON claims (listing_id, claimant_id)
    WHERE listing_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    budget VARCHAR(100),
    urgency VARCHAR(100),
    location VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'fulfilled', 'closed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_requests_user ON requests (user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests (created_at DESC);

CREATE TABLE IF NOT EXISTS reports (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id BIGINT REFERENCES listings(id) ON DELETE SET NULL,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    admin_notes TEXT,
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_listing ON reports (listing_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports (reporter_id);

ALTER TABLE conversations ALTER COLUMN listing_id DROP NOT NULL;

INSERT INTO schema_migrations (version)
VALUES ('003_marketplace_tables')
ON CONFLICT (version) DO NOTHING;

COMMIT;
