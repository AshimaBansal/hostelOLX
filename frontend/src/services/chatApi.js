import { authFetch } from './authApi';

export async function fetchConversationsApi(token) {
  const response = await authFetch('/api/chats', { method: 'GET' }, token);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch conversations');
  return data.data?.chats || [];
}

export async function fetchMessagesApi(conversationId, token) {
  const response = await authFetch(`/api/chats/${conversationId}/messages`, { method: 'GET' }, token);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch messages');
  return data.data?.messages || [];
}

export async function startChatApi(chatData, token) {
  const response = await authFetch(
    '/api/chats',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatData),
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to start conversation');
  return data.data?.chat;
}

export async function sendMessageApi(conversationId, text, token) {
  const response = await authFetch(
    `/api/chats/${conversationId}/messages`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageText: text }),
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to send message');
  return data.data?.message;
}

export async function markChatReadApi(conversationId, token) {
  const response = await authFetch(
    `/api/chats/${conversationId}/read`,
    {
      method: 'PATCH',
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to mark chat as read');
  return data.data;
}
