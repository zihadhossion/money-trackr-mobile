import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { settingsService } from '../services/settingsService';
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  formatCurrency,
  getCurrencySymbol,
} from '../utils/currency';

const CURRENCY_STORAGE_KEY = 'currency';

const isSupported = (code?: string | null): boolean =>
  !!code && SUPPORTED_CURRENCIES.some((c) => c.code === code);

interface CurrencyContextType {
  currency: string;
  symbol: string;
  format: (amount: number) => string;
  setCurrency: (code: string) => Promise<void>;
  supportedCurrencies: typeof SUPPORTED_CURRENCIES;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  symbol: getCurrencySymbol(DEFAULT_CURRENCY),
  format: (amount) => formatCurrency(amount, DEFAULT_CURRENCY),
  setCurrency: async () => {},
  supportedCurrencies: SUPPORTED_CURRENCIES,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  // The cached code renders the first frame; the server is the source of truth
  // and overwrites it once the user is signed in.
  useEffect(() => {
    AsyncStorage.getItem(CURRENCY_STORAGE_KEY).then((stored) => {
      if (isSupported(stored)) setCurrencyState(stored as string);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    settingsService.get().then((settings) => {
      if (isSupported(settings.currency)) {
        setCurrencyState(settings.currency);
        AsyncStorage.setItem(CURRENCY_STORAGE_KEY, settings.currency).catch(() => {});
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  // Local only: the settings screen persists the change through the API and
  // then calls this so every screen re-renders without a refetch.
  const setCurrency = useCallback(async (code: string) => {
    setCurrencyState(code);
    await AsyncStorage.setItem(CURRENCY_STORAGE_KEY, code).catch(() => {});
  }, []);

  const value = useMemo<CurrencyContextType>(() => ({
    currency,
    symbol: getCurrencySymbol(currency),
    format: (amount: number) => formatCurrency(amount, currency),
    setCurrency,
    supportedCurrencies: SUPPORTED_CURRENCIES,
  }), [currency, setCurrency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export const useCurrency = () => useContext(CurrencyContext);
