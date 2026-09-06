import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from '../ui/Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import { STAT_CARD, SUMMARY_CARD, CHART_CARD } from '../../theme/shapes';

/** Mirrors StatCard: radius 16, padding 16, minHeight 110, 40×40 icon, title + value. */
function StatCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.statCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <Skeleton width={STAT_CARD.iconSize} height={STAT_CARD.iconSize} radius={STAT_CARD.iconRadius} style={styles.statIcon} />
      <Skeleton width="70%" height={10} />
      <Skeleton width="55%" height={18} />
    </View>
  );
}

/** The 2×2 StatCard grid on the dashboard. */
export function StatGridSkeleton() {
  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatCardSkeleton />
        <View style={styles.gap} />
        <StatCardSkeleton />
      </View>
      <View style={styles.row}>
        <StatCardSkeleton />
        <View style={styles.gap} />
        <StatCardSkeleton />
      </View>
    </View>
  );
}

/** Mirrors LendingSummaryCards: two cards, radius 14, padding 14, label + amount. */
export function LendingSummarySkeleton() {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryRow}>
      {[0, 1].map((i) => (
        <View key={i} style={[styles.summaryCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Skeleton width="60%" height={10} />
          <Skeleton width="45%" height={17} />
        </View>
      ))}
    </View>
  );
}

/** Mirrors a dashboard chart card: title line above a 200px plot area. The
 *  radial/bar shape itself is not worth faking — a plain block reads as
 *  "a chart is coming" without pretending to be data. */
export function ChartSkeleton() {
  return (
    <View>
      <Skeleton width="55%" height={16} style={styles.chartTitle} />
      <Skeleton width="100%" height={CHART_CARD.plotHeight} radius={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: STAT_CARD.gap },
  row: { flexDirection: 'row' },
  gap: { width: STAT_CARD.gap },
  statCard: { flex: 1, borderRadius: STAT_CARD.radius, padding: STAT_CARD.padding, borderWidth: 1, gap: 6, minHeight: STAT_CARD.minHeight },
  statIcon: { marginBottom: 4 },
  summaryRow: { flexDirection: 'row', gap: SUMMARY_CARD.gap, marginBottom: SUMMARY_CARD.gap },
  chartTitle: { marginBottom: CHART_CARD.titleMarginBottom },
  summaryCard: { flex: 1, borderRadius: SUMMARY_CARD.radius, padding: SUMMARY_CARD.padding, borderWidth: 1, gap: 4 },
});
