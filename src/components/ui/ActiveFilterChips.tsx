import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import type { Colors } from '../../theme/colors';

export interface ActiveFilter {
  key: string;
  /** Shown small above the value, for screens where the value alone is
   *  ambiguous — "Lent" and "Pending" look alike until labelled. */
  label?: string;
  value: string;
  onRemove: () => void;
}

interface ActiveFilterChipsProps {
  filters: ActiveFilter[];
  onClearAll: () => void;
}

/**
 * The overview of what is filtering the list, sitting directly above it.
 *
 * Wrapped rather than horizontally scrolled: these screens carry at most
 * three filters, so everything fits, and a scroller would hide filters
 * behind a gesture with no cue that they are there.
 */
export default React.memo(function ActiveFilterChips({ filters, onClearAll }: ActiveFilterChipsProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => styles(colors), [colors]);

  if (filters.length === 0) return null;

  return (
    <View style={s.wrap}>
      {filters.map((f) => (
        <TouchableOpacity
          key={f.key}
          style={s.chip}
          onPress={f.onRemove}
          accessibilityRole="button"
          accessibilityLabel={t('filters.remove_filter', { name: f.label ? `${f.label}: ${f.value}` : f.value })}
        >
          <View style={s.chipBody}>
            {f.label && <Text style={s.chipLabel}>{f.label}</Text>}
            <Text style={s.chipValue}>{f.value}</Text>
          </View>
          <Feather name="x" size={14} color={colors.primary} />
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={s.clearBtn}
        onPress={onClearAll}
        accessibilityRole="button"
        accessibilityLabel={t('filters.clear_all')}
      >
        <Text style={s.clearText}>{t('filters.clear_all')}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = (colors: Colors) => StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6, paddingLeft: 12, paddingRight: 10, borderRadius: 10,
    borderWidth: 1, borderColor: colors.primary, backgroundColor: `${colors.primary}15`,
  },
  chipBody: { justifyContent: 'center' },
  chipLabel: { fontSize: 10, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },
  chipValue: { fontSize: 13, fontWeight: '600', color: colors.primary },
  clearBtn: { paddingVertical: 6, paddingHorizontal: 4 },
  clearText: { fontSize: 13, fontWeight: '600', color: colors.textMuted, textDecorationLine: 'underline' },
});
