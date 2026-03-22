import React, { createContext, useContext, useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricContextType {
  isBiometricAvailable: boolean;
  isBiometricEnabled: boolean;
  biometricType: 'fingerprint' | 'facial' | null;
  isLocked: boolean;
  loading: boolean;
  setBiometricEnabled: (enabled: boolean) => Promise<boolean>;
  unlockWithBiometric: () => Promise<boolean>;
}

const BiometricContext = createContext<BiometricContextType>({
  isBiometricAvailable: false,
  isBiometricEnabled: false,
  biometricType: null,
  isLocked: false,
  loading: true,
  setBiometricEnabled: async () => false,
  unlockWithBiometric: async () => false,
});

const BIOMETRIC_STORAGE_KEY = 'biometric_enabled';

export function BiometricProvider({ children }: { children: React.ReactNode }) {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'facial' | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const enabledRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const available = hasHardware && isEnrolled;
        setIsBiometricAvailable(available);

        if (available) {
          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
            setBiometricType('facial');
          } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
            setBiometricType('fingerprint');
          }
        }

        const stored = await AsyncStorage.getItem(BIOMETRIC_STORAGE_KEY);
        const enabled = stored === 'true';
        setIsBiometricEnabled(enabled);
        enabledRef.current = enabled;

        if (enabled && available) {
          setIsLocked(true);
        }
      } catch {
        // If anything fails, just don't enable biometric
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Re-lock on app background
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background' && enabledRef.current) {
        setIsLocked(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  const setBiometricEnabledFn = useCallback(async (enabled: boolean): Promise<boolean> => {
    if (enabled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify to enable biometric login',
        cancelLabel: 'Cancel',
      });
      if (!result.success) return false;
      await AsyncStorage.setItem(BIOMETRIC_STORAGE_KEY, 'true');
      setIsBiometricEnabled(true);
      enabledRef.current = true;
      return true;
    } else {
      await AsyncStorage.removeItem(BIOMETRIC_STORAGE_KEY);
      setIsBiometricEnabled(false);
      enabledRef.current = false;
      setIsLocked(false);
      return true;
    }
  }, []);

  const unlockWithBiometric = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Money Trackr',
      cancelLabel: 'Cancel',
    });
    if (result.success) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, []);

  const value = useMemo(() => ({
    isBiometricAvailable,
    isBiometricEnabled,
    biometricType,
    isLocked,
    loading,
    setBiometricEnabled: setBiometricEnabledFn,
    unlockWithBiometric,
  }), [isBiometricAvailable, isBiometricEnabled, biometricType, isLocked, loading, setBiometricEnabledFn, unlockWithBiometric]);

  return (
    <BiometricContext.Provider value={value}>
      {children}
    </BiometricContext.Provider>
  );
}

export const useBiometric = () => useContext(BiometricContext);
