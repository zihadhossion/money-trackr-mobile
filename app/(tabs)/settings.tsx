import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import { useBiometric } from '../../src/contexts/BiometricContext';
import { settingsService } from '../../src/services/settingsService';
import type { Settings } from '../../src/types';

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { isBiometricAvailable, isBiometricEnabled, setBiometricEnabled, biometricType } = useBiometric();
  const s = styles(colors);

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
      Alert.alert('Success', 'Settings saved successfully');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBiometric = async (value: boolean) => {
    const success = await setBiometricEnabled(value);
    if (!success && value) {
      Alert.alert('Biometric Setup Failed', 'Could not verify your biometric. Please try again.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
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
        <Text style={[s.pageTitle, { color: colors.textPrimary }]}>Settings</Text>

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
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Appearance</Text>
          <View style={s.themeRow}>
            <TouchableOpacity
              style={[s.themeBtn, { borderColor: theme === 'light' ? colors.primary : colors.borderColor, backgroundColor: theme === 'light' ? `${colors.primary}15` : colors.bgTertiary }]}
              onPress={() => setTheme('light')}
            >
              <Feather name="sun" size={20} color={theme === 'light' ? colors.primary : colors.textMuted} />
              <Text style={[s.themeBtnText, { color: theme === 'light' ? colors.primary : colors.textMuted }]}>Light</Text>
              {theme === 'light' && <Feather name="check" size={14} color={colors.primary} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.themeBtn, { borderColor: theme === 'dark' ? colors.primary : colors.borderColor, backgroundColor: theme === 'dark' ? `${colors.primary}15` : colors.bgTertiary }]}
              onPress={() => setTheme('dark')}
            >
              <Feather name="moon" size={20} color={theme === 'dark' ? colors.primary : colors.textMuted} />
              <Text style={[s.themeBtnText, { color: theme === 'dark' ? colors.primary : colors.textMuted }]}>Dark</Text>
              {theme === 'dark' && <Feather name="check" size={14} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Security */}
        {isBiometricAvailable && (
          <View style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
            <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Security</Text>
            <View style={s.settingRow}>
              <View style={s.settingLeft}>
                <View style={[s.settingIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <Feather name={biometricType === 'facial' ? 'eye' : 'lock'} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.settingLabel, { color: colors.textPrimary }]}>Biometric Login</Text>
                  <Text style={[s.settingSubtitle, { color: colors.textMuted }]}>
                    {biometricType === 'facial' ? 'Use Face ID to unlock' : 'Use fingerprint to unlock'}
                  </Text>
                </View>
              </View>
              <Switch
                value={isBiometricEnabled}
                onValueChange={handleToggleBiometric}
                trackColor={{ false: colors.borderColor, true: `${colors.primary}50` }}
                thumbColor={isBiometricEnabled ? colors.primary : colors.textMuted}
              />
            </View>
          </View>
        )}

        {/* Budget & currency */}
        <View style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>Financial Settings</Text>

          <Text style={[s.label, { color: colors.textSecondary }]}>Currency</Text>
          <View style={[s.currencyDisplay, { backgroundColor: colors.bgTertiary, borderColor: colors.borderColor }]}>
            <Text style={[s.currencyText, { color: colors.textPrimary }]}>BDT (৳ Bangladeshi Taka)</Text>
          </View>

          <Text style={[s.label, { color: colors.textSecondary }]}>Monthly Budget</Text>
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
            <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Settings'}</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={[s.signOutBtn, { borderColor: '#ef4444' }]} onPress={handleSignOut}>
          <Feather name="log-out" size={18} color="#ef4444" />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[s.version, { color: colors.textMuted }]}>Money Trackr v1.0.0</Text>
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
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
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
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, borderWidth: 1.5, paddingVertical: 14 },
  signOutText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12 },
});
