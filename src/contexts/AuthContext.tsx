import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import api, { setOnAuthFailure } from '../services/api';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, setUserData, getUserData, clearAuthStorage } from '../utils/storage';
import { isTokenExpired } from '../utils/jwt';
import type { User } from '../types';

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  updateUser: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
    });
    bootstrap();

    // The response interceptor clears storage when a refresh fails; mirror that
    // here so the context stops reporting an authenticated user.
    setOnAuthFailure(() => setUser(null));
    return () => setOnAuthFailure(null);
  }, []);

  /**
   * Decides from local storage alone whether there is a session to restore, so
   * a cold start never waits on the network before the splash can go. The
   * access token lives 15 minutes and is therefore almost always stale on
   * launch; the refresh token's 7 day life is what actually says whether the
   * user is still signed in, and its `exp` can be read without asking the
   * server.
   */
  async function bootstrap() {
    try {
      const [accessToken, refreshToken, cachedUser] = await Promise.all([
        getAccessToken(),
        getRefreshToken(),
        getUserData(),
      ]);

      // Nothing to restore, or the refresh token outlived its 7 days. Decide it
      // here rather than paying a round trip to be told the same thing.
      if (!accessToken || isTokenExpired(refreshToken)) {
        await clearAuthStorage();
        setUser(null);
        return;
      }

      if (cachedUser) {
        setUser(JSON.parse(cachedUser));
        verifySession();
        return;
      }

      // A token but no cached profile: there is nothing to render a session
      // from, so this is the one path that has to wait for the server.
      await verifySession();
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Confirms the restored session against the server and refreshes the cached
   * profile. Runs unawaited on the common path, so a slow or failing request
   * costs the user nothing at launch.
   */
  async function verifySession() {
    try {
      const res = await api.get('/auth/verify');
      if (res.data.user) {
        setUser(res.data.user);
        await setUserData(JSON.stringify(res.data.user));
      }
    } catch (err: any) {
      // A rejected session is genuinely dead — the interceptor already tried a
      // refresh before this reached us. An unreachable server keeps its tokens
      // so the next online launch restores the session without a fresh Google
      // sign-in; either way the user goes to the login screen rather than to a
      // dashboard that could only show zeros.
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        await clearAuthStorage();
      }
      setUser(null);
    }
  }

  async function handleGoogleToken(googleAccessToken: string) {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/login', { accessToken: googleAccessToken });
      if (res.data.success) {
        await setAccessToken(res.data.accessToken);
        await setRefreshToken(res.data.refreshToken);
        await setUserData(JSON.stringify(res.data.user));
        setUser(res.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  }

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const tokens = await GoogleSignin.getTokens();
        await handleGoogleToken(tokens.accessToken);
      } else {
        setLoading(false);
      }
    } catch (err: any) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) {
        setError(null);
      } else if (err.code === statusCodes.IN_PROGRESS) {
        setError('Sign-in already in progress');
      } else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError('Google Play Services not available');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
      setLoading(false);
    }
  };

  /**
   * Patches the signed-in profile in place. The cached copy is what a cold
   * start renders from, so it has to move with the context or the old value
   * comes back on the next launch.
   */
  const updateUser = async (patch: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...patch };
    setUser(next);
    await setUserData(JSON.stringify(next));
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout').catch(() => {});
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } finally {
      await clearAuthStorage();
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
