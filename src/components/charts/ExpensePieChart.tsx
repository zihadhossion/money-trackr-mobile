import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../contexts/ThemeContext';
import type { CategoryData } from '../../types';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16'];

interface ExpensePieChartProps {
  data: CategoryData[];
  currency?: string;
}

export default function ExpensePieChart({ data, currency = '৳' }: ExpensePieChartProps) {
  const { colors } = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.bgTertiary }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No expense data</Text>
      </View>
    );
  }

  const chartData = data.map((item, i) => ({
    value: item.total,
    color: CHART_COLORS[i % CHART_COLORS.length],
    text: `${item.percentage.toFixed(0)}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.chartWrap}>
        <PieChart
          data={chartData}
          donut
          innerRadius={55}
          radius={80}
          showText
          textColor="#fff"
          textSize={11}
          focusOnPress
        />
      </View>

      <View style={styles.legend}>
        {data.map((item, i) => (
          <View key={item.category} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]} numberOfLines={1}>{item.category}</Text>
            <Text style={[styles.legendAmount, { color: colors.textPrimary }]}>
              {currency}{item.total.toLocaleString()} ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16 },
  chartWrap: { alignItems: 'center' },
  legend: { width: '100%', gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendLabel: { flex: 1, fontSize: 13 },
  legendAmount: { fontSize: 13, fontWeight: '600' },
  empty: { borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
