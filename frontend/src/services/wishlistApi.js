import { authFetch } from './authApi';

export async function fetchWishlistApi(token) {
  const response = await authFetch('/api/wishlist', { method: 'GET' }, token);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch wishlist');
  return data.data?.wishlist || [];
}

export async function addToWishlistApi(listingId, token) {
  const response = await authFetch(
    `/api/wishlist/${listingId}`,
    {
      method: 'POST',
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to add item to wishlist');
  return data.data;
}

export async function removeFromWishlistApi(listingId, token) {
  const response = await authFetch(
    `/api/wishlist/${listingId}`,
    {
      method: 'DELETE',
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to remove item from wishlist');
  return data.data;
}
