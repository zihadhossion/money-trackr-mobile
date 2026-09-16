import React, { memo } from 'react';
import { Animated, type ViewStyle, type StyleProp, type DimensionValue } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Shared pulse animation driven by a single loop. Every Skeleton instance
 *  reads this value so we avoid 100+ concurrent Animated.loops. */
const pulse = new Animated.Value(0.55);

Animated.loop(
  Animated.sequence([
    Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
    Animated.timing(pulse, { toValue: 0.55, duration: 750, useNativeDriver: true }),
  ]),
).start();

/** A grey placeholder block with a pulse animation. Shaped by the caller to match real content. */
const Skeleton = memo(function Skeleton({ width = '100%', height = 12, radius = 6, style }: SkeletonProps) {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: isDark ? colors.bgTertiary : colors.surface200,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;
