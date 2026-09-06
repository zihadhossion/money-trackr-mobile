import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton from '../ui/Skeleton';
import { useTheme } from '../../contexts/ThemeContext';
import { NOTE_CARD as C, ROW_ACTION as A } from '../../theme/shapes';

/** Mirrors NoteCard: colour accent stripe, title, three content lines, icon actions. */
function NoteCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <Skeleton width={C.accentWidth} height="100%" radius={0} />
      <View style={styles.body}>
        <Skeleton width="55%" height={15} />
        <Skeleton width="90%" height={13} />
        <Skeleton width="75%" height={13} />
      </View>
      <View style={styles.actions}>
        {Array.from({ length: 2 }, (_, i) => (
          <Skeleton key={i} width={20} height={20} radius={4} style={styles.action} />
        ))}
      </View>
    </View>
  );
}

export default function NoteListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => <NoteCardSkeleton key={i} />)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: C.radius,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: C.marginBottom,
    minHeight: 92,
  },
  body: { flex: 1, padding: C.padding, gap: 6 },
  actions: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 6, paddingRight: 4 },
  action: { marginHorizontal: (A.size - 20) / 2, marginVertical: (A.size - 20) / 2 },
});
