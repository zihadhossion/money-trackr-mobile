import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ROW_ACTION as R } from '../../theme/shapes';

interface RowActionProps {
  icon: React.ComponentProps<typeof Feather>['name'];
  color: string;
  onPress: () => void;
  /** Required: the button is an icon on its own, so the label is the only name it has. */
  accessibilityLabel: string;
  accessibilityHint?: string;
}

/**
 * The single edit/delete/repay control used by every card. Kept icon-only
 * because the narrowest host (a transaction row, which also carries an amount)
 * has no width for a label — so the touch target, not the icon box, is what
 * reaches 44pt.
 */
export default React.memo(function RowAction({
  icon, color, onPress, accessibilityLabel, accessibilityHint,
}: RowActionProps) {
  return (
    <TouchableOpacity
      style={styles.btn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <Feather name={icon} size={R.iconSize} color={color} />
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  btn: { width: R.size, height: R.size, justifyContent: 'center', alignItems: 'center' },
});
