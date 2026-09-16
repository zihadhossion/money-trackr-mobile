import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import type { TrendData } from '../../types';
import { fontSize, fontWeight, MAX_FONT_SCALE } from '../../theme/typography';

interface TrendsBarChartProps {
  data: TrendData[];
  currency?: string;
}

const screenWidth = Dimensions.get('window').width;

// Bar geometry, set explicitly so the tooltip position can be computed from it.
const CHART_HEIGHT = 200;
const BAR_WIDTH = 10;
const INITIAL_SPACING = 12;
const GAP_IN_MONTH = 2;
const GAP_BETWEEN_MONTHS = 16;
const MONTH_WIDTH = BAR_WIDTH * 2 + GAP_IN_MONTH + GAP_BETWEEN_MONTHS;

const TOOLTIP_WIDTH = 150;
const TOOLTIP_GAP = 6;

// x of a bar inside the scrolling chart, the same sum gifted-charts uses.
const barLeft = (barIndex: number) =>
  INITIAL_SPACING + Math.floor(barIndex / 2) * MONTH_WIDTH + (barIndex % 2) * (BAR_WIDTH + GAP_IN_MONTH);

// gifted-charts draws the tooltip from the tapped bar's left edge. Shift it so
// it is centred on the month, but never past the first or last bar.
const tooltipShift = (barIndex: number, monthCount: number) => {
  const monthCentre = barLeft(barIndex - (barIndex % 2)) + BAR_WIDTH + GAP_IN_MONTH / 2;
  const maxLeft = barLeft(monthCount * 2 - 1) + BAR_WIDTH - TOOLTIP_WIDTH;
  const left = Math.max(0, Math.min(monthCentre - TOOLTIP_WIDTH / 2, maxLeft));
  return barLeft(barIndex) - left;
};

export default React.memo(function TrendsBarChart({ data }: TrendsBarChartProps) {
  const { colors } = useTheme();
  const { format } = useCurrency();
  // Index into barData (two bars per month), -1 when nothing is tapped.
  const [selectedBar, setSelectedBar] = useState(-1);
  const [tooltipHeight, setTooltipHeight] = useState(84);

  useEffect(() => {
    setSelectedBar(-1);
  }, [data]);

  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expenses)), 100) * 1.2;

  // Build grouped bar data — income + expenses side by side per month
  const barData = useMemo(() => data.flatMap((item, month) => [
    {
      value: item.income,
      label: item.month.substring(0, 3),
      frontColor: colors.success,
      spacing: GAP_IN_MONTH,
      labelWidth: 30,
      labelTextStyle: { color: colors.textSecondary, fontSize: fontSize.caption },
      leftShiftForTooltip: tooltipShift(month * 2, data.length),
    },
    {
      value: item.expenses,
      frontColor: colors.danger,
      spacing: GAP_BETWEEN_MONTHS,
      leftShiftForTooltip: tooltipShift(month * 2 + 1, data.length),
    },
  ]), [data, colors]);

  if (!data || data.length === 0) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.bgTertiary }]}>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>No trend data</Text>
      </View>
    );
  }

  const renderTooltip = (_item: unknown, barIndex: number) => {
    const month = data[Math.floor(barIndex / 2)];
    if (!month) return null;
    // gifted-charts sets the tooltip's bottom 2px above the tapped bar. Lift it
    // over the taller bar of the month, but keep it inside the chart: the
    // scroll view clips anything above the top.
    const barHeight = (value: number) => (value * CHART_HEIGHT) / maxValue;
    const anchoredAt = barHeight(barIndex % 2 === 0 ? month.income : month.expenses) + 2;
    const wanted = Math.min(
      barHeight(Math.max(month.income, month.expenses)) + TOOLTIP_GAP,
      CHART_HEIGHT - tooltipHeight,
    );
    return (
      <View
        onLayout={(e) => {
          const h = Math.ceil(e.nativeEvent.layout.height);
          if (h !== tooltipHeight) setTooltipHeight(h);
        }}
        style={[
          styles.tooltip,
          {
            backgroundColor: colors.bgPrimary,
            borderColor: colors.borderColor,
            shadowColor: colors.black,
            transform: [{ translateY: anchoredAt - wanted }],
          },
        ]}
      >
        <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.tooltipTitle, { color: colors.textPrimary, borderBottomColor: colors.borderColor }]}>
          {month.month}
        </Text>
        {([['Income', month.income, colors.success], ['Expenses', month.expenses, colors.danger]] as const).map(([name, value, color]) => (
          <View key={name} style={styles.tooltipRow}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.tooltipName, { color: colors.textSecondary }]}>{name}</Text>
            <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[styles.tooltipValue, { color: colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
              {format(value)}
            </Text>
          </View>
        ))}
      </View>
    );
  };

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
        height={CHART_HEIGHT}
        barWidth={BAR_WIDTH}
        initialSpacing={INITIAL_SPACING}
        barBorderRadius={4}
        noOfSections={4}
        maxValue={maxValue}
        width={screenWidth - 80}
        yAxisTextStyle={{ color: colors.textSecondary, fontSize: fontSize.caption }}
        rulesColor={colors.borderColor}
        yAxisColor={colors.borderColor}
        xAxisColor={colors.borderColor}
        hideYAxisText={false}
        isAnimated
        activeOpacity={0.7}
        // Controlled: with focusedBarIndex and onPress both set, gifted-charts
        // leaves the selection to us, which makes a second tap close the tooltip.
        focusedBarIndex={selectedBar}
        onPress={(_item: unknown, index: number) => {
          setSelectedBar((prev) => (prev !== -1 && Math.floor(prev / 2) === Math.floor(index / 2) ? -1 : index));
        }}
        renderTooltip={renderTooltip}
        // The last bar ignores its own leftShiftForTooltip and uses this instead.
        leftShiftForLastIndexTooltip={tooltipShift(data.length * 2 - 1, data.length)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 12 },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: fontSize.meta },
  tooltip: {
    width: TOOLTIP_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  tooltipTitle: {
    fontSize: fontSize.meta,
    fontWeight: fontWeight.bold,
    paddingBottom: 4,
    marginBottom: 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tooltipRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tooltipName: { fontSize: fontSize.caption, flex: 1 },
  tooltipValue: { fontSize: fontSize.caption, fontWeight: fontWeight.semibold, flexShrink: 1 },
  empty: { borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: fontSize.body },
});
