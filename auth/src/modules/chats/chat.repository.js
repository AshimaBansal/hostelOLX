import { pool } from '../../database.js';

export function createChatRepository(database = pool) {
  async function findUserConversations(userId) {
    const result = await database.query(
      `SELECT
         c.id,
         c.listing_id AS "listingId",
         c.buyer_id AS "buyerId",
         c.seller_id AS "sellerId",
         c.created_at AS "createdAt",
         c.updated_at AS "updatedAt",
         l.title AS "listingTitle",
         l.price::numeric AS "listingPrice",
         COALESCE(
           (SELECT li.image_url
            FROM listing_images li
            WHERE li.listing_id = l.id
            ORDER BY li.display_order ASC, li.id ASC
            LIMIT 1),
           '/images/arc_lamp.png'
         ) AS "listingImage",
         CASE
           WHEN c.buyer_id = $1 THEN sp.id
           ELSE bp.id
         END AS "otherUserId",
         CASE
           WHEN c.buyer_id = $1 THEN sp.full_name
           ELSE bp.full_name
         END AS "otherUserName",
         CASE
           WHEN c.buyer_id = $1 THEN sp.hostel_name
           ELSE bp.hostel_name
         END AS "otherUserHostel",
         CASE
           WHEN c.buyer_id = $1 THEN sp.room_number
           ELSE bp.room_number
         END AS "otherUserRoom",
         CASE
           WHEN c.buyer_id = $1 THEN COALESCE(sp.program, sp.academic_role)
           ELSE COALESCE(bp.program, bp.academic_role)
         END AS "otherUserProgram",
         CASE
           WHEN c.buyer_id = $1 THEN sp.avatar_url
           ELSE bp.avatar_url
         END AS "otherUserAvatar",
         lm.id AS "lastMessageId",
         lm.sender_id AS "lastMessageSenderId",
         lm.message_text AS "lastMessageText",
         lm.created_at AS "lastMessageTime",
         cm.last_read_at AS "lastReadAt",
         (
           SELECT COUNT(*)
           FROM messages m
           WHERE m.conversation_id = c.id
             AND m.sender_id <> $1
             AND (cm.last_read_at IS NULL OR m.created_at > cm.last_read_at)
         )::int AS "unreadCount"
       FROM conversations c
       LEFT JOIN listings l ON l.id = c.listing_id
       LEFT JOIN profiles bp ON bp.id = c.buyer_id
       LEFT JOIN profiles sp ON sp.id = c.seller_id
       LEFT JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
       LEFT JOIN LATERAL (
         SELECT id, sender_id, message_text, created_at
         FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC
         LIMIT 1
       ) lm ON TRUE
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY COALESCE(lm.created_at, c.updated_at) DESC`,
      [userId]
    );

    return result.rows;
  }

  async function findConversationById(id) {
    const result = await database.query(
      `SELECT
         c.id,
         c.listing_id AS "listingId",
         c.buyer_id AS "buyerId",
         c.seller_id AS "sellerId",
         c.created_at AS "createdAt",
         c.updated_at AS "updatedAt",
         l.title AS "listingTitle",
         l.price::numeric AS "listingPrice",
         COALESCE(
           (SELECT li.image_url
            FROM listing_images li
            WHERE li.listing_id = l.id
            ORDER BY li.display_order ASC, li.id ASC
            LIMIT 1),
           '/images/arc_lamp.png'
         ) AS "listingImage"
       FROM conversations c
       LEFT JOIN listings l ON l.id = c.listing_id
       WHERE c.id = $1
       LIMIT 1`,
      [id]
    );

    return result.rows[0] ?? null;
  }

  async function findConversationBetween(buyerId, sellerId, listingId = null) {
    let query;
    let values;

    if (listingId) {
      query = `
        SELECT id, listing_id AS "listingId", buyer_id AS "buyerId", seller_id AS "sellerId"
        FROM conversations
        WHERE listing_id = $1
          AND ((buyer_id = $2 AND seller_id = $3) OR (buyer_id = $3 AND seller_id = $2))
        LIMIT 1
      `;
      values = [listingId, buyerId, sellerId];
    } else {
      query = `
        SELECT id, listing_id AS "listingId", buyer_id AS "buyerId", seller_id AS "sellerId"
        FROM conversations
        WHERE ((buyer_id = $1 AND seller_id = $2) OR (buyer_id = $2 AND seller_id = $1))
        LIMIT 1
      `;
      values = [buyerId, sellerId];
    }

    const result = await database.query(query, values);
    return result.rows[0] ?? null;
  }

  async function createConversation(buyerId, sellerId, listingId = null) {
    const client = await database.connect();

    try {
      await client.query('BEGIN');

      const convResult = await client.query(
        `INSERT INTO conversations (buyer_id, seller_id, listing_id)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [buyerId, sellerId, listingId]
      );

      const conversationId = convResult.rows[0].id;

      await client.query(
        `INSERT INTO conversation_members (conversation_id, user_id, last_read_at)
         VALUES ($1, $2, NOW()), ($1, $3, NULL)
         ON CONFLICT (conversation_id, user_id) DO NOTHING`,
        [conversationId, buyerId, sellerId]
      );

      await client.query('COMMIT');
      return conversationId;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async function findMessages(conversationId) {
    const result = await database.query(
      `SELECT
         m.id,
         m.conversation_id AS "conversationId",
         m.sender_id AS "senderId",
         m.message_text AS "messageText",
         m.created_at AS "createdAt",
         p.full_name AS "senderName"
       FROM messages m
       LEFT JOIN profiles p ON p.id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [conversationId]
    );

    return result.rows;
  }

  async function createMessage(conversationId, senderId, messageText) {
    const client = await database.connect();

    try {
      await client.query('BEGIN');

      const msgResult = await client.query(
        `INSERT INTO messages (conversation_id, sender_id, message_text)
         VALUES ($1, $2, $3)
         RETURNING id, conversation_id AS "conversationId", sender_id AS "senderId", message_text AS "messageText", created_at AS "createdAt"`,
        [conversationId, senderId, messageText.trim()]
      );

      await client.query(
        `UPDATE conversations
         SET updated_at = NOW()
         WHERE id = $1`,
        [conversationId]
      );

      await client.query(
        `UPDATE conversation_members
         SET last_read_at = NOW()
         WHERE conversation_id = $1 AND user_id = $2`,
        [conversationId, senderId]
      );

      await client.query('COMMIT');
      return msgResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async function markConversationAsRead(conversationId, userId) {
    await database.query(
      `INSERT INTO conversation_members (conversation_id, user_id, last_read_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (conversation_id, user_id)
       DO UPDATE SET last_read_at = NOW()`,
      [conversationId, userId]
    );
  }

  return {
    findUserConversations,
    findConversationById,
    findConversationBetween,
    createConversation,
    findMessages,
    createMessage,
    markConversationAsRead,
  };
}

export const chatRepository = createChatRepository();
