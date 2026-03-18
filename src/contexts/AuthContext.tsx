import React, { createContext, useContext, useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import api from '../services/api';
import { getAccessToken, setAccessToken, setRefreshToken, setUserData, getUserData, clearAuthStorage } from '../utils/storage';
import type { User } from '../types';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_EXPO_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID || '';
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_EXPO_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    redirectUri: makeRedirectUri({ scheme: 'moneytrackr' }),
    scopes: ['openid', 'profile', 'email'],
  });

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleToken(authentication.accessToken);
      }
    } else if (response?.type === 'error') {
      setError('Google sign-in failed');
      setLoading(false);
    }
  }, [response]);

  // Check persisted auth on app launch
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await getAccessToken();
      if (!token) {
        // Try to load cached user while we verify
        const cachedUser = await getUserData();
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
        setLoading(false);
        return;
      }

      const res = await api.get('/auth/verify');
      if (res.data.user) {
        setUser(res.data.user);
        await setUserData(JSON.stringify(res.data.user));
      }
    } catch {
      // Token invalid/expired — interceptor will try refresh; if that fails it clears storage
      setUser(null);
    } finally {
      setLoading(false);
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
      await promptAsync();
    } catch (err: any) {
      setError(err.message || 'Failed to open Google sign-in');
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      await clearAuthStorage();
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
