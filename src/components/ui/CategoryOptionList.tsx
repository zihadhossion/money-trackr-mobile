import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import type { Colors } from '../../theme/colors';
import type { Category } from '../../types';
import { TOUCH_TARGET } from '../../theme/shapes';

interface CategoryOptionListProps {
  categories: Category[];
  /** '' means "all categories"; omit onSelectAll to drop that row (forms
   *  require a category, filters do not). */
  selected: string;
  onSelect: (name: string) => void;
  includeAllOption?: boolean;
  onAddNew?: () => void;
}

/**
 * The category rows themselves, container-agnostic: the filter sheet and the
 * add/edit forms both render this, so an option row looks and behaves the
 * same wherever a category is picked.
 */
export default React.memo(function CategoryOptionList({
  categories, selected, onSelect, includeAllOption = false, onAddNew,
}: CategoryOptionListProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => styles(colors), [colors]);

  const renderRow = (key: string, label: string, value: string) => {
    const isSelected = selected === value;
    return (
      <TouchableOpacity
        key={key}
        style={[s.row, isSelected && { backgroundColor: `${colors.primary}15` }]}
        onPress={() => onSelect(value)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={[s.rowText, { color: isSelected ? colors.primary : colors.textPrimary }]}>{label}</Text>
        {isSelected && <Feather name="check" size={16} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <View>
      {includeAllOption && renderRow('__all__', t('common.all_categories'), '')}
      {categories.map((c) => renderRow(c._id, `${c.icon}  ${c.name}`, c.name))}

      {categories.length === 0 && (
        // Without this the list is a silent empty box, and nothing on screen
        // says a category has to exist before one can be picked.
        <Text style={s.empty}>{t('filters.no_categories')}</Text>
      )}

      {onAddNew && (
        <TouchableOpacity
          style={s.addRow}
          onPress={onAddNew}
          accessibilityRole="button"
          accessibilityLabel={t('categories.add')}
        >
          <Feather name="plus" size={16} color={colors.primary} />
          <Text style={s.addText}>{t('categories.add')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = (colors: Colors) => StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: TOUCH_TARGET, paddingHorizontal: 12, borderRadius: 10,
  },
  rowText: { fontSize: 14, flex: 1 },
  empty: { fontSize: 13, color: colors.textMuted, paddingHorizontal: 12, paddingVertical: 10 },
  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    minHeight: TOUCH_TARGET, paddingHorizontal: 12, borderRadius: 10,
    borderTopWidth: 1, borderTopColor: colors.borderColor, marginTop: 4,
  },
  addText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});
