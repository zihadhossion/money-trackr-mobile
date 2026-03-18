import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

type Variant = 'success' | 'danger' | 'primary' | 'warning' | 'secondary';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  variant?: Variant;
  trend?: number;
  subtitle?: string;
}

const variantConfig: Record<Variant, { bg: string; iconBg: string; iconColor: string }> = {
  success:   { bg: '#d1fae5', iconBg: '#10b981', iconColor: '#ffffff' },
  danger:    { bg: '#fee2e2', iconBg: '#ef4444', iconColor: '#ffffff' },
  primary:   { bg: '#e0e7ff', iconBg: '#6366f1', iconColor: '#ffffff' },
  warning:   { bg: '#fef3c7', iconBg: '#f59e0b', iconColor: '#ffffff' },
  secondary: { bg: '#ede9fe', iconBg: '#8b5cf6', iconColor: '#ffffff' },
};

export default function StatCard({ title, value, icon, variant = 'primary', trend, subtitle }: StatCardProps) {
  const { colors, isDark } = useTheme();
  const cfg = variantConfig[variant];

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }]}>
        <Feather name={icon} size={20} color={cfg.iconColor} />
      </View>
      <Text style={[styles.title, { color: colors.textMuted }]} numberOfLines={1}>{title}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }]} numberOfLines={1}>{value}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>{subtitle}</Text>}
      {trend !== undefined && (
        <View style={styles.trendRow}>
          <Feather
            name={trend >= 0 ? 'trending-up' : 'trending-down'}
            size={12}
            color={trend >= 0 ? '#10b981' : '#ef4444'}
          />
          <Text style={[styles.trendText, { color: trend >= 0 ? '#10b981' : '#ef4444' }]}>
            {Math.abs(trend).toFixed(1)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 6,
    minHeight: 110,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
