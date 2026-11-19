import { pool } from '../../database.js';

export function createReportRepository(database = pool) {
  async function create({ reporterId, listingId, reportedUserId, reason, description }) {
    const result = await database.query(
      `INSERT INTO reports (reporter_id, listing_id, reported_user_id, reason, description, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, reporter_id AS "reporterId", listing_id AS "listingId",
                 reported_user_id AS "reportedUserId", reason, description, status,
                 created_at AS "createdAt"`,
      [reporterId, listingId ?? null, reportedUserId ?? null, reason, description ?? null]
    );

    return result.rows[0];
  }

  async function findAll(filters = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`r.status = $${idx++}`);
      values.push(filters.status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT
        r.id,
        r.reporter_id AS "reporterId",
        r.listing_id AS "listingId",
        r.reported_user_id AS "reportedUserId",
        r.reason,
        r.description,
        r.status,
        r.admin_notes AS "adminNotes",
        r.resolved_by AS "resolvedBy",
        r.created_at AS "createdAt",
        r.updated_at AS "updatedAt",
        rp.full_name AS "reporterName",
        l.title AS "listingTitle",
        l.status AS "listingStatus"
      FROM reports r
      LEFT JOIN profiles rp ON rp.id = r.reporter_id
      LEFT JOIN listings l ON l.id = r.listing_id
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    const result = await database.query(query, values);
    return result.rows;
  }

  async function findById(id) {
    const result = await database.query(
      `SELECT
        r.id,
        r.reporter_id AS "reporterId",
        r.listing_id AS "listingId",
        r.reported_user_id AS "reportedUserId",
        r.reason,
        r.description,
        r.status,
        r.admin_notes AS "adminNotes",
        r.resolved_by AS "resolvedBy",
        r.created_at AS "createdAt",
        r.updated_at AS "updatedAt",
        rp.full_name AS "reporterName",
        l.title AS "listingTitle",
        l.status AS "listingStatus"
       FROM reports r
       LEFT JOIN profiles rp ON rp.id = r.reporter_id
       LEFT JOIN listings l ON l.id = r.listing_id
       WHERE r.id = $1
       LIMIT 1`,
      [id]
    );

    return result.rows[0] ?? null;
  }

  async function updateStatus(id, { status, adminNotes, resolvedBy, removeListing }) {
    const client = await database.connect();

    try {
      await client.query('BEGIN');

      const sets = [];
      const values = [];
      let idx = 1;

      if (status !== undefined) {
        sets.push(`status = $${idx++}`);
        values.push(status);
      }
      if (adminNotes !== undefined) {
        sets.push(`admin_notes = $${idx++}`);
        values.push(adminNotes);
      }
      if (resolvedBy !== undefined) {
        sets.push(`resolved_by = $${idx++}`);
        values.push(resolvedBy);
      }

      sets.push(`updated_at = NOW()`);
      values.push(id);

      await client.query(
        `UPDATE reports
         SET ${sets.join(', ')}
         WHERE id = $${idx}`,
        values
      );

      if (removeListing) {
        const reportResult = await client.query(`SELECT listing_id FROM reports WHERE id = $1`, [id]);
        const listingId = reportResult.rows[0]?.listing_id;
        if (listingId) {
          await client.query(`UPDATE listings SET status = 'removed', updated_at = NOW() WHERE id = $1`, [listingId]);
        }
      }

      await client.query('COMMIT');
      return findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  return {
    create,
    findAll,
    findById,
    updateStatus,
  };
}

export const reportRepository = createReportRepository();
