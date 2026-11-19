import { pool } from '../../database.js';

export function createClaimRepository(database = pool) {
  async function findUserClaims(userId) {
    const result = await database.query(
      `SELECT
         c.id,
         c.listing_id AS "listingId",
         c.item_id AS "itemId",
         c.claimant_id AS "claimantId",
         COALESCE(c.proof_details, c.claim_message) AS "proofDetails",
         c.claim_message AS "claimMessage",
         c.meeting_location AS "meetingLocation",
         c.meeting_time AS "meetingTime",
         c.status,
         c.created_at AS "createdAt",
         c.updated_at AS "updatedAt",
         cp.full_name AS "claimantName",
         cp.hostel_name AS "claimantHostel",
         cp.room_number AS "claimantRoom",
         COALESCE(cp.program, cp.academic_role) AS "claimantProgram",
         l.title AS "listingTitle",
         l.seller_id AS "sellerId",
         sp.full_name AS "sellerName",
         sp.hostel_name AS "sellerHostel"
       FROM claims c
       LEFT JOIN listings l ON l.id = c.listing_id
       LEFT JOIN profiles cp ON cp.id = c.claimant_id
       LEFT JOIN profiles sp ON sp.id = l.seller_id
       WHERE c.claimant_id = $1 OR l.seller_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return result.rows;
  }

  async function findById(id) {
    const result = await database.query(
      `SELECT
         c.id,
         c.listing_id AS "listingId",
         c.item_id AS "itemId",
         c.claimant_id AS "claimantId",
         COALESCE(c.proof_details, c.claim_message) AS "proofDetails",
         c.claim_message AS "claimMessage",
         c.meeting_location AS "meetingLocation",
         c.meeting_time AS "meetingTime",
         c.status,
         c.created_at AS "createdAt",
         c.updated_at AS "updatedAt",
         cp.full_name AS "claimantName",
         cp.hostel_name AS "claimantHostel",
         cp.room_number AS "claimantRoom",
         COALESCE(cp.program, cp.academic_role) AS "claimantProgram",
         l.title AS "listingTitle",
         l.seller_id AS "sellerId",
         sp.full_name AS "sellerName"
       FROM claims c
       LEFT JOIN listings l ON l.id = c.listing_id
       LEFT JOIN profiles cp ON cp.id = c.claimant_id
       LEFT JOIN profiles sp ON sp.id = l.seller_id
       WHERE c.id = $1
       LIMIT 1`,
      [id]
    );

    return result.rows[0] ?? null;
  }

  async function findExistingClaim(listingId, claimantId) {
    const result = await database.query(
      `SELECT id, status
       FROM claims
       WHERE listing_id = $1 AND claimant_id = $2
       LIMIT 1`,
      [listingId, claimantId]
    );
    return result.rows[0] ?? null;
  }

  async function createClaim({ listingId, claimantId, proofDetails, meetingLocation, meetingTime, claimMessage }) {
    const message = claimMessage || proofDetails;
    const result = await database.query(
      `INSERT INTO claims (listing_id, claimant_id, proof_details, meeting_location, meeting_time, claim_message, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING id`,
      [listingId, claimantId, proofDetails ?? null, meetingLocation ?? null, meetingTime ?? null, message ?? null]
    );

    return findById(result.rows[0].id);
  }

  async function updateStatus(claimId, newStatus, listingId = null) {
    const client = await database.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `UPDATE claims
         SET status = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [newStatus, claimId]
      );

      if (newStatus === 'approved' && listingId) {
        await client.query(
          `UPDATE listings
           SET status = 'reserved', updated_at = NOW()
           WHERE id = $1`,
          [listingId]
        );

        await client.query(
          `UPDATE claims
           SET status = 'rejected', updated_at = NOW()
           WHERE listing_id = $1 AND id <> $2 AND status = 'pending'`,
          [listingId, claimId]
        );
      }

      await client.query('COMMIT');
      return findById(claimId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    findUserClaims,
    findById,
    findExistingClaim,
    createClaim,
    updateStatus,
  };
}

export const claimRepository = createClaimRepository();
