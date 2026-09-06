import React, { useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import type { Colors } from '../../theme/colors';
import { TOUCH_TARGET } from '../../theme/shapes';

interface ListToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  placeholder: string;
  /** Filters set beyond the default period — drives the button's badge. */
  activeCount: number;
  onOpenFilters: () => void;
}

/**
 * Search field + filter button, one row, shared by every list screen.
 *
 * The badge only summarises; what is actually selected is spelled out by
 * ActiveFilterChips below it. A count on its own would force the user to
 * open the sheet just to see what is filtering their list.
 */
export default React.memo(function ListToolbar({
  search, onSearchChange, placeholder, activeCount, onOpenFilters,
}: ListToolbarProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => styles(colors), [colors]);

  return (
    <View style={s.row}>
      <View style={s.searchBox}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={s.input}
          value={search}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          accessibilityLabel={placeholder}
        />
        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={t('filters.clear_search')}
          >
            <Feather name="x" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={s.filterBtn}
        onPress={onOpenFilters}
        accessibilityRole="button"
        accessibilityLabel={t('filters.title')}
        accessibilityValue={activeCount > 0 ? { text: String(activeCount) } : undefined}
      >
        <Feather name="sliders" size={18} color={activeCount > 0 ? colors.primary : colors.textSecondary} />
        {activeCount > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{activeCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = (colors: Colors) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    height: TOUCH_TARGET, paddingHorizontal: 12, borderRadius: 12,
    borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.bgPrimary,
  },
  // No vertical padding: the box sets the height, and padding on Android
  // pushes the text off-centre inside it.
  input: { flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 0 },
  filterBtn: {
    width: TOUCH_TARGET, height: TOUCH_TARGET, borderRadius: 12, borderWidth: 1,
    borderColor: colors.borderColor, backgroundColor: colors.bgPrimary,
    justifyContent: 'center', alignItems: 'center',
  },
  badge: {
    position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18,
    borderRadius: 9, paddingHorizontal: 5, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
});
