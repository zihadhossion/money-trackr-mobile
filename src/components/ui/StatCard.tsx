import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../../contexts/ThemeContext";
import type { Colors } from "../../theme/colors";
import { STAT_CARD as C } from "../../theme/shapes";
import { fontSize } from '../../theme/typography';

type Variant = "success" | "danger" | "primary" | "warning" | "secondary";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  variant?: Variant;
  trend?: number;
  subtitle?: string;
  /** Short scope tag shown in the top-right corner, e.g. "This month". */
  badge?: string;
  /** Makes the whole card tappable. A chevron is shown so it reads as tappable. */
  onPress?: () => void;
  accessibilityLabel?: string;
}

const getVariantConfig = (colors: Colors, variant: Variant) => {
  const map: Record<
    Variant,
    { bg: string; iconBg: string; iconColor: string }
  > = {
    success: {
      bg: colors.successBg,
      iconBg: colors.success,
      iconColor: "#ffffff",
    },
    danger: {
      bg: colors.dangerBg,
      iconBg: colors.danger,
      iconColor: "#ffffff",
    },
    primary: {
      bg: colors.primaryBg,
      iconBg: colors.primary,
      iconColor: "#ffffff",
    },
    warning: {
      bg: colors.warningBg,
      iconBg: colors.warning,
      iconColor: "#ffffff",
    },
    secondary: {
      bg: colors.secondaryBg,
      iconBg: colors.secondary,
      iconColor: "#ffffff",
    },
  };
  return map[variant];
};

export default React.memo(function StatCard({
  title,
  value,
  icon,
  variant = "primary",
  trend,
  subtitle,
  badge,
  onPress,
  accessibilityLabel,
}: StatCardProps) {
  const { colors } = useTheme();
  const cfg = getVariantConfig(colors, variant);

  // A plain View when there is nothing to open, so the non-tappable cards keep
  // their current semantics and don't announce themselves as buttons.
  const Wrapper: any = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[
        styles.card,
        { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor },
      ]}
      {...(onPress
        ? {
            onPress,
            activeOpacity: 0.7,
            accessibilityRole: "button" as const,
            accessibilityLabel,
          }
        : null)}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }]}>
          <Feather name={icon} size={20} color={cfg.iconColor} />
        </View>
        {badge ? (
          <Text
            style={[
              styles.badge,
              { color: colors.textMuted, backgroundColor: colors.bgTertiary },
            ]}
            numberOfLines={1}
          >
            {badge}
          </Text>
        ) : onPress ? (
          <Feather name="chevron-right" size={16} color={colors.textMuted} />
        ) : null}
      </View>
      <Text
        style={[styles.title, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <Text
        style={[styles.value, { color: colors.textPrimary }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      {/* Two lines: the budget card's subtitle carries an amount pair that does
          not fit a half-width card on one line. */}
      {subtitle && (
        <Text
          style={[styles.subtitle, { color: colors.textMuted }]}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      )}
      {trend !== undefined && (
        <View style={styles.trendRow}>
          <Feather
            name={trend >= 0 ? "trending-up" : "trending-down"}
            size={12}
            color={trend >= 0 ? colors.success : colors.danger}
          />
          <Text
            style={[
              styles.trendText,
              { color: trend >= 0 ? colors.success : colors.danger },
            ]}
          >
            {Math.abs(trend).toFixed(1)}%
          </Text>
        </View>
      )}
    </Wrapper>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: C.radius,
    padding: C.padding,
    borderWidth: 1,
    gap: 6,
    minHeight: C.minHeight,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconWrap: {
    width: C.iconSize,
    height: C.iconSize,
    borderRadius: C.iconRadius,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  badge: {
    fontSize: fontSize.caption,
    fontWeight: "600",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 1,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: fontSize.meta,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: fontSize.emphasis,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: fontSize.caption,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  trendText: {
    fontSize: fontSize.meta,
    fontWeight: "600",
  },
});
