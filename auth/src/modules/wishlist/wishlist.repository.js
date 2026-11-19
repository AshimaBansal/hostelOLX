import { pool } from '../../database.js';

export function createWishlistRepository(database = pool) {
  async function findUserWishlist(userId) {
    const result = await database.query(
      `SELECT
         w.listing_id AS "listingId",
         w.created_at AS "savedAt",
         l.id,
         l.title,
         l.description,
         l.price::numeric AS price,
         l.original_price::numeric AS "originalPrice",
         l.listing_type AS "listingType",
         l.item_condition AS "itemCondition",
         l.status,
         l.location_text AS "location",
         p.full_name AS "sellerName",
         COALESCE(p.program, p.academic_role) AS "sellerProgram",
         COALESCE(
           (SELECT json_agg(li.image_url ORDER BY li.display_order ASC, li.id ASC)
            FROM listing_images li
            WHERE li.listing_id = l.id),
           '[]'::json
         ) AS images
       FROM wishlists w
       JOIN listings l ON l.id = w.listing_id
       LEFT JOIN profiles p ON p.id = l.seller_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  async function addToWishlist(userId, listingId) {
    await database.query(
      `INSERT INTO wishlists (user_id, listing_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id) DO NOTHING`,
      [userId, listingId]
    );
    return { userId, listingId: String(listingId), saved: true };
  }

  async function removeFromWishlist(userId, listingId) {
    await database.query(
      `DELETE FROM wishlists
       WHERE user_id = $1 AND listing_id = $2`,
      [userId, listingId]
    );
    return { userId, listingId: String(listingId), saved: false };
  }

  return {
    findUserWishlist,
    addToWishlist,
    removeFromWishlist,
  };
}

export const wishlistRepository = createWishlistRepository();
