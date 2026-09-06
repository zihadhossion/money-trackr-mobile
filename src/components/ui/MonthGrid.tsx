import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import type { Colors } from '../../theme/colors';

interface MonthGridProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

/**
 * A 3x4 grid of months under a year stepper, replacing the horizontal month
 * strip. All twelve are visible at once and it costs less height than the
 * strip plus its separate year row did.
 */
export default React.memo(function MonthGrid({ month, year, onChange }: MonthGridProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => styles(colors), [colors]);
  const monthsShort = t('months_short', { returnObjects: true }) as readonly string[];

  return (
    <View style={s.container}>
      <View style={s.yearRow}>
        <TouchableOpacity
          style={s.yearBtn}
          onPress={() => onChange(month, year - 1)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.previous_year')}
        >
          <Feather name="chevron-left" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={s.yearText}>{year}</Text>
        <TouchableOpacity
          style={s.yearBtn}
          onPress={() => onChange(month, year + 1)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.next_year')}
        >
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={s.grid}>
        {monthsShort.map((m, i) => {
          const selected = i + 1 === month;
          return (
            <TouchableOpacity
              key={m}
              style={[s.cell, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => onChange(i + 1, year)}
              accessibilityRole="button"
              accessibilityLabel={m}
              accessibilityState={{ selected }}
            >
              <Text style={[s.cellText, { color: selected ? colors.white : colors.textSecondary }]}>{m}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = (colors: Colors) => StyleSheet.create({
  container: { gap: 10 },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  yearBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  yearText: { fontSize: 16, fontWeight: '700', minWidth: 50, textAlign: 'center', color: colors.textPrimary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // Four to a row, whatever the screen width: three gaps of 8 shared out.
  cell: {
    width: '22%', flexGrow: 1, minHeight: 44, borderRadius: 10, borderWidth: 1,
    borderColor: colors.borderColor, backgroundColor: colors.bgTertiary,
    justifyContent: 'center', alignItems: 'center',
  },
  cellText: { fontSize: 13, fontWeight: '600' },
});
