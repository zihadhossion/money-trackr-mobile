import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GoogleSignin,
  statusCodes,
  isSuccessResponse,
} from '@react-native-google-signin/google-signin';
import api from '../services/api';
import { getAccessToken, setAccessToken, setRefreshToken, setUserData, getUserData, clearAuthStorage } from '../utils/storage';
import type { User } from '../types';

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

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
    });
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await getAccessToken();
      if (!token) {
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

  const signOut = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout').catch(() => {});
      await GoogleSignin.signOut();
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
