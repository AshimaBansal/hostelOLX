const API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:4001';

export async function loginWithGoogleApi(idToken) {
  const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ idToken }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Google login failed.');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data;
}

export async function getMeApi(token) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Failed to fetch user session.');
    error.status = response.status;
    throw error;
  }

  return data;
}

export async function registerApi({ fullName, email, password }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fullName, email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Registration failed.');
    error.status = response.status;
    error.errors = data.errors;
    error.code = data.code;
    throw error;
  }

  return data;
}

export async function authFetch(endpoint, options = {}, token) {
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  return fetch(url, {
    ...options,
    headers,
  });
}
