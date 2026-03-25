import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useLanguage } from '../../src/contexts/LanguageContext';
import { settingsService } from '../../src/services/settingsService';
import type { Settings } from '../../src/types';

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const { t } = useTranslation();
  const s = useMemo(() => styles(colors), [colors]);

  const [settings, setSettings] = useState<Settings>({ currency: 'BDT', monthlyBudget: 0 });
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      Alert.alert(t('common.success'), t('settings.settings_saved'));
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || t('settings.failed_save'));
    } finally {
      setSaving(false);
    }
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
        <View style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <View style={[s.avatar, { backgroundColor: `${colors.primary}20` }]}>
            <Feather name="user" size={28} color={colors.primary} />
          </View>
          <View style={s.profileInfo}>
            <Text style={[s.profileName, { color: colors.textPrimary }]}>{user?.displayName}</Text>
            <Text style={[s.profileEmail, { color: colors.textMuted }]}>{user?.email}</Text>
          </View>
        </View>

        {/* Theme */}
        <View style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>{t('settings.appearance')}</Text>
          <View style={s.themeRow}>
            <TouchableOpacity
              style={[s.themeBtn, { borderColor: theme === 'light' ? colors.primary : colors.borderColor, backgroundColor: theme === 'light' ? `${colors.primary}15` : colors.bgTertiary }]}
              onPress={() => setTheme('light')}
            >
              <Feather name="sun" size={20} color={theme === 'light' ? colors.primary : colors.textMuted} />
              <Text style={[s.themeBtnText, { color: theme === 'light' ? colors.primary : colors.textMuted }]}>{t('settings.light')}</Text>
              {theme === 'light' && <Feather name="check" size={14} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.themeBtn, { borderColor: theme === 'dark' ? colors.primary : colors.borderColor, backgroundColor: theme === 'dark' ? `${colors.primary}15` : colors.bgTertiary }]}
              onPress={() => setTheme('dark')}
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
          <View style={[s.currencyDisplay, { backgroundColor: colors.bgTertiary, borderColor: colors.borderColor }]}>
            <Text style={[s.currencyText, { color: colors.textPrimary }]}>BDT (৳ Bangladeshi Taka)</Text>
          </View>

          <Text style={[s.label, { color: colors.textSecondary }]}>{t('settings.monthly_budget')}</Text>
          <View style={[s.inputRow, { backgroundColor: colors.bgTertiary, borderColor: colors.borderColor }]}>
            <Text style={[s.symbol, { color: colors.textMuted }]}>৳</Text>
            <TextInput
              style={[s.input, { color: colors.textPrimary }]}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <TouchableOpacity style={[s.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave} disabled={saving}>
            <Text style={s.saveBtnText}>{saving ? t('common.saving') : t('settings.save_settings')}</Text>
          </TouchableOpacity>
        </View>

        {/* Usage Guide */}
        <TouchableOpacity
          style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor, flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => router.push('/guide')}
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
        <TouchableOpacity style={[s.signOutBtn, { borderColor: colors.danger }]} onPress={handleSignOut}>
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={[s.signOutText, { color: colors.danger }]}>{t('settings.sign_out')}</Text>
        </TouchableOpacity>

        <Text style={[s.version, { color: colors.textMuted }]}>{t('common.version')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: any) => StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 60, gap: 16 },
  pageTitle: { fontSize: 22, fontWeight: '700' },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: 17, fontWeight: '700' },
  profileEmail: { fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  themeRow: { flexDirection: 'row', gap: 12 },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1.5, padding: 12 },
  themeBtnText: { flex: 1, fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  currencyDisplay: { borderRadius: 10, borderWidth: 1, padding: 12 },
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
