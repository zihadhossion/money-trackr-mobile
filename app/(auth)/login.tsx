import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Redirect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function LoginScreen() {
  const { signIn, isAuthenticated, loading, error } = useAuth();
  const { colors } = useTheme();
  const s = styles(colors);

  useEffect(() => {
    if (error) Alert.alert('Sign In Error', error);
  }, [error]);

  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <View style={s.container}>
      <View style={s.hero}>
        <View style={s.logoContainer}>
          <Feather name="trending-up" size={40} color={colors.primary} />
        </View>
        <Text style={s.appName}>Money Trackr</Text>
        <Text style={s.tagline}>Your intelligent finance companion</Text>

        <View style={s.featureList}>
          {[
            { icon: 'bar-chart-2', text: 'Track income & expenses' },
            { icon: 'pie-chart', text: 'Visual spending insights' },
            { icon: 'repeat', text: 'Manage lending & borrowing' },
            { icon: 'bell', text: 'Budget alerts & analytics' },
          ].map(({ icon, text }) => (
            <View key={text} style={s.featureRow}>
              <View style={s.featureIcon}>
                <Feather name={icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={s.featureText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.welcomeTitle}>Welcome back</Text>
        <Text style={s.welcomeSubtitle}>Sign in to access your financial dashboard</Text>

        <TouchableOpacity
          style={s.googleButton}
          onPress={signIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <>
              <Text style={s.googleIcon}>G</Text>
              <Text style={s.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={s.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = (colors: ReturnType<typeof import('../../src/contexts/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgSecondary,
      justifyContent: 'space-between',
      paddingTop: 60,
      paddingBottom: 40,
      paddingHorizontal: 24,
    },
    hero: {
      alignItems: 'center',
      paddingTop: 20,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: colors.bgPrimary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
      elevation: 4,
    },
    appName: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    tagline: {
      fontSize: 15,
      color: colors.textMuted,
      marginBottom: 32,
      textAlign: 'center',
    },
    featureList: {
      width: '100%',
      gap: 12,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    featureIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: `${colors.primary}15`,
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      fontSize: 15,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    card: {
      backgroundColor: colors.bgPrimary,
      borderRadius: 20,
      padding: 28,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 4,
    },
    welcomeTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    welcomeSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 24,
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      backgroundColor: colors.bgTertiary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderWidth: 1,
      borderColor: colors.borderColor,
      marginBottom: 16,
    },
    googleIcon: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.primary,
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    terms: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 18,
    },
  });
