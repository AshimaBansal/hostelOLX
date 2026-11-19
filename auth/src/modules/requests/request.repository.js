import { pool } from '../../database.js';

export function createRequestRepository(database = pool) {
  async function findAll(filters = {}) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`r.status = $${idx++}`);
      values.push(filters.status);
    } else {
      conditions.push(`r.status = 'active'`);
    }

    if (filters.category) {
      conditions.push(`(r.category ILIKE $${idx} OR c.slug = $${idx} OR c.name ILIKE $${idx})`);
      idx++;
      values.push(filters.category.trim());
    }

    if (filters.search || filters.q) {
      const q = `%${(filters.search || filters.q).trim()}%`;
      conditions.push(`(r.title ILIKE $${idx} OR r.description ILIKE $${idx} OR p.full_name ILIKE $${idx})`);
      idx++;
      values.push(q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const countResult = await database.query(
      `SELECT COUNT(*) AS total
       FROM requests r
       LEFT JOIN profiles p ON p.id = r.user_id
       LEFT JOIN categories c ON c.id = r.category_id
       ${whereClause}`,
      values
    );
    const total = Number(countResult.rows[0]?.total || 0);

    const query = `
      SELECT
        r.id,
        r.user_id AS "userId",
        r.title,
        r.description,
        r.category,
        r.category_id AS "categoryId",
        r.budget,
        r.urgency,
        r.location,
        r.status,
        r.created_at AS "createdAt",
        r.updated_at AS "updatedAt",
        p.full_name AS "requesterName",
        p.hostel_name AS "requesterHostel",
        p.room_number AS "requesterRoom",
        COALESCE(p.program, p.academic_role) AS "requesterProgram"
      FROM requests r
      LEFT JOIN profiles p ON p.id = r.user_id
      LEFT JOIN categories c ON c.id = r.category_id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit);
    values.push(offset);

    const result = await database.query(query, values);

    return {
      rows: result.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async function findById(id) {
    const result = await database.query(
      `SELECT
         r.id,
         r.user_id AS "userId",
         r.title,
         r.description,
         r.category,
         r.category_id AS "categoryId",
         r.budget,
         r.urgency,
         r.location,
         r.status,
         r.created_at AS "createdAt",
         r.updated_at AS "updatedAt",
         p.full_name AS "requesterName",
         p.hostel_name AS "requesterHostel",
         p.room_number AS "requesterRoom",
         COALESCE(p.program, p.academic_role) AS "requesterProgram"
       FROM requests r
       LEFT JOIN profiles p ON p.id = r.user_id
       LEFT JOIN categories c ON c.id = r.category_id
       WHERE r.id = $1
       LIMIT 1`,
      [id]
    );

    return result.rows[0] ?? null;
  }

  async function create({ userId, title, description, category, categoryId, budget, urgency, location }) {
    const result = await database.query(
      `INSERT INTO requests (user_id, title, description, category, category_id, budget, urgency, location, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
       RETURNING id`,
      [userId, title, description ?? null, category ?? null, categoryId ?? null, budget ?? null, urgency ?? null, location ?? null]
    );

    return findById(result.rows[0].id);
  }

  async function update(id, updates = {}) {
    const sets = [];
    const values = [];
    let idx = 1;

    if (updates.title !== undefined) {
      sets.push(`title = $${idx++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      sets.push(`description = $${idx++}`);
      values.push(updates.description);
    }
    if (updates.category !== undefined) {
      sets.push(`category = $${idx++}`);
      values.push(updates.category);
    }
    if (updates.categoryId !== undefined) {
      sets.push(`category_id = $${idx++}`);
      values.push(updates.categoryId);
    }
    if (updates.budget !== undefined) {
      sets.push(`budget = $${idx++}`);
      values.push(updates.budget);
    }
    if (updates.urgency !== undefined) {
      sets.push(`urgency = $${idx++}`);
      values.push(updates.urgency);
    }
    if (updates.location !== undefined) {
      sets.push(`location = $${idx++}`);
      values.push(updates.location);
    }
    if (updates.status !== undefined) {
      sets.push(`status = $${idx++}`);
      values.push(updates.status);
    }

    if (sets.length === 0) {
      return findById(id);
    }

    sets.push(`updated_at = NOW()`);
    values.push(id);

    await database.query(
      `UPDATE requests
       SET ${sets.join(', ')}
       WHERE id = $${idx}`,
      values
    );

    return findById(id);
  }

  async function remove(id) {
    const result = await database.query(
      `UPDATE requests
       SET status = 'closed', updated_at = NOW()
       WHERE id = $1
       RETURNING id, status`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  return {
    findAll,
    findById,
    create,
    update,
    remove,
  };
}

export const requestRepository = createRequestRepository();
