import { pool } from '../../database.js';

export function createMetaRepository(database = pool) {
  async function findCategories() {
    const result = await database.query(
      `SELECT
         c.id,
         c.name,
         c.slug,
         COUNT(l.id)::int AS "listingCount"
       FROM categories c
       LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
       GROUP BY c.id, c.name, c.slug
       ORDER BY c.name ASC`
    );
    return result.rows;
  }

  async function findHandoverSpots() {
    const result = await database.query(
      `SELECT
         id,
         name,
         badge,
         timings,
         description,
         recommended_for AS "recommendedFor",
         location_description AS "locationDescription",
         latitude,
         longitude,
         is_active AS "isActive"
       FROM handover_spots
       WHERE is_active = TRUE
       ORDER BY id ASC`
    );
    return result.rows;
  }

  async function getCampusStats() {
    const result = await database.query(
      `SELECT
         (SELECT COUNT(*) FROM listings WHERE status = 'active')::int AS "activeListings",
         (SELECT COUNT(*) FROM listings WHERE (listing_type IN ('giveaway', 'free') OR price = 0) AND status = 'active')::int AS "freeGiveaways",
         (SELECT COUNT(*) FROM requests WHERE status = 'active')::int AS "activeRequests",
         (SELECT COUNT(*) FROM claims WHERE status = 'approved')::int AS "resolvedTrades",
         (SELECT COUNT(*) FROM profiles)::int AS "studentUsers"`
    );
    return result.rows[0];
  }

  return {
    findCategories,
    findHandoverSpots,
    getCampusStats,
  };
}

export const metaRepository = createMetaRepository();
