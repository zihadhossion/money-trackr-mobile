import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/contexts/ThemeContext';
import { screenStyles } from '../src/theme/screenStyles';
import type { Colors } from '../src/theme/colors';

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
    icon: 'file-text',
    titleKey: 'guide.notes_title',
    descKey: 'guide.notes_desc',
    tips: ['guide.notes_tip1', 'guide.notes_tip2'],
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
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = useMemo(() => styles(colors), [colors]);

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={[ss.header, { paddingBottom: 12 }]}>
        <View style={ss.headerLeft}>
          <TouchableOpacity
            style={ss.backBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.back')}
          >
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[ss.title, { color: colors.textPrimary }]}>{t('guide.title')}</Text>
        </View>
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

const styles = (colors: Colors) => StyleSheet.create({
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
