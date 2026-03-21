import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useBiometric } from '../../contexts/BiometricContext';

export default function BiometricLockScreen() {
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const { unlockWithBiometric, biometricType } = useBiometric();
  const s = styles(colors);

  useEffect(() => {
    unlockWithBiometric();
  }, []);

  const iconName = biometricType === 'facial' ? 'eye' : 'lock';
  const label = biometricType === 'facial' ? 'Use Face ID' : 'Use Fingerprint';

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.iconContainer}>
          <Feather name={iconName} size={48} color={colors.primary} />
        </View>
        <Text style={s.title}>Unlock Money Trackr</Text>
        <Text style={s.subtitle}>Authenticate to access your finances</Text>

        <TouchableOpacity style={s.unlockButton} onPress={unlockWithBiometric} activeOpacity={0.85}>
          <Feather name={iconName} size={20} color="#fff" />
          <Text style={s.unlockButtonText}>{label}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.signOutLink} onPress={signOut}>
        <Feather name="log-out" size={16} color={colors.danger} />
        <Text style={s.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgSecondary,
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 28,
      backgroundColor: `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 40,
      textAlign: 'center',
    },
    unlockButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 32,
    },
    unlockButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#fff',
    },
    signOutLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
    },
    signOutText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.danger,
    },
  });
