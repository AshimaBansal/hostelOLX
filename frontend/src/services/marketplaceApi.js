import { authFetch } from './authApi';

const API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:4001';

export async function fetchListings(filters = {}, token = null) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.q) params.append('q', filters.q);
  if (filters.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters.type && filters.type !== 'all') params.append('type', filters.type);
  if (filters.section) params.append('section', filters.section);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);

  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await authFetch(`/api/listings${query}`, { method: 'GET' }, token);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch listings');
  }

  return data.data || { listings: [] };
}

export async function fetchListingById(id, token = null) {
  const response = await authFetch(`/api/listings/${id}`, { method: 'GET' }, token);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch listing');
  }

  return data.data?.listing;
}

export async function createListingApi(listingData, token) {
  const response = await authFetch(
    '/api/listings',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    },
    token
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to create listing');
    error.details = data.details;
    throw error;
  }

  return data.data?.listing;
}

export async function updateListingApi(id, updates, token) {
  const response = await authFetch(
    `/api/listings/${id}`,
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
    const error = new Error(data.message || 'Failed to update listing');
    error.details = data.details;
    throw error;
  }

  return data.data?.listing;
}

export async function deleteListingApi(id, token) {
  const response = await authFetch(
    `/api/listings/${id}`,
    {
      method: 'DELETE',
    },
    token
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete listing');
  }

  return data;
}

export async function uploadImageApi(base64Data, token) {
  const response = await authFetch(
    '/api/upload',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: base64Data }),
    },
    token
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Image upload failed');
  }

  return data.data?.url;
}

export async function fetchCategoriesApi() {
  const response = await fetch(`${API_BASE_URL}/api/categories`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch categories');
  return data.data?.categories || [];
}

export async function fetchHandoverSpotsApi() {
  const response = await fetch(`${API_BASE_URL}/api/handover-spots`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch handover spots');
  return data.data?.handoverSpots || [];
}

export async function fetchCampusStatsApi() {
  const response = await fetch(`${API_BASE_URL}/api/stats`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch campus stats');
  return data.data?.stats;
}
