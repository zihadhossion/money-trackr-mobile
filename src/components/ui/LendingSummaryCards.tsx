import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/currency';
import type { LendingSummary } from '../../types';

interface LendingSummaryCardsProps {
  summary: LendingSummary;
}

export default React.memo(function LendingSummaryCards({ summary }: LendingSummaryCardsProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
        <Feather name="arrow-up-right" size={16} color={colors.success} />
        <Text style={[styles.label, { color: colors.textMuted }]}>Total Lent</Text>
        <Text style={[styles.amount, { color: colors.success }]}>{formatCurrency(summary.totalLent)}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
        <Feather name="arrow-down-left" size={16} color={colors.danger} />
        <Text style={[styles.label, { color: colors.textMuted }]}>Total Borrowed</Text>
        <Text style={[styles.amount, { color: colors.danger }]}>{formatCurrency(summary.totalBorrowed)}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, gap: 4 },
  label: { fontSize: 12 },
  amount: { fontSize: 17, fontWeight: '700' },
});
