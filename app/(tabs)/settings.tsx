import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { useCurrency } from '../../src/contexts/CurrencyContext';
import { settingsService } from '../../src/services/settingsService';
import { userService } from '../../src/services/userService';
import type { Settings } from '../../src/types';
import { getErrorMessage } from '../../src/utils/error';
import { getCurrencySymbol } from '../../src/utils/currency';

/**
 * Falls back to the user's initials rather than a generic person icon, which
 * looks identical for everyone and reads as an empty slot rather than as them.
 */
function getInitials(name?: string) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { user, signOut, updateUser } = useAuth();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const { setCurrency, supportedCurrencies } = useCurrency();
  const { t } = useTranslation();
  const s = useMemo(() => styles(colors), [colors]);

  const [settings, setSettings] = useState<Settings>({ currency: 'BDT', monthlyBudget: 0 });
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const currencySheetRef = useRef<BottomSheet>(null);

  const selectedCurrency = supportedCurrencies.find((c) => c.code === settings.currency);
  const initials = getInitials(user?.displayName);

  const openCurrencySheet = useCallback(() => currencySheetRef.current?.expand(), []);
  const pickCurrency = useCallback((code: string) => {
    setSettings((prev) => ({ ...prev, currency: code }));
    currencySheetRef.current?.close();
  }, []);

  useEffect(() => {
    settingsService.get().then((data) => {
      setSettings(data);
      setBudget(data.monthlyBudget?.toString() ?? '');
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await settingsService.update({
        currency: settings.currency,
        monthlyBudget: Number(budget) || 0,
      });
      setSettings(updated);
      // Only after the API accepts it does every other screen switch over.
      await setCurrency(updated.currency);
      Alert.alert(t('common.success'), t('settings.settings_saved'));
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e, t('settings.failed_save')));
    } finally {
      setSaving(false);
    }
  };

  const uploadPhoto = async (uri: string) => {
    setUploadingPhoto(true);
    try {
      const { photoURL } = await userService.uploadProfileImage(uri);
      await updateUser({ photoURL });
      Alert.alert(t('common.success'), t('settings.photo_updated'));
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e, t('settings.failed_photo')));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const takePhoto = async () => {
    // Only the camera needs asking for: the gallery goes through the system
    // photo picker, which hands back one image without any grant of its own.
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert(t('settings.permission_needed'), t('settings.camera_permission'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) await uploadPhoto(result.assets[0].uri);
  };

  const chooseFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      // Left uncompressed on purpose — userService resizes and re-encodes it
      // once, and compressing twice only costs quality.
      quality: 1,
    });
    if (!result.canceled) await uploadPhoto(result.assets[0].uri);
  };

  const handleChangePhoto = () => {
    if (uploadingPhoto) return;
    Alert.alert(t('settings.profile_photo'), t('settings.change_photo'), [
      { text: t('settings.take_photo'), onPress: takePhoto },
      { text: t('settings.choose_from_gallery'), onPress: chooseFromGallery },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handleSignOut = () => {
    Alert.alert(t('settings.sign_out_title'), t('settings.sign_out_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('settings.sign_out'), style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.bgSecondary }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgSecondary }]}>
      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={[s.pageTitle, { color: colors.textPrimary }]}>{t('settings.title')}</Text>

        {/* Profile card */}
        <View style={[s.card, s.profileCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <TouchableOpacity
            style={[s.avatar, { backgroundColor: `${colors.primary}20` }]}
            onPress={handleChangePhoto}
            disabled={uploadingPhoto}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.change_profile_photo')}
            accessibilityState={{ disabled: uploadingPhoto, busy: uploadingPhoto }}
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={s.avatarImage} />
            ) : initials ? (
              <Text style={[s.avatarInitials, { color: colors.primary }]}>{initials}</Text>
            ) : (
              <Feather name="user" size={28} color={colors.primary} />
            )}
            {uploadingPhoto ? (
              <View style={[s.avatarOverlay, { backgroundColor: `${colors.bgPrimary}cc` }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <View style={[s.avatarBadge, { backgroundColor: colors.primary, borderColor: colors.bgPrimary }]}>
                <Feather name="camera" size={11} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <View style={s.profileInfo}>
            <Text style={[s.profileName, { color: colors.textPrimary }]} numberOfLines={1}>
              {user?.displayName}
            </Text>
            <Text style={[s.profileEmail, { color: colors.textMuted }]} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Theme */}
        <View style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>{t('settings.appearance')}</Text>
          <View style={s.themeRow}>
            <TouchableOpacity
              style={[s.themeBtn, { borderColor: theme === 'light' ? colors.primary : colors.borderColor, backgroundColor: theme === 'light' ? `${colors.primary}15` : colors.bgTertiary }]}
              onPress={() => setTheme('light')}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.theme_option', { name: t('settings.light') })}
              accessibilityState={{ selected: theme === 'light' }}
            >
              <Feather name="sun" size={20} color={theme === 'light' ? colors.primary : colors.textMuted} />
              <Text style={[s.themeBtnText, { color: theme === 'light' ? colors.primary : colors.textMuted }]}>{t('settings.light')}</Text>
              {theme === 'light' && <Feather name="check" size={14} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.themeBtn, { borderColor: theme === 'dark' ? colors.primary : colors.borderColor, backgroundColor: theme === 'dark' ? `${colors.primary}15` : colors.bgTertiary }]}
              onPress={() => setTheme('dark')}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.theme_option', { name: t('settings.dark') })}
              accessibilityState={{ selected: theme === 'dark' }}
            >
              <Feather name="moon" size={20} color={theme === 'dark' ? colors.primary : colors.textMuted} />
              <Text style={[s.themeBtnText, { color: theme === 'dark' ? colors.primary : colors.textMuted }]}>{t('settings.dark')}</Text>
              {theme === 'dark' && <Feather name="check" size={14} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Language */}
        <View style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>{t('settings.language')}</Text>
          <View style={s.themeRow}>
            {supportedLanguages.map(({ code, label }) => (
              <TouchableOpacity
                key={code}
                style={[s.themeBtn, { borderColor: language === code ? colors.primary : colors.borderColor, backgroundColor: language === code ? `${colors.primary}15` : colors.bgTertiary }]}
                onPress={() => setLanguage(code)}
                accessibilityRole="button"
                accessibilityLabel={t('a11y.language_option', { name: label })}
                accessibilityState={{ selected: language === code }}
              >
                <Text style={[s.themeBtnText, { color: language === code ? colors.primary : colors.textMuted }]}>{label}</Text>
                {language === code && <Feather name="check" size={14} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget & currency */}
        <View style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>{t('settings.financial')}</Text>

          <Text style={[s.label, { color: colors.textSecondary }]}>{t('settings.currency')}</Text>
          <Text style={[s.hint, { color: colors.textMuted }]}>{t('settings.currency_hint')}</Text>
          <TouchableOpacity
            style={[s.select, { backgroundColor: colors.bgTertiary, borderColor: colors.borderColor }]}
            onPress={openCurrencySheet}
            accessibilityRole="button"
            accessibilityLabel={selectedCurrency?.label ?? settings.currency}
            accessibilityHint={t('settings.currency_hint')}
          >
            <Text style={[s.currencyText, { color: colors.textPrimary }]}>
              {selectedCurrency ? `${selectedCurrency.symbol}  ${selectedCurrency.label}` : settings.currency}
            </Text>
            <Feather name="chevron-down" size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <Text style={[s.label, { color: colors.textSecondary }]}>{t('settings.monthly_budget')}</Text>
          <View style={[s.inputRow, { backgroundColor: colors.bgTertiary, borderColor: colors.borderColor }]}>
            <Text style={[s.symbol, { color: colors.textMuted }]}>{getCurrencySymbol(settings.currency)}</Text>
            <TextInput
              style={[s.input, { color: colors.textPrimary }]}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              accessibilityLabel={t('a11y.budget_input')}
            />
          </View>

          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSave}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel={t('settings.save_settings')}
            accessibilityState={{ disabled: saving, busy: saving }}
          >
            <Text style={s.saveBtnText}>{saving ? t('common.saving') : t('settings.save_settings')}</Text>
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <TouchableOpacity
          style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => router.push('/notes')}
          accessibilityRole="button"
          accessibilityLabel={t('settings.notes')}
          accessibilityHint={t('settings.notes_subtitle')}
        >
          <View style={[s.guideIconBox, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="file-text" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>{t('settings.notes')}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('settings.notes_subtitle')}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Categories */}
        <TouchableOpacity
          style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => router.push('/categories')}
          accessibilityRole="button"
          accessibilityLabel={t('settings.categories')}
          accessibilityHint={t('settings.categories_subtitle')}
        >
          <View style={[s.guideIconBox, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="grid" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>{t('settings.categories')}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('settings.categories_subtitle')}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Usage Guide */}
        <TouchableOpacity
          style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => router.push('/guide')}
          accessibilityRole="button"
          accessibilityLabel={t('settings.usage_guide')}
          accessibilityHint={t('settings.usage_guide_subtitle')}
        >
          <View style={[s.guideIconBox, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="book-open" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary, marginBottom: 0 }]}>{t('settings.usage_guide')}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{t('settings.usage_guide_subtitle')}</Text>
          </View>
          <Feather name="chevron-right" size={20} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Sign out */}
        <TouchableOpacity
          style={[s.signOutBtn, { borderColor: colors.danger }]}
          onPress={handleSignOut}
          accessibilityRole="button"
          accessibilityLabel={t('settings.sign_out')}
          accessibilityHint={t('settings.sign_out_message')}
        >
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={[s.signOutText, { color: colors.danger }]}>{t('settings.sign_out')}</Text>
        </TouchableOpacity>

        <Text style={[s.version, { color: colors.textMuted }]}>{t('common.version')}</Text>
      </ScrollView>

      <BottomSheet
        ref={currencySheetRef}
        index={-1}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.bgPrimary }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}
      >
        <BottomSheetView style={s.sheet}>
          <Text style={[s.sheetTitle, { color: colors.textPrimary }]}>{t('settings.select_currency')}</Text>
          {supportedCurrencies.map(({ code, symbol: sym, label }) => {
            const selected = settings.currency === code;
            return (
              <TouchableOpacity
                key={code}
                style={[s.sheetRow, { backgroundColor: selected ? `${colors.primary}15` : 'transparent' }]}
                onPress={() => pickCurrency(code)}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ selected }}
              >
                <Text style={[s.currencySymbolBadge, { color: selected ? colors.primary : colors.textMuted }]}>{sym}</Text>
                <Text style={[s.currencyText, { flex: 1, color: selected ? colors.primary : colors.textPrimary }]}>{label}</Text>
                {selected && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = (colors: any) => StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 60, gap: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700' },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  avatarOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: 20, fontWeight: '700', letterSpacing: 0.5 },
  // Kept flush with the avatar's edge rather than overhanging it: Android
  // clips children that fall outside their parent's bounds, which would eat
  // part of the badge and the taps that land on it.
  avatarBadge: { position: 'absolute', right: 0, bottom: 0, width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  profileCard: { flexDirection: 'row', alignItems: 'center' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '700' },
  profileEmail: { fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  themeRow: { flexDirection: 'row', gap: 12 },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1.5, padding: 12 },
  themeBtnText: { flex: 1, fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  hint: { fontSize: 12, marginTop: -8, marginBottom: 4 },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 10, padding: 12 },
  // The sheet sizes itself to this view and the tab bar (60px, drawn by the
  // navigator outside this screen) overlays its bottom edge, so the last row
  // needs to clear both that and the gesture bar.
  sheet: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 84, gap: 4 },
  sheetTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 14 },
  currencySymbolBadge: { fontSize: 16, fontWeight: '700', width: 20, textAlign: 'center' },
  currencyText: { fontSize: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12 },
  symbol: { fontSize: 18, marginRight: 8 },
  input: { flex: 1, fontSize: 16, paddingVertical: 12 },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  guideIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, borderWidth: 1.5, paddingVertical: 14 },
  signOutText: { fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12 },
});
