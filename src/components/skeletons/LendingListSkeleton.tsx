import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from '../ui/Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import { LENDING_CARD as C } from '../../theme/shapes';

/** Mirrors LendingItem: header (36×36 icon + name/type, status badge), amount row, action buttons. */
function LendingCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Skeleton width={C.iconSize} height={C.iconSize} radius={C.iconRadius} />
          <View style={styles.headerText}>
            <Skeleton width={110} height={15} />
            <Skeleton width={70} height={12} />
          </View>
        </View>
        <Skeleton width={72} height={24} radius={8} />
      </View>
      <View style={styles.amountRow}>
        <View style={styles.amountCol}>
          <Skeleton width={54} height={11} />
          <Skeleton width={80} height={16} />
        </View>
        <View style={[styles.amountCol, styles.amountColRight]}>
          <Skeleton width={54} height={11} />
          <Skeleton width={80} height={16} />
        </View>
      </View>
      <View style={styles.actions}>
        <Skeleton width={78} height={C.actionHeight} radius={8} />
        <Skeleton width={78} height={C.actionHeight} radius={8} />
      </View>
    </View>
  );
}

export default function LendingListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => <LendingCardSkeleton key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: C.radius, padding: C.padding, borderWidth: 1, marginBottom: C.marginBottom, gap: C.gap },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerText: { gap: 4 },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountCol: { gap: 4 },
  amountColRight: { alignItems: 'flex-end' },
  actions: { flexDirection: 'row', gap: 8 },
});
