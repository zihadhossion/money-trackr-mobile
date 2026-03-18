import * as SecureStore from 'expo-secure-store';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
} as const;

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.ACCESS_TOKEN);
}

export async function setAccessToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(KEYS.ACCESS_TOKEN, token);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.REFRESH_TOKEN);
}

export async function setRefreshToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(KEYS.REFRESH_TOKEN, token);
}

export async function getUserData(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.USER_DATA);
}

export async function setUserData(userData: string): Promise<void> {
  return SecureStore.setItemAsync(KEYS.USER_DATA, userData);
}

export async function clearAuthStorage(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
    SecureStore.deleteItemAsync(KEYS.REFRESH_TOKEN),
    SecureStore.deleteItemAsync(KEYS.USER_DATA),
  ]);
}
