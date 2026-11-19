import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextDef';
import { loginWithGoogleApi, getMeApi, authFetch } from '../services/authApi';

const TOKEN_STORAGE_KEY = 'hostelolx_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setToken(null);
    setError(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await getMeApi(savedToken);
      const resolvedUser = response.user || response;
      setUser(resolvedUser);
      setToken(savedToken);
      setError(null);
    } catch (err) {
      if (err?.status === 401) {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        setToken(null);
        setError('Session expired. Please sign in again.');
      } else {
        setUser(null);
        setToken(savedToken);
        setError(err.message || 'Unable to verify session due to a network or server issue.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function initSession() {
      const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
      if (!savedToken) {
        if (!isCancelled) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await getMeApi(savedToken);
        const resolvedUser = response.user || response;
        if (!isCancelled) {
          setUser(resolvedUser);
          setToken(savedToken);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          if (err?.status === 401) {
            sessionStorage.removeItem(TOKEN_STORAGE_KEY);
            setUser(null);
            setToken(null);
            setError('Session expired. Please sign in again.');
          } else {
            setUser(null);
            setToken(savedToken);
            setError(err.message || 'Unable to verify session due to a network or server issue.');
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isCancelled = true;
    };
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await loginWithGoogleApi(idToken);
      if (!data?.accessToken || !data?.user) {
        throw new Error('Invalid authentication response from server.');
      }
      const authToken = data.accessToken;
      const authUser = data.user;

      sessionStorage.setItem(TOKEN_STORAGE_KEY, authToken);
      setToken(authToken);
      setUser(authUser);
      return data;
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const authRequest = useCallback(async (endpoint, options = {}) => {
    const response = await authFetch(endpoint, options, token);
    if (response.status === 401) {
      logout();
    }
    return response;
  }, [token, logout]);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    error,
    loginWithGoogle,
    logout,
    clearError,
    authRequest,
    retrySessionVerification: restoreSession,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
