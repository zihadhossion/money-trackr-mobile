import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { formStyles } from '../../theme/formStyles';
import { PALETTE_COLORS } from '../../theme/colors';
import type { Category } from '../../types';

const EMOJIS = ['🍔', '🚗', '🏠', '💊', '📚', '👗', '🎮', '✈️', '⚡', '📱', '💄', '🐾', '💪', '🎬', '🍷', '☕', '💰', '📈', '🎁', '🔧', '🏋️', '🌱', '💻', '🎯'];
const COLORS = [...PALETTE_COLORS, '#f97316', '#ec4899'];

interface CategoryFormProps {
  initial?: Partial<Category>;
  onSubmit: (data: Omit<Category, '_id' | 'isDefault'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function CategoryForm({ initial, onSubmit, onCancel, loading }: CategoryFormProps) {
  const { colors } = useTheme();
  const fs = useMemo(() => formStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<'income' | 'expense'>(initial?.type ?? 'expense');
  const [icon, setIcon] = useState(initial?.icon ?? EMOJIS[0]);
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);

  async function handleSubmit() {
    if (!name.trim()) return Alert.alert('Validation', 'Enter a category name');
    await onSubmit({ name: name.trim(), type, icon, color });
  }

  return (
    <ScrollView style={fs.container} keyboardShouldPersistTaps="handled">
      <Text style={fs.title}>{initial?._id ? 'Edit Category' : 'Add Category'}</Text>

      {/* Preview */}
      <View style={[s.preview, { backgroundColor: `${color}20` }]}>
        <Text style={s.previewIcon}>{icon}</Text>
        <Text style={[s.previewName, { color: colors.textPrimary }]}>{name || 'Category Name'}</Text>
      </View>

      {/* Name */}
      <Text style={fs.label}>Name *</Text>
      <TextInput style={fs.input} value={name} onChangeText={setName} placeholder="Category name" placeholderTextColor={colors.textMuted} />

      {/* Type */}
      <Text style={fs.label}>Type</Text>
      <View style={s.segmented}>
        {(['expense', 'income'] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.segmentBtn, type === t && { backgroundColor: colors.primary }]} onPress={() => setType(t)}>
            <Text style={[s.segmentText, { color: type === t ? '#fff' : colors.textSecondary }]}>{t === 'expense' ? 'Expense' : 'Income'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Icon picker */}
      <Text style={fs.label}>Icon</Text>
      <View style={s.emojiGrid}>
        {EMOJIS.map((e) => (
          <TouchableOpacity key={e} style={[s.emojiBtn, icon === e && { backgroundColor: `${color}30`, borderColor: color }]} onPress={() => setIcon(e)}>
            <Text style={s.emoji}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color picker */}
      <Text style={fs.label}>Color</Text>
      <View style={s.colorRow}>
        {COLORS.map((c) => (
          <TouchableOpacity key={c} style={[s.colorSwatch, { backgroundColor: c }, color === c && s.colorSelected]} onPress={() => setColor(c)} />
        ))}
      </View>

      <View style={fs.buttons}>
        <TouchableOpacity style={fs.cancelBtn} onPress={onCancel}><Text style={[fs.cancelText, { color: colors.textSecondary }]}>Cancel</Text></TouchableOpacity>
        <TouchableOpacity style={[fs.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
          <Text style={fs.submitText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const localStyles = (colors: any) => StyleSheet.create({
  preview: { alignItems: 'center', borderRadius: 14, padding: 20, marginBottom: 8 },
  previewIcon: { fontSize: 36, marginBottom: 8 },
  previewName: { fontSize: 16, fontWeight: '600' },
  segmented: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' },
  segmentBtn: { flex: 1, padding: 10, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor },
  emoji: { fontSize: 22 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorSwatch: { width: 34, height: 34, borderRadius: 17 },
  colorSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
});
