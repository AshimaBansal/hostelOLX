import { pool } from '../../database.js';

export function createListingRepository(database = pool) {
  async function findAll(filters = {}, userId = null) {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (filters.status) {
      conditions.push(`l.status = $${idx++}`);
      values.push(filters.status);
    } else {
      conditions.push(`l.status = 'active'`);
    }

    if (filters.categoryId) {
      conditions.push(`l.category_id = $${idx++}`);
      values.push(Number(filters.categoryId));
    } else if (filters.category) {
      conditions.push(`(c.slug = $${idx} OR LOWER(c.name) = LOWER($${idx}))`);
      idx++;
      values.push(filters.category.trim());
    }

    if (filters.sellerId) {
      conditions.push(`l.seller_id = $${idx++}`);
      values.push(filters.sellerId);
    }

    if (filters.type || filters.listingType) {
      const t = (filters.type || filters.listingType).toLowerCase();
      if (t === 'free' || t === 'giveaway') {
        conditions.push(`l.listing_type IN ('free', 'giveaway')`);
      } else if (t === 'lost-found' || t === 'lost_found') {
        conditions.push(`l.listing_type IN ('lost-found', 'lost_found')`);
      } else if (t === 'sale' || t === 'paid') {
        conditions.push(`l.listing_type = 'sale'`);
      } else if (t !== 'all') {
        conditions.push(`l.listing_type = $${idx++}`);
        values.push(t);
      }
    }

    if (filters.section) {
      const s = filters.section.toLowerCase();
      if (s === 'free') {
        conditions.push(`(l.listing_type IN ('free', 'giveaway') OR l.price = 0)`);
      } else if (s === 'lost-found' || s === 'lost_found') {
        conditions.push(`l.listing_type IN ('lost-found', 'lost_found')`);
      } else if (s === 'favorites') {
        conditions.push(`l.is_featured = TRUE`);
      }
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '') {
      conditions.push(`l.price >= $${idx++}`);
      values.push(Number(filters.minPrice));
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '') {
      conditions.push(`l.price <= $${idx++}`);
      values.push(Number(filters.maxPrice));
    }

    if (filters.condition) {
      conditions.push(`l.item_condition = $${idx++}`);
      values.push(filters.condition);
    }

    if (filters.search || filters.q) {
      const q = `%${(filters.search || filters.q).trim()}%`;
      conditions.push(
        `(l.title ILIKE $${idx} OR l.description ILIKE $${idx} OR l.location_text ILIKE $${idx} OR p.full_name ILIKE $${idx})`
      );
      idx++;
      values.push(q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    let orderBy = 'l.created_at DESC';
    if (filters.sort === 'oldest') {
      orderBy = 'l.created_at ASC';
    } else if (filters.sort === 'price_asc') {
      orderBy = 'l.price ASC';
    } else if (filters.sort === 'price_desc') {
      orderBy = 'l.price DESC';
    }

    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM listings l
      LEFT JOIN categories c ON c.id = l.category_id
      LEFT JOIN profiles p ON p.id = l.seller_id
      ${whereClause}
    `;
    const countResult = await database.query(countQuery, values);
    const total = Number(countResult.rows[0]?.total || 0);

    const userParamIdx = idx++;
    values.push(userId);

    const dataQuery = `
      SELECT
        l.id,
        l.seller_id AS "sellerId",
        l.category_id AS "categoryId",
        c.name AS "categoryName",
        c.slug AS "categorySlug",
        l.title,
        l.description,
        l.price::numeric AS price,
        l.original_price::numeric AS "originalPrice",
        l.listing_type AS "listingType",
        l.item_condition AS "itemCondition",
        l.item_condition AS "condition",
        l.status,
        l.location_text AS "location",
        l.location_text AS "locationText",
        l.is_featured AS "isFeatured",
        l.created_at AS "createdAt",
        l.updated_at AS "updatedAt",
        p.full_name AS "sellerName",
        p.hostel_name AS "sellerHostel",
        p.room_number AS "sellerRoom",
        COALESCE(p.program, p.academic_role) AS "sellerProgram",
        p.avatar_url AS "sellerAvatar",
        COALESCE(
          (SELECT json_agg(li.image_url ORDER BY li.display_order ASC, li.id ASC)
           FROM listing_images li
           WHERE li.listing_id = l.id),
          '[]'::json
        ) AS images,
        CASE
          WHEN $${userParamIdx}::uuid IS NOT NULL THEN
            EXISTS(SELECT 1 FROM wishlists w WHERE w.listing_id = l.id AND w.user_id = $${userParamIdx}::uuid)
          ELSE FALSE
        END AS "isWishlisted",
        CASE
          WHEN $${userParamIdx}::uuid IS NOT NULL AND l.seller_id = $${userParamIdx}::uuid THEN TRUE
          ELSE FALSE
        END AS "isMine"
      FROM listings l
      LEFT JOIN categories c ON c.id = l.category_id
      LEFT JOIN profiles p ON p.id = l.seller_id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${idx++} OFFSET $${idx++}
    `;

    values.push(limit);
    values.push(offset);

    const result = await database.query(dataQuery, values);

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

  async function findById(id, userId = null) {
    const result = await database.query(
      `SELECT
         l.id,
         l.seller_id AS "sellerId",
         l.category_id AS "categoryId",
         c.name AS "categoryName",
         c.slug AS "categorySlug",
         l.title,
         l.description,
         l.price::numeric AS price,
         l.original_price::numeric AS "originalPrice",
         l.listing_type AS "listingType",
         l.item_condition AS "itemCondition",
         l.item_condition AS "condition",
         l.status,
         l.location_text AS "location",
         l.location_text AS "locationText",
         l.is_featured AS "isFeatured",
         l.created_at AS "createdAt",
         l.updated_at AS "updatedAt",
         p.full_name AS "sellerName",
         p.phone AS "sellerPhone",
         p.hostel_name AS "sellerHostel",
         p.room_number AS "sellerRoom",
         COALESCE(p.program, p.academic_role) AS "sellerProgram",
         p.avatar_url AS "sellerAvatar",
         COALESCE(
           (SELECT json_agg(li.image_url ORDER BY li.display_order ASC, li.id ASC)
            FROM listing_images li
            WHERE li.listing_id = l.id),
           '[]'::json
         ) AS images,
         CASE
           WHEN $2::uuid IS NOT NULL THEN
             EXISTS(SELECT 1 FROM wishlists w WHERE w.listing_id = l.id AND w.user_id = $2::uuid)
           ELSE FALSE
         END AS "isWishlisted",
         CASE
           WHEN $2::uuid IS NOT NULL AND l.seller_id = $2::uuid THEN TRUE
           ELSE FALSE
         END AS "isMine"
       FROM listings l
       LEFT JOIN categories c ON c.id = l.category_id
       LEFT JOIN profiles p ON p.id = l.seller_id
       WHERE l.id = $1
       LIMIT 1`,
      [id, userId]
    );

    return result.rows[0] ?? null;
  }

  async function createListing({
    sellerId,
    categoryId,
    title,
    description,
    price,
    originalPrice,
    listingType,
    itemCondition,
    locationText,
    isFeatured,
    images = [],
  }) {
    const client = await database.connect();

    try {
      await client.query('BEGIN');

      const insertListingQuery = `
        INSERT INTO listings (
          seller_id,
          category_id,
          title,
          description,
          price,
          original_price,
          listing_type,
          item_condition,
          status,
          location_text,
          is_featured
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, $10)
        RETURNING id
      `;

      const insertResult = await client.query(insertListingQuery, [
        sellerId,
        categoryId,
        title,
        description,
        price,
        originalPrice,
        listingType,
        itemCondition,
        locationText,
        isFeatured ?? false,
      ]);

      const listingId = insertResult.rows[0].id;

      if (Array.isArray(images) && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          if (typeof images[i] === 'string' && images[i].trim()) {
            await client.query(
              `INSERT INTO listing_images (listing_id, image_url, display_order)
               VALUES ($1, $2, $3)`,
              [listingId, images[i].trim(), i]
            );
          }
        }
      }

      await client.query('COMMIT');
      return findById(listingId, sellerId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async function updateListing(listingId, updates, images) {
    const client = await database.connect();

    try {
      await client.query('BEGIN');

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
      if (updates.price !== undefined) {
        sets.push(`price = $${idx++}`);
        values.push(updates.price);
      }
      if (updates.originalPrice !== undefined) {
        sets.push(`original_price = $${idx++}`);
        values.push(updates.originalPrice);
      }
      if (updates.listingType !== undefined) {
        sets.push(`listing_type = $${idx++}`);
        values.push(updates.listingType);
      }
      if (updates.itemCondition !== undefined) {
        sets.push(`item_condition = $${idx++}`);
        values.push(updates.itemCondition);
      }
      if (updates.status !== undefined) {
        sets.push(`status = $${idx++}`);
        values.push(updates.status);
      }
      if (updates.locationText !== undefined) {
        sets.push(`location_text = $${idx++}`);
        values.push(updates.locationText);
      }
      if (updates.categoryId !== undefined) {
        sets.push(`category_id = $${idx++}`);
        values.push(updates.categoryId);
      }
      if (updates.isFeatured !== undefined) {
        sets.push(`is_featured = $${idx++}`);
        values.push(updates.isFeatured);
      }

      if (sets.length > 0) {
        sets.push(`updated_at = NOW()`);
        values.push(listingId);
        await client.query(
          `UPDATE listings
           SET ${sets.join(', ')}
           WHERE id = $${idx}`,
          values
        );
      }

      if (Array.isArray(images)) {
        await client.query(`DELETE FROM listing_images WHERE listing_id = $1`, [listingId]);
        for (let i = 0; i < images.length; i++) {
          if (typeof images[i] === 'string' && images[i].trim()) {
            await client.query(
              `INSERT INTO listing_images (listing_id, image_url, display_order)
               VALUES ($1, $2, $3)`,
              [listingId, images[i].trim(), i]
            );
          }
        }
      }

      await client.query('COMMIT');
      return findById(listingId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async function deleteListing(listingId) {
    const result = await database.query(
      `UPDATE listings
       SET status = 'removed', updated_at = NOW()
       WHERE id = $1
       RETURNING id, status`,
      [listingId]
    );
    return result.rows[0] ?? null;
  }

  async function findCategoryBySlugOrName(slugOrName) {
    if (!slugOrName) return null;
    const result = await database.query(
      `SELECT id, name, slug
       FROM categories
       WHERE slug = $1 OR LOWER(name) = LOWER($1)
       LIMIT 1`,
      [slugOrName.trim()]
    );
    return result.rows[0] ?? null;
  }

  return {
    findAll,
    findById,
    createListing,
    updateListing,
    deleteListing,
    findCategoryBySlugOrName,
  };
}

export const listingRepository = createListingRepository();
