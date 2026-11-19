import { chatRepository } from './chat.repository.js';
import { listingRepository } from '../listings/listing.repository.js';
import { profileRepository } from '../profiles/profile.repository.js';

function formatMessageTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  return `${diffDays} days ago`;
}

export function createChatService(
  repository = chatRepository,
  listingRepo = listingRepository,
  profileRepo = profileRepository
) {
  async function getUserConversations(userId) {
    const rows = await repository.findUserConversations(userId);
    return rows.map((row) => {
      const otherRoom = row.otherUserRoom || '';
      const otherProg = row.otherUserProgram || row.otherUserHostel || 'Campus Peer';
      const sellerRole = otherRoom ? `${otherRoom} • ${otherProg}` : otherProg;

      return {
        id: String(row.id),
        conversationId: String(row.id),
        listingId: row.listingId ? String(row.listingId) : null,
        sellerName: row.otherUserName || 'Campus Student',
        sellerRole,
        productTitle: row.listingTitle || 'Marketplace Item',
        productPrice: row.listingPrice !== null ? Number(row.listingPrice) : 0,
        productImage: row.listingImage || '/images/arc_lamp.png',
        unread: Number(row.unreadCount) > 0,
        unreadCount: Number(row.unreadCount),
        otherUserId: row.otherUserId,
        lastMessage: row.lastMessageText
          ? {
              id: row.lastMessageId,
              text: row.lastMessageText,
              senderId: row.lastMessageSenderId,
              time: formatMessageTime(row.lastMessageTime),
              createdAt: row.lastMessageTime,
            }
          : null,
      };
    });
  }

  async function getConversationMessages(conversationId, userId) {
    const conv = await repository.findConversationById(conversationId);
    if (!conv) {
      const error = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    if (conv.buyerId !== userId && conv.sellerId !== userId) {
      const error = new Error('You are not authorized to view messages in this conversation.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await repository.markConversationAsRead(conversationId, userId);

    const msgs = await repository.findMessages(conversationId);
    return msgs.map((m) => {
      const isMe = m.senderId === userId;
      return {
        id: String(m.id),
        senderId: m.senderId,
        sender: isMe ? 'Me' : m.senderName || 'Peer',
        text: m.messageText,
        time: formatMessageTime(m.createdAt),
        createdAt: m.createdAt,
        isMe,
      };
    });
  }

  async function startConversation(userId, input) {
    let targetSellerId = input.sellerId || input.otherUserId;
    let listingId = input.listingId ? Number(input.listingId) : null;

    if (!targetSellerId && listingId) {
      const listing = await listingRepo.findById(listingId);
      if (listing) {
        targetSellerId = listing.sellerId;
      }
    }

    if (!targetSellerId) {
      const error = new Error('Recipient user ID or valid listing ID is required.');
      error.statusCode = 400;
      throw error;
    }

    if (targetSellerId === userId) {
      const error = new Error('You cannot start a conversation with yourself.');
      error.statusCode = 400;
      error.code = 'CANNOT_CHAT_WITH_SELF';
      throw error;
    }

    const sellerProfile = await profileRepo.findProfileById(targetSellerId);
    if (!sellerProfile) {
      const error = new Error('Recipient user not found.');
      error.statusCode = 404;
      throw error;
    }

    let existing = await repository.findConversationBetween(userId, targetSellerId, listingId);
    let conversationId;

    if (existing) {
      conversationId = existing.id;
    } else {
      conversationId = await repository.createConversation(userId, targetSellerId, listingId);
    }

    const initialText = input.initialMessage || input.message;
    if (initialText && initialText.trim()) {
      await repository.createMessage(conversationId, userId, initialText.trim());
    }

    const convs = await getUserConversations(userId);
    const conv = convs.find((c) => c.id === String(conversationId));
    return conv || { id: String(conversationId) };
  }

  async function sendMessage(conversationId, userId, text) {
    const conv = await repository.findConversationById(conversationId);
    if (!conv) {
      const error = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    if (conv.buyerId !== userId && conv.sellerId !== userId) {
      const error = new Error('You are not authorized to send messages in this conversation.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    const created = await repository.createMessage(conversationId, userId, text);
    return {
      id: String(created.id),
      conversationId: String(created.conversationId),
      senderId: created.senderId,
      sender: 'Me',
      text: created.messageText,
      time: 'Just now',
      createdAt: created.createdAt,
      isMe: true,
    };
  }

  async function markAsRead(conversationId, userId) {
    const conv = await repository.findConversationById(conversationId);
    if (!conv) {
      const error = new Error('Conversation not found.');
      error.statusCode = 404;
      throw error;
    }

    if (conv.buyerId !== userId && conv.sellerId !== userId) {
      const error = new Error('You are not authorized to access this conversation.');
      error.statusCode = 403;
      throw error;
    }

    await repository.markConversationAsRead(conversationId, userId);
    return { success: true, conversationId: String(conversationId) };
  }

  return {
    getUserConversations,
    getConversationMessages,
    startConversation,
    sendMessage,
    markAsRead,
  };
}

export const chatService = createChatService();
