import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/contexts/ThemeContext';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

const SECTIONS: { icon: FeatherIconName; titleKey: string; descKey: string; tips: string[] }[] = [
  {
    icon: 'log-in',
    titleKey: 'guide.start_title',
    descKey: 'guide.start_desc',
    tips: ['guide.start_tip1'],
  },
  {
    icon: 'home',
    titleKey: 'guide.dashboard_title',
    descKey: 'guide.dashboard_desc',
    tips: ['guide.dashboard_tip1', 'guide.dashboard_tip2'],
  },
  {
    icon: 'trending-up',
    titleKey: 'guide.income_title',
    descKey: 'guide.income_desc',
    tips: ['guide.income_tip1', 'guide.income_tip2'],
  },
  {
    icon: 'trending-down',
    titleKey: 'guide.expenses_title',
    descKey: 'guide.expenses_desc',
    tips: ['guide.expenses_tip1', 'guide.expenses_tip2'],
  },
  {
    icon: 'repeat',
    titleKey: 'guide.lending_title',
    descKey: 'guide.lending_desc',
    tips: ['guide.lending_tip1', 'guide.lending_tip2', 'guide.lending_tip3'],
  },
  {
    icon: 'grid',
    titleKey: 'guide.categories_title',
    descKey: 'guide.categories_desc',
    tips: ['guide.categories_tip1', 'guide.categories_tip2'],
  },
  {
    icon: 'settings',
    titleKey: 'guide.settings_title',
    descKey: 'guide.settings_desc',
    tips: ['guide.settings_tip1', 'guide.settings_tip2', 'guide.settings_tip3'],
  },
];

export default function GuideScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => styles(colors), [colors]);

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={[s.header, { backgroundColor: colors.bgSecondary }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.pageTitle, { color: colors.textPrimary }]}>{t('guide.title')}</Text>
        <View style={s.backBtn} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {SECTIONS.map((section) => (
          <View
            key={section.titleKey}
            style={[s.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}
          >
            <View style={s.sectionHeader}>
              <View style={[s.iconBox, { backgroundColor: `${colors.primary}20` }]}>
                <Feather name={section.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[s.sectionTitle, { color: colors.textPrimary }]}>{t(section.titleKey as any)}</Text>
            </View>

            <Text style={[s.desc, { color: colors.textSecondary }]}>{t(section.descKey as any)}</Text>

            {section.tips.map((tipKey) => (
              <View key={tipKey} style={s.tipRow}>
                <Text style={[s.bullet, { color: colors.primary }]}>•</Text>
                <Text style={[s.tipText, { color: colors.textSecondary }]}>{t(tipKey as any)}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: any) => StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  scroll: { padding: 16, paddingBottom: 60, gap: 12 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 14, lineHeight: 20 },
  tipRow: { flexDirection: 'row', gap: 8 },
  bullet: { fontSize: 16, lineHeight: 20, fontWeight: '700' },
  tipText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
