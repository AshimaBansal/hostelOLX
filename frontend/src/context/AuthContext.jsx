import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextDef';
import {
  loginWithGoogleApi,
  loginApi,
  registerApi,
  demoLoginApi,
  getMeApi,
  authFetch,
} from '../services/authApi';

const TOKEN_STORAGE_KEY = 'hostelolx_auth_token';

const DEMO_USER = {
  id: '11111111-1111-1111-1111-111111111111',
  fullName: 'Campus Student',
  email: 'student@nst.rishihood.edu.in',
  role: 'STUDENT',
  hostel: 'Hostel 1 (North Wing)',
  roomNo: '102',
  program: "Tech '27",
  phone: '+91 98765 43210',
};
const DEMO_TOKEN = 'demo-jwt-token-hostelolx';

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

    if (savedToken === DEMO_TOKEN) {
      setUser(DEMO_USER);
      setToken(DEMO_TOKEN);
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

      if (savedToken === DEMO_TOKEN) {
        if (!isCancelled) {
          setUser(DEMO_USER);
          setToken(DEMO_TOKEN);
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

  const loginWithEmail = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await loginApi({ email, password });
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
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const registerWithEmail = useCallback(async ({ fullName, email, password }) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await registerApi({ fullName, email, password });
      if (data?.accessToken && data?.user) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
        setToken(data.accessToken);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginDemoStudent = useCallback(async (customUser = {}) => {
    setIsLoading(true);
    setError(null);

    const mergedDemo = {
      ...DEMO_USER,
      ...customUser,
    };

    try {
      const data = await demoLoginApi(mergedDemo);
      if (data?.accessToken && data?.user) {
        sessionStorage.setItem(TOKEN_STORAGE_KEY, data.accessToken);
        setToken(data.accessToken);
        setUser({ ...mergedDemo, ...data.user });
        setError(null);
        return data;
      }
    } catch {
      // Offline or network fallback
    } finally {
      setIsLoading(false);
    }

    sessionStorage.setItem(TOKEN_STORAGE_KEY, DEMO_TOKEN);
    setToken(DEMO_TOKEN);
    setUser(mergedDemo);
    setError(null);
    return { user: mergedDemo, accessToken: DEMO_TOKEN };
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
    loginWithEmail,
    registerWithEmail,
    loginDemoStudent,
    logout,
    clearError,
    authRequest,
    retrySessionVerification: restoreSession,
    restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
