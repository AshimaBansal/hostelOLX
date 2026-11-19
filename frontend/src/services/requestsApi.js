import { authFetch } from './authApi';

export async function fetchRequestsApi(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await authFetch(`/api/requests${query}`, { method: 'GET' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch requests');
  return data.data?.requests || [];
}

export async function createRequestApi(requestData, token) {
  const response = await authFetch(
    '/api/requests',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to create request');
  return data.data?.request;
}

export async function updateRequestApi(id, updates, token) {
  const response = await authFetch(
    `/api/requests/${id}`,
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
  if (!response.ok) throw new Error(data.message || 'Failed to update request');
  return data.data?.request;
}

export async function deleteRequestApi(id, token) {
  const response = await authFetch(
    `/api/requests/${id}`,
    {
      method: 'DELETE',
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to delete request');
  return data;
}
