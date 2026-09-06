import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import type { Colors } from '../../theme/colors';
import { TOUCH_TARGET } from '../../theme/shapes';
import { fontSize, fontWeight } from '../../theme/typography';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (v: T) => void;
}

/**
 * Replaces the horizontally scrolling chip rows: every option is visible at
 * once, so the user can see the whole choice instead of discovering half of
 * it by swiping.
 */
export default function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  const s = useMemo(() => styles(colors), [colors]);

  return (
    <View style={s.track}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            style={[s.segment, selected && { backgroundColor: colors.primary }]}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityLabel={o.label}
            accessibilityState={{ selected }}
          >
            <Text
              style={[s.text, { color: selected ? colors.white : colors.textSecondary }]}
              numberOfLines={1}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = (colors: Colors) => StyleSheet.create({
  track: {
    flexDirection: 'row', borderRadius: 12, borderWidth: 1,
    borderColor: colors.borderColor, backgroundColor: colors.bgTertiary,
    padding: 3, gap: 3,
  },
  segment: { flex: 1, minHeight: TOUCH_TARGET - 8, borderRadius: 9, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  text: { fontSize: fontSize.meta, fontWeight: fontWeight.semibold },
});
