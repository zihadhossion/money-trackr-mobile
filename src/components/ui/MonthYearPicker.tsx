import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { MONTHS_SHORT } from '../../utils/date';

interface MonthYearPickerProps {
  month: number;
  year: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

export default function MonthYearPicker({ month, year, onMonthChange, onYearChange }: MonthYearPickerProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Month selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRow}>
        {MONTHS_SHORT.map((m, i) => {
          const isActive = i + 1 === month;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.monthChip, { backgroundColor: isActive ? colors.primary : colors.bgTertiary, borderColor: isActive ? colors.primary : colors.borderColor }]}
              onPress={() => onMonthChange(i + 1)}
            >
              <Text style={[styles.monthText, { color: isActive ? '#fff' : colors.textMuted }]}>{m}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Year selector */}
      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => onYearChange(year - 1)} hitSlop={8}>
          <Feather name="chevron-left" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={[styles.yearText, { color: colors.textPrimary }]}>{year}</Text>
        <TouchableOpacity onPress={() => onYearChange(year + 1)} hitSlop={8}>
          <Feather name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10, marginBottom: 12 },
  monthRow: { gap: 6, paddingHorizontal: 2 },
  monthChip: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  monthText: { fontSize: 13, fontWeight: '500' },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  yearText: { fontSize: 16, fontWeight: '700', minWidth: 50, textAlign: 'center' },
});
