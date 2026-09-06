import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from '../ui/Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import { TRANSACTION_ROW as R } from '../../theme/shapes';

/** Mirrors TransactionItem. Geometry comes from the shared shape so the two
 *  cannot drift apart and make the list jump when data arrives. */
function TransactionRowSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <Skeleton width={R.iconSize} height={R.iconSize} radius={R.iconRadius} />
      <View style={styles.info}>
        <Skeleton width="45%" height={14} />
        <Skeleton width="65%" height={12} />
        <Skeleton width="30%" height={12} />
      </View>
      <View style={styles.right}>
        <Skeleton width={70} height={15} />
        <View style={styles.actions}>
          <Skeleton width={20} height={20} radius={4} style={styles.action} />
          <Skeleton width={20} height={20} radius={4} style={styles.action} />
        </View>
      </View>
    </View>
  );
}

export default function TransactionListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => <TransactionRowSkeleton key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', borderRadius: R.radius,
    padding: R.padding, marginBottom: R.marginBottom, borderWidth: 1, gap: R.gap,
  },
  info: { flex: 1, gap: 4 },
  right: { alignItems: 'flex-end', gap: 2 },
  actions: { flexDirection: 'row' },
  // Each block is centred in a full 44px slot, exactly like the real buttons.
  action: { marginHorizontal: (R.actionSize - 20) / 2, marginVertical: (R.actionSize - 20) / 2 },
});
