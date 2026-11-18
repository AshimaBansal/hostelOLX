import * as conversationRepo from '../repositories/conversation.repository.js';
import * as listingRepo from '../repositories/listing.repository.js';
import { getRawOrFail } from './listing.service.js';
import { getCurrentProfileOrFail, getPublicProfileMap } from './profile.service.js';
import ApiError from '../utils/ApiError.js';

function listingSummary(listing) {
  if (!listing) return null;
  return {
    id: listing.id,
    title: listing.title,
    price: listing.price,
    status: listing.status,
    image: listing.images?.[0] ?? null,
  };
}

function presentMessage(message, userId) {
  return { ...message, isMine: message.senderId === userId };
}

async function getConversationForMemberOrFail(conversationId, userId) {
  const conversation = await conversationRepo.findById(conversationId);
  // Same 404 for "does not exist" and "not yours" so ids cannot be probed
  if (!conversation || (conversation.buyerId !== userId && conversation.sellerId !== userId)) {
    throw ApiError.notFound('Conversation');
  }
  return conversation;
}

async function presentConversation(conversation, userId, profiles) {
  const otherUserId = conversation.buyerId === userId ? conversation.sellerId : conversation.buyerId;
  const [listing, lastMessage, unreadCount] = await Promise.all([
    listingRepo.findById(conversation.listingId),
    conversationRepo.findLastMessage(conversation.id),
    conversationRepo.countUnread(conversation.id, userId),
  ]);

  return {
    id: conversation.id,
    role: conversation.buyerId === userId ? 'buyer' : 'seller',
    otherUser: profiles.get(otherUserId) ?? null,
    listing: listingSummary(listing),
    lastMessage: lastMessage ? presentMessage(lastMessage, userId) : null,
    unreadCount,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };
}

export async function getMyConversations(userId) {
  await getCurrentProfileOrFail(userId);
  const conversations = await conversationRepo.findForUser(userId);
  const profiles = await getPublicProfileMap(conversations.flatMap((c) => [c.buyerId, c.sellerId]));
  return Promise.all(conversations.map((c) => presentConversation(c, userId, profiles)));
}

export async function getConversation(conversationId, userId) {
  const conversation = await getConversationForMemberOrFail(conversationId, userId);
  const profiles = await getPublicProfileMap([conversation.buyerId, conversation.sellerId]);
  return presentConversation(conversation, userId, profiles);
}

// Buyer opens a chat about a listing. Re-uses the chat if it already exists.
export async function startConversation(userId, { listingId, message }) {
  await getCurrentProfileOrFail(userId);
  const listing = await getRawOrFail(listingId);

  if (!['active', 'reserved'].includes(listing.status)) {
    throw ApiError.badRequest('This listing is no longer available');
  }
  if (listing.sellerId === userId) {
    throw ApiError.badRequest('You cannot start a chat on your own listing');
  }

  let conversation = await conversationRepo.findExisting(listingId, userId, listing.sellerId);
  const created = !conversation;
  if (created) {
    conversation = await conversationRepo.create({ listingId, buyerId: userId, sellerId: listing.sellerId });
  }

  if (message) {
    await sendMessage(conversation.id, userId, message);
  }

  return { created, conversation: await getConversation(conversation.id, userId) };
}

export async function getMessages(conversationId, userId) {
  await getConversationForMemberOrFail(conversationId, userId);
  const messages = await conversationRepo.findMessages(conversationId);
  return messages.map((m) => presentMessage(m, userId));
}

export async function sendMessage(conversationId, userId, messageText) {
  await getConversationForMemberOrFail(conversationId, userId);
  const message = await conversationRepo.addMessage({ conversationId, senderId: userId, messageText });
  await conversationRepo.touch(conversationId);
  // Your own message means you have read the chat up to now
  await conversationRepo.markRead(conversationId, userId);
  return presentMessage(message, userId);
}

export async function markAsRead(conversationId, userId) {
  await getConversationForMemberOrFail(conversationId, userId);
  const member = await conversationRepo.markRead(conversationId, userId);
  return { conversationId, lastReadAt: member?.lastReadAt ?? null };
}

export async function getUnreadTotal(userId) {
  const conversations = await conversationRepo.findForUser(userId);
  const counts = await Promise.all(conversations.map((c) => conversationRepo.countUnread(c.id, userId)));
  return counts.reduce((sum, n) => sum + n, 0);
}
