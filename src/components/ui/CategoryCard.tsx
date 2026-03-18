import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const { colors } = useTheme();
  const canEdit = !category.isDefault;

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={[styles.iconWrap, { backgroundColor: `${category.color}20` }]}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>
      <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{category.name}</Text>
      {canEdit && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} hitSlop={6}>
              <Feather name="edit-2" size={13} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} hitSlop={6}>
              <Feather name="trash-2" size={13} color="#ef4444" />
            </TouchableOpacity>
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
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 90,
  },
  iconWrap: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 24 },
  name: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  defaultBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  defaultText: { fontSize: 10, fontWeight: '600' },
});
