import { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import GoogleIcon from '../../src/components/ui/GoogleIcon';
import { fontSize, fontWeight, lineHeight } from '../../src/theme/typography';

// The same indigo→violet sweep as the app icon, so splash → login reads as one surface.
const HERO_GRADIENT = {
  light: ['#4f46e5', '#6366f1', '#8b5cf6'],
  dark: ['#312e81', '#4338ca', '#6d28d9'],
} as const;

// Google's sign-in button spec: neutral surface, never the app's brand colour.
const GOOGLE_BUTTON = {
  light: { bg: '#ffffff', border: '#dadce0', text: '#1f1f1f' },
  dark: { bg: '#131314', border: '#8e918f', text: '#e3e3e3' },
} as const;

const SHEET_OVERLAP = 28;

export default function LoginScreen() {
  const { signIn, isAuthenticated, loading, error } = useAuth();
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const insets = useSafeAreaInsets();
  // Guide is pushed over this screen; a mounted light StatusBar would leave it
  // with white icons on a white header.
  const isFocused = useIsFocused();
  const s = styles(colors);
  const google = GOOGLE_BUTTON[isDark ? 'dark' : 'light'];

  useEffect(() => {
    if (error) Alert.alert(t('auth.sign_in_error'), error);
  }, [error]);

  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <View style={s.container}>
      {isFocused && <StatusBar style="light" />}
      <ScrollView contentContainerStyle={s.scroll} bounces={false} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={HERO_GRADIENT[isDark ? 'dark' : 'light']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: insets.top + 12 }]}
        >
          <View style={s.langPill}>
            {supportedLanguages.map(({ code, label }) => {
              const selected = language === code;
              return (
                <TouchableOpacity
                  key={code}
                  style={[s.langOption, selected && s.langOptionSelected]}
                  onPress={() => setLanguage(code)}
                  hitSlop={{ top: 6, bottom: 6 }}
                  accessibilityRole="button"
                  accessibilityLabel={t('a11y.language_option', { name: label })}
                  accessibilityState={{ selected }}
                >
                  <Text style={[s.langText, { color: selected ? colors.primary : colors.white }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.heroBody}>
            <Image
              source={require('../../assets/icon.png')}
              style={s.logo}
              accessibilityElementsHidden
              importantForAccessibility="no"
            />
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
                    <Feather name={icon as any} size={16} color={colors.white} />
                  </View>
                  <Text style={s.featureText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        <View style={[s.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={s.welcomeTitle}>{t('auth.welcome_back')}</Text>
          <Text style={s.welcomeSubtitle}>{t('auth.sign_in_subtitle')}</Text>

          <TouchableOpacity
            style={[s.googleButton, { backgroundColor: google.bg, borderColor: google.border }]}
            onPress={signIn}
            disabled={loading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={loading ? t('a11y.signing_in') : t('auth.continue_google')}
            accessibilityState={{ disabled: loading, busy: loading }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={google.text} />
            ) : (
              <>
                <GoogleIcon size={20} />
                <Text style={[s.googleButtonText, { color: google.text }]}>{t('auth.continue_google')}</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={s.terms}>{t('auth.terms')}</Text>

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
      </ScrollView>
    </View>
  );
}

const styles = (colors: ReturnType<typeof import('../../src/contexts/ThemeContext').useTheme>['colors']) =>
  StyleSheet.create({
    // The sheet's colour, so any space below the sheet never flashes the gradient.
    container: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    scroll: {
      flexGrow: 1,
    },
    // flexGrow lets the hero take up spare height on tall phones; on short ones
    // it shrinks to its content and the whole screen scrolls instead.
    hero: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingBottom: SHEET_OVERLAP + 32,
    },
    langPill: {
      alignSelf: 'flex-end',
      flexDirection: 'row',
      padding: 3,
      borderRadius: 999,
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    langOption: {
      paddingVertical: 6,
      paddingHorizontal: 14,
      borderRadius: 999,
    },
    langOptionSelected: {
      backgroundColor: colors.white,
    },
    langText: {
      fontSize: fontSize.meta,
      fontWeight: fontWeight.semibold,
    },
    heroBody: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 24,
    },
    logo: {
      width: 88,
      height: 88,
      borderRadius: 24,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.35)',
      marginBottom: 16,
    },
    appName: {
      fontSize: fontSize.display,
      fontWeight: fontWeight.bold,
      color: colors.white,
      marginBottom: 6,
      textAlign: 'center',
    },
    tagline: {
      fontSize: fontSize.body,
      lineHeight: lineHeight.body,
      color: 'rgba(255, 255, 255, 0.85)',
      marginBottom: 28,
      textAlign: 'center',
    },
    // Centred as a block, left-aligned inside — icons stay in one column.
    featureList: {
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
      backgroundColor: 'rgba(255, 255, 255, 0.18)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    featureText: {
      flexShrink: 1,
      fontSize: fontSize.body,
      fontWeight: fontWeight.medium,
      color: colors.white,
    },
    sheet: {
      marginTop: -SHEET_OVERLAP,
      backgroundColor: colors.bgPrimary,
      borderTopLeftRadius: SHEET_OVERLAP,
      borderTopRightRadius: SHEET_OVERLAP,
      paddingTop: 28,
      paddingHorizontal: 24,
    },
    welcomeTitle: {
      fontSize: fontSize.title,
      fontWeight: fontWeight.bold,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 6,
    },
    welcomeSubtitle: {
      fontSize: fontSize.body,
      lineHeight: lineHeight.body,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 24,
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      minHeight: 52,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    googleButtonText: {
      fontSize: fontSize.emphasis,
      fontWeight: fontWeight.semibold,
    },
    terms: {
      fontSize: fontSize.meta,
      lineHeight: lineHeight.meta,
      color: colors.textMuted,
      textAlign: 'center',
      paddingHorizontal: 8,
    },
    guideLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      gap: 6,
      minHeight: 44,
      paddingHorizontal: 12,
      marginTop: 16,
    },
    guideLinkText: {
      fontSize: fontSize.meta,
      fontWeight: fontWeight.semibold,
    },
  });
