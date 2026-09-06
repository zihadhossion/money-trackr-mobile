import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { PALETTE_COLORS } from '../../theme/colors';
import type { CategoryData } from '../../types';
import { fontSize, fontWeight } from '../../theme/typography';

interface ExpensePieChartProps {
  data: CategoryData[];
}

export default React.memo(function ExpensePieChart({ data }: ExpensePieChartProps) {
  const { colors } = useTheme();
  const { format } = useCurrency();

  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.bgTertiary }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No expense data</Text>
      </View>
    );
  }

  const chartData = data.map((item, i) => ({
    value: item.total,
    color: PALETTE_COLORS[i % PALETTE_COLORS.length],
    text: `${item.percentage.toFixed(0)}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.chartWrap}>
        <PieChart
          data={chartData}
          donut
          // Without innerCircleColor the donut hole defaults to white, which
          // glares on the dark card. The wider ring keeps the % labels (drawn
          // 'outward' by default for donuts) inside the band, not over the hole.
          innerCircleColor={colors.bgPrimary}
          innerRadius={48}
          radius={85}
          showText
          textColor="#fff"
          textSize={11}
          focusOnPress
        />
      </View>

      <View style={styles.legend}>
        {data.map((item, i) => (
          <View key={item.category} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: PALETTE_COLORS[i % PALETTE_COLORS.length] }]} />
            <Text style={[styles.legendLabel, { color: colors.textSecondary }]} numberOfLines={1}>{item.category}</Text>
            <Text style={[styles.legendAmount, { color: colors.textPrimary }]}>
              {format(item.total)} ({item.percentage.toFixed(1)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16 },
  chartWrap: { alignItems: 'center' },
  legend: { width: '100%', gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendLabel: { flex: 1, fontSize: fontSize.meta },
  legendAmount: { fontSize: fontSize.meta, fontWeight: fontWeight.semibold },
  empty: { borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: fontSize.body },
});
