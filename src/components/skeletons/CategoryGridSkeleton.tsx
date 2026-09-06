import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from '../ui/Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import { CATEGORY_CARD as C } from '../../theme/shapes';

/** Mirrors CategoryCard: round icon tile, name line, action row. */
function CategoryCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <Skeleton width={C.iconSize} height={C.iconSize} radius={C.iconRadius} />
      <Skeleton width="70%" height={13} />
      <Skeleton width={48} height={16} radius={6} />
    </View>
  );
}

export default function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, i) => <CategoryCardSkeleton key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    borderRadius: C.radius,
    padding: C.padding,
    borderWidth: 1,
    alignItems: 'center',
    gap: C.gap,
    flexBasis: '30%',
    flexGrow: 1,
    minWidth: C.minWidth,
  },
});
