import React, { forwardRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import type { Colors } from '../../theme/colors';

interface FilterSheetProps {
  children: React.ReactNode;
  onReset: () => void;
  onApply: () => void;
  /** Fired for a swipe-down dismiss too, not just Apply — otherwise the
   *  screen keeps counting results for a sheet nobody is looking at. */
  onClose: () => void;
  /** Rows the pending selection would show; undefined while it is being
   *  counted, so the button says "Apply" rather than a stale number. */
  resultCount?: number;
}

export function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 10, marginBottom: 20 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', color: colors.textMuted }}>
        {title}
      </Text>
      {children}
    </View>
  );
}

/**
 * Filters live in a sheet rather than on the screen: the list keeps its own
 * height, and the selections are applied in one go.
 *
 * Nothing here refetches as the user taps — every list on these screens is
 * server-paginated, so live filtering would fire a request per tap and shuffle
 * the rows underneath. The chips outside the sheet stay instant: removing one
 * is a single, deliberate act.
 */
const FilterSheet = forwardRef<BottomSheet, FilterSheetProps>(function FilterSheet(
  { children, onReset, onApply, onClose, resultCount }, ref,
) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => styles(colors), [colors]);
  const snapPoints = useMemo(() => ['75%'], []);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onChange={(index) => { if (index === -1) onClose(); }}
      backgroundStyle={{ backgroundColor: colors.bgPrimary }}
      handleIndicatorStyle={{ backgroundColor: colors.borderColor }}
    >
      <View style={s.header}>
        <Text style={s.title}>{t('filters.title')}</Text>
        <TouchableOpacity
          onPress={onReset}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t('filters.reset')}
        >
          <Text style={s.reset}>{t('filters.reset')}</Text>
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView contentContainerStyle={s.body}>
        {children}
      </BottomSheetScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={s.applyBtn}
          onPress={onApply}
          accessibilityRole="button"
          accessibilityLabel={resultCount === undefined ? t('filters.apply') : t('filters.show_results', { count: resultCount })}
        >
          <Text style={s.applyText}>
            {resultCount === undefined ? t('filters.apply') : t('filters.show_results', { count: resultCount })}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
});

export default FilterSheet;

const styles = (colors: Colors) => StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.borderColor,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  reset: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  body: { padding: 16, paddingBottom: 8 },
  // Clears the tab bar (60px, drawn by the navigator outside this screen)
  // plus the gesture bar, the same allowance the currency sheet makes.
  footer: {
    padding: 16, paddingBottom: 84, borderTopWidth: 1, borderTopColor: colors.borderColor,
    backgroundColor: colors.bgPrimary,
  },
  applyBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', backgroundColor: colors.primary },
  applyText: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
