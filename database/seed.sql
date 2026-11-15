
-- =====================================================
-- HOSTELOLX INITIAL SEED DATA
-- =====================================================

-- PRODUCT CATEGORIES
INSERT INTO categories (name, slug)
VALUES
    ('Study', 'study'),
    ('Appliances', 'appliances'),
    ('Seating', 'seating'),
    ('Decor', 'decor')
ON CONFLICT (slug) DO NOTHING;


-- CAMPUS HANDOVER SPOTS
INSERT INTO handover_spots (
    name,
    badge,
    timings,
    description,
    recommended_for,
    location_description
)
VALUES
(
    'Hostel 1 Courtyard',
    'North Wing',
    '7:00 AM - 10:30 PM',
    'Benches near the main entry arch. Great for Hostels 1 & 2 residents.',
    'Study lamps, bedding, heavier decor',
    'Near Hostel 1 main entry'
),
(
    'Nescafe Circle',
    'Central Campus',
    '8:00 AM - 11:30 PM',
    'Outdoor umbrella tables near the cafeteria. Best for busy daytime trades between lectures.',
    'Books, electronics, quick handoffs',
    'Outdoor cafeteria area'
),
(
    'Central Library Steps',
    'Quiet Zone',
    '9:00 AM - 9:00 PM',
    'Right under the shaded atrium pillars. Safe, well-lit, CCTV monitored.',
    'Textbooks, calculators, stationery',
    'Central Library entrance'
),
(
    'Maker Space Porch',
    'Tech Wing',
    '10:00 AM - 8:00 PM',
    'Wide porch equipped with test power sockets. Ideal to verify appliances work.',
    'Electronics, kettle, speakers, lamps',
    'Maker Space entrance'
)
ON CONFLICT (name) DO NOTHING;
