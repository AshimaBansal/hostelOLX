import store, { nextId, now } from '../store/memoryStore.js';

export async function findById(id) {
  return store.conversations.find((c) => c.id === id) ?? null;
}

export async function findForUser(userId) {
  return store.conversations
    .filter((c) => c.buyerId === userId || c.sellerId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function findExisting(listingId, buyerId, sellerId) {
  return (
    store.conversations.find(
      (c) => c.listingId === listingId && c.buyerId === buyerId && c.sellerId === sellerId,
    ) ?? null
  );
}

export async function create({ listingId, buyerId, sellerId }) {
  const timestamp = now();
  const conversation = { id: nextId('conversations'), listingId, buyerId, sellerId, createdAt: timestamp, updatedAt: timestamp };
  store.conversations.push(conversation);
  store.conversationMembers.push(
    { conversationId: conversation.id, userId: buyerId, lastReadAt: timestamp },
    { conversationId: conversation.id, userId: sellerId, lastReadAt: null },
  );
  return conversation;
}

export async function touch(id) {
  const conversation = store.conversations.find((c) => c.id === id);
  if (conversation) conversation.updatedAt = now();
}

export async function findMessages(conversationId) {
  return store.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id);
}

export async function findLastMessage(conversationId) {
  const list = await findMessages(conversationId);
  return list.at(-1) ?? null;
}

export async function addMessage({ conversationId, senderId, messageText }) {
  const message = { id: nextId('messages'), conversationId, senderId, messageText, createdAt: now() };
  store.messages.push(message);
  return message;
}

export async function getMember(conversationId, userId) {
  return store.conversationMembers.find((m) => m.conversationId === conversationId && m.userId === userId) ?? null;
}

export async function markRead(conversationId, userId) {
  const member = await getMember(conversationId, userId);
  if (member) member.lastReadAt = now();
  return member;
}

export async function countUnread(conversationId, userId) {
  const member = await getMember(conversationId, userId);
  const lastReadAt = member?.lastReadAt ?? '';
  return store.messages.filter(
    (m) => m.conversationId === conversationId && m.senderId !== userId && m.createdAt > lastReadAt,
  ).length;
}
