import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../../contexts/ThemeContext';
import type { TrendData } from '../../types';

interface TrendsBarChartProps {
  data: TrendData[];
  currency?: string;
}

const screenWidth = Dimensions.get('window').width;

export default React.memo(function TrendsBarChart({ data }: TrendsBarChartProps) {
  const { colors } = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.bgTertiary }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No trend data</Text>
      </View>
    );
  }

  // Build grouped bar data — income + expenses side by side per month
  const barData = data.flatMap((item) => [
    {
      value: item.income,
      label: item.month.substring(0, 3),
      frontColor: colors.success,
      spacing: 2,
      labelWidth: 30,
      labelTextStyle: { color: colors.textMuted, fontSize: 10 },
    },
    {
      value: item.expenses,
      frontColor: colors.danger,
      spacing: 16,
    },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Expenses</Text>
        </View>
      </View>
      <BarChart
        data={barData}
        barWidth={10}
        barBorderRadius={4}
        noOfSections={4}
        maxValue={Math.max(...data.map((d) => Math.max(d.income, d.expenses)), 100) * 1.2}
        width={screenWidth - 80}
        yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        rulesColor={colors.borderColor}
        yAxisColor={colors.borderColor}
        xAxisColor={colors.borderColor}
        hideYAxisText={false}
        isAnimated
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 12 },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13 },
  empty: { borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
