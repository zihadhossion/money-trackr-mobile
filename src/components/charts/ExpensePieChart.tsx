import React, { useEffect, useMemo, useState } from 'react';
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

// Alpha suffix for slices that aren't the tapped one.
const DIMMED_ALPHA = '40';

export default React.memo(function ExpensePieChart({ data }: ExpensePieChartProps) {
  const { colors } = useTheme();
  const { format } = useCurrency();
  const [selected, setSelected] = useState(-1);

  // A new month or a refetch can shrink the list; drop a selection that no longer exists.
  useEffect(() => {
    setSelected(-1);
  }, [data]);

  // The library resets its internal state whenever the data array changes
  // identity, so build it only when the inputs actually change.
  const chartData = useMemo(() => data.map((item, i) => {
    const color = PALETTE_COLORS[i % PALETTE_COLORS.length];
    return {
      value: item.total,
      color: selected === -1 || selected === i ? color : color + DIMMED_ALPHA,
      text: `${item.percentage.toFixed(0)}%`,
    };
  }), [data, selected]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.bgTertiary }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No expense data</Text>
      </View>
    );
  }

  const active = data[selected];

  return (
    <View style={styles.container}>
      <View style={styles.chartWrap}>
        {/* No focusOnPress: the library's pop-out redraws the slice at the old
            angle for a frame when switching slices, and its bulge ignores taps.
            Selection is handled here instead and shown in the donut hole. */}
        <PieChart
          data={chartData}
          donut
          // Without innerCircleColor the donut hole defaults to white, which
          // glares on the dark card. The wider ring keeps the % labels (drawn
          // 'outward' by default for donuts) inside the band, not over the hole.
          innerCircleColor={colors.bgPrimary}
          innerRadius={58}
          radius={95}
          showText
          textColor="#fff"
          textSize={11}
          onPress={(_item: unknown, index: number) => setSelected((prev) => (prev === index ? -1 : index))}
          centerLabelComponent={() => active ? (
            <View style={styles.center}>
              <Text style={[styles.centerLabel, { color: colors.textSecondary }]} numberOfLines={1}>{active.category}</Text>
              <Text style={[styles.centerAmount, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
                {format(active.total)}
              </Text>
              <Text style={[styles.centerLabel, { color: colors.textMuted }]}>{active.percentage.toFixed(1)}%</Text>
            </View>
          ) : null}
        />
      </View>

      <View style={styles.legend}>
        {data.map((item, i) => (
          <View
            key={item.category}
            style={[
              styles.legendRow,
              selected === i && { backgroundColor: colors.bgTertiary },
              selected !== -1 && selected !== i && styles.legendRowDimmed,
            ]}
          >
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
  center: { alignItems: 'center', width: 100 },
  centerLabel: { fontSize: fontSize.caption },
  centerAmount: { fontSize: fontSize.meta, fontWeight: fontWeight.bold },
  legend: { width: '100%', gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  legendRowDimmed: { opacity: 0.5 },
  legendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  legendLabel: { flex: 1, fontSize: fontSize.meta },
  legendAmount: { fontSize: fontSize.meta, fontWeight: fontWeight.semibold },
  empty: { borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: fontSize.body },
});
