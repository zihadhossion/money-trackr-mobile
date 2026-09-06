import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import type { Category } from '../../types';
import RowAction from './RowAction';
import { CATEGORY_CARD as C } from '../../theme/shapes';

interface CategoryCardProps {
  category: Category;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default React.memo(function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const canEdit = !category.isDefault;

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View accessible accessibilityRole="text" accessibilityLabel={t('a11y.category_item', { name: category.name })} style={styles.identity}>
        <View style={[styles.iconWrap, { backgroundColor: `${category.color}20` }]}>
          <Text style={styles.icon}>{category.icon}</Text>
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{category.name}</Text>
      </View>
      {canEdit && (
        <View style={styles.actions}>
          {onEdit && (
            <RowAction
              icon="edit-2"
              color={colors.primary}
              onPress={onEdit}
              accessibilityLabel={t('a11y.edit_category', { name: category.name })}
            />
          )}
          {onDelete && (
            <RowAction
              icon="trash-2"
              color={colors.danger}
              onPress={onDelete}
              accessibilityLabel={t('a11y.delete_category', { name: category.name })}
              accessibilityHint={t('a11y.delete_hint')}
            />
          )}
        </View>
      )}
      {category.isDefault && (
        <View style={[styles.defaultBadge, { backgroundColor: `${colors.primary}15` }]}>
          <Text style={[styles.defaultText, { color: colors.primary }]}>Default</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: C.radius,
    padding: C.padding,
    borderWidth: 1,
    alignItems: 'center',
    gap: C.gap,
    flex: 1,
    minWidth: C.minWidth,
  },
  identity: { alignItems: 'center', gap: 8 },
  iconWrap: { width: C.iconSize, height: C.iconSize, borderRadius: C.iconRadius, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 24 },
  name: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  actions: { flexDirection: 'row' },
  defaultBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  defaultText: { fontSize: 10, fontWeight: '600' },
});
