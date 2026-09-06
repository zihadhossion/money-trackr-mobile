import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface MonthYearPickerProps {
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

export default React.memo(function MonthYearPicker({ month, year, onMonthChange, onYearChange }: MonthYearPickerProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const monthsShort = t('months_short', { returnObjects: true }) as readonly string[];

  return (
    <View style={styles.container}>
      {/* Month selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRow}>
        {monthsShort.map((m, i) => {
          const isActive = i + 1 === month;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.monthChip, { backgroundColor: isActive ? colors.primary : colors.bgTertiary, borderColor: isActive ? colors.primary : colors.borderColor }]}
              onPress={() => onMonthChange(i + 1)}
              accessibilityRole="button"
              accessibilityLabel={m}
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.monthText, { color: isActive ? '#fff' : colors.textSecondary }]}>{m}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Year selector */}
      <View style={styles.yearRow}>
        <TouchableOpacity
          style={styles.yearBtn}
          onPress={() => onYearChange(year - 1)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.previous_year')}
        >
          <Feather name="chevron-left" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.yearText, { color: colors.textPrimary }]}>{year}</Text>
        <TouchableOpacity
          style={styles.yearBtn}
          onPress={() => onYearChange(year + 1)}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.next_year')}
        >
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 10, marginBottom: 12 },
  monthRow: { gap: 6, paddingHorizontal: 2 },
  monthChip: { borderRadius: 8, paddingHorizontal: 12, minHeight: 44, justifyContent: 'center', borderWidth: 1 },
  yearBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  monthText: { fontSize: 13, fontWeight: '500' },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  yearText: { fontSize: 16, fontWeight: '700', minWidth: 50, textAlign: 'center' },
});
