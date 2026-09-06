import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { Redirect, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { fontSize, fontWeight, lineHeight } from '../../src/theme/typography';

export default function LoginScreen() {
  const { signIn, isAuthenticated, loading, error } = useAuth();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const s = styles(colors);

  useEffect(() => {
    if (error) Alert.alert(t('auth.sign_in_error'), error);
  }, [error]);

  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <View style={s.container}>
      <View style={s.hero}>
        <View style={s.logoContainer}>
          <Feather name="trending-up" size={40} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no" />
        </View>
        <Text style={s.appName}>{t('auth.app_name')}</Text>
        <Text style={s.tagline}>{t('auth.tagline')}</Text>

        <View style={s.featureList}>
          {[
            { icon: 'bar-chart-2', text: t('auth.feature_track') },
            { icon: 'pie-chart', text: t('auth.feature_visual') },
            { icon: 'repeat', text: t('auth.feature_lending') },
            { icon: 'bell', text: t('auth.feature_budget') },
          ].map(({ icon, text }) => (
            <View key={text} style={s.featureRow}>
              <View style={s.featureIcon} accessibilityElementsHidden importantForAccessibility="no">
                <Feather name={icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={s.featureText}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.welcomeTitle}>{t('auth.welcome_back')}</Text>
        <Text style={s.welcomeSubtitle}>{t('auth.sign_in_subtitle')}</Text>

        <TouchableOpacity
          style={s.googleButton}
          onPress={signIn}
          disabled={loading}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={loading ? t('a11y.signing_in') : t('auth.continue_google')}
          accessibilityState={{ disabled: loading, busy: loading }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.textPrimary} />
          ) : (
            <>
              <Text style={s.googleIcon}>G</Text>
              <Text style={s.googleButtonText}>{t('auth.continue_google')}</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={s.terms}>{t('auth.terms')}</Text>

        <View style={s.langRow}>
          {supportedLanguages.map(({ code, label }) => (
            <TouchableOpacity
              key={code}
              style={[s.langBtn, { borderColor: language === code ? colors.primary : colors.borderColor, backgroundColor: language === code ? `${colors.primary}15` : colors.bgTertiary }]}
              onPress={() => setLanguage(code)}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.language_option', { name: label })}
              accessibilityState={{ selected: language === code }}
            >
              <Text style={[s.langBtnText, { color: language === code ? colors.primary : colors.textMuted }]}>{label}</Text>
              {language === code && <Feather name="check" size={13} color={colors.primary} />}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={s.guideLinkRow}
          onPress={() => router.push('/guide')}
          accessibilityRole="button"
          accessibilityLabel={t('settings.usage_guide')}
          accessibilityHint={t('settings.usage_guide_subtitle')}
        >
          <Feather name="book-open" size={15} color={colors.primary} />
          <Text style={[s.guideLinkText, { color: colors.primary }]}>{t('settings.usage_guide')}</Text>
          <Feather name="chevron-right" size={15} color={colors.primary} />
        </TouchableOpacity>
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
      fontSize: fontSize.display,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: 6,
    },
    tagline: {
      fontSize: fontSize.body,
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
      fontSize: fontSize.body,
      color: colors.textSecondary,
      fontWeight: fontWeight.medium,
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
      fontSize: fontSize.title,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      marginBottom: 6,
    },
    welcomeSubtitle: {
      fontSize: fontSize.body,
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
      fontSize: fontSize.emphasis,
      fontWeight: fontWeight.bold,
      color: colors.primary,
    },
    googleButtonText: {
      fontSize: fontSize.emphasis,
      fontWeight: fontWeight.semibold,
      color: colors.textPrimary,
    },
    terms: {
      fontSize: fontSize.meta,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: lineHeight.meta,
    },
    langRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 16,
    },
    langBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 10,
      borderWidth: 1.5,
      paddingVertical: 10,
    },
    langBtnText: {
      fontSize: fontSize.meta,
      fontWeight: fontWeight.semibold,
    },
    guideLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 14,
    },
    guideLinkText: {
      fontSize: fontSize.meta,
      fontWeight: fontWeight.semibold,
    },
  });
