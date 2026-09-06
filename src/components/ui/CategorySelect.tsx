import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import type { Colors } from '../../theme/colors';
import type { Category } from '../../types';
import CategoryOptionList from './CategoryOptionList';
import { TOUCH_TARGET } from '../../theme/shapes';

interface CategorySelectProps {
  categories: Category[];
  /** '' means every category. */
  selected: string;
  onSelect: (name: string) => void;
  onAddNew?: () => void;
}

/**
 * Category as a collapsed field that opens its list, the same shape the
 * add/edit forms use for the same choice.
 *
 * Listing every category inline made the filter sheet as long as the user's
 * category list, pushing the apply button out of reach on an account with a
 * dozen of them. Collapsed, the sheet stays one screen whatever they have.
 */
export default React.memo(function CategorySelect({ categories, selected, onSelect, onAddNew }: CategorySelectProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const s = useMemo(() => styles(colors), [colors]);
  const [open, setOpen] = useState(false);

  const current = categories.find((c) => c.name === selected);

  return (
    <View>
      <TouchableOpacity
        style={s.select}
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={selected || t('common.all_categories')}
        accessibilityState={{ expanded: open }}
      >
        <Text style={[s.selectText, { color: selected ? colors.textPrimary : colors.textMuted }]}>
          {current ? `${current.icon}  ${current.name}` : t('common.all_categories')}
        </Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {open && (
        <View style={s.list}>
          <CategoryOptionList
            categories={categories}
            selected={selected}
            onSelect={(name) => { onSelect(name); setOpen(false); }}
            includeAllOption
            onAddNew={onAddNew}
          />
        </View>
      )}
    </View>
  );
});

const styles = (colors: Colors) => StyleSheet.create({
  select: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    minHeight: TOUCH_TARGET, paddingHorizontal: 12, borderRadius: 10,
    borderWidth: 1, borderColor: colors.borderColor, backgroundColor: colors.bgTertiary,
  },
  selectText: { fontSize: 14, flex: 1 },
  // The sheet scrolls, so the list expands in place rather than capping its
  // own height and trapping a second scroller inside the first.
  list: { marginTop: 4, borderRadius: 10, borderWidth: 1, borderColor: colors.borderColor, paddingVertical: 4 },
});
