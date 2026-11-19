import { authFetch } from './authApi';

export async function fetchProfileApi(token) {
  const response = await authFetch('/api/users/me', { method: 'GET' }, token);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data.data?.profile;
}

export async function updateProfileApi(updates, token) {
  const response = await authFetch(
    '/api/users/me',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Failed to update profile');
    error.details = data.details;
    throw error;
  }
  return data.data?.profile;
}

export async function fetchPublicProfileApi(userId) {
  const response = await authFetch(`/api/users/${userId}`, { method: 'GET' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch public profile');
  return data.data?.profile;
}
