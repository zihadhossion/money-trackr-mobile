import React, { useEffect, useRef } from 'react';
import { Animated, type ViewStyle, type StyleProp, type DimensionValue } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/** A grey placeholder block with a pulse animation. Shaped by the caller to match real content. */
export default function Skeleton({ width = '100%', height = 12, radius = 6, style }: SkeletonProps) {
  const { colors, isDark } = useTheme();
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 750, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

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
}
