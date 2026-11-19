import { authFetch } from './authApi';

export async function fetchUserClaimsApi(token) {
  const response = await authFetch('/api/claims', { method: 'GET' }, token);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to fetch claims');
  return data.data?.claims || [];
}

export async function submitClaimApi(listingId, claimData, token) {
  const response = await authFetch(
    `/api/listings/${listingId}/claims`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(claimData),
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to submit claim');
  return data.data?.claim;
}

export async function updateClaimStatusApi(claimId, status, token) {
  const response = await authFetch(
    `/api/claims/${claimId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    },
    token
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to update claim status');
  return data.data?.claim;
}
