import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof Feather>['name'];
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default React.memo(function EmptyState({ icon = 'inbox', title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      {/* Grouped so a screen reader reads one message, but kept as a sibling of
          the action button — an `accessible` parent swallows its children. */}
      <View style={styles.group} accessible accessibilityRole="text" accessibilityLabel={[title, subtitle].filter(Boolean).join('. ')}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}15` }]}>
          <Feather name={icon} size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
      </View>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  group: { alignItems: 'center' },
  iconWrap: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  btn: { borderRadius: 10, minHeight: 44, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
