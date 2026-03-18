import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import type { Category } from '../../types';

const EMOJIS = ['🍔', '🚗', '🏠', '💊', '📚', '👗', '🎮', '✈️', '⚡', '📱', '💄', '🐾', '💪', '🎬', '🍷', '☕', '💰', '📈', '🎁', '🔧', '🏋️', '🌱', '💻', '🎯'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f43f5e', '#84cc16', '#f97316', '#ec4899'];

interface CategoryFormProps {
  initial?: Partial<Category>;
  onSubmit: (data: Omit<Category, '_id' | 'isDefault'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function CategoryForm({ initial, onSubmit, onCancel, loading }: CategoryFormProps) {
  const { colors } = useTheme();
  const s = styles(colors);

  const [name, setName] = useState(initial?.name ?? '');
  const [type, setType] = useState<'income' | 'expense'>(initial?.type ?? 'expense');
  const [icon, setIcon] = useState(initial?.icon ?? EMOJIS[0]);
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);

  async function handleSubmit() {
    if (!name.trim()) return Alert.alert('Validation', 'Enter a category name');
    await onSubmit({ name: name.trim(), type, icon, color });
  }

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>{initial?._id ? 'Edit Category' : 'Add Category'}</Text>

      {/* Preview */}
      <View style={[s.preview, { backgroundColor: `${color}20` }]}>
        <Text style={s.previewIcon}>{icon}</Text>
        <Text style={[s.previewName, { color: colors.textPrimary }]}>{name || 'Category Name'}</Text>
      </View>

      {/* Name */}
      <Text style={s.label}>Name *</Text>
      <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Category name" placeholderTextColor={colors.textMuted} />

      {/* Type */}
      <Text style={s.label}>Type</Text>
      <View style={s.segmented}>
        {(['expense', 'income'] as const).map((t) => (
          <TouchableOpacity key={t} style={[s.segmentBtn, type === t && { backgroundColor: colors.primary }]} onPress={() => setType(t)}>
            <Text style={[s.segmentText, { color: type === t ? '#fff' : colors.textSecondary }]}>{t === 'expense' ? 'Expense' : 'Income'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Icon picker */}
      <Text style={s.label}>Icon</Text>
      <View style={s.emojiGrid}>
        {EMOJIS.map((e) => (
          <TouchableOpacity key={e} style={[s.emojiBtn, icon === e && { backgroundColor: `${color}30`, borderColor: color }]} onPress={() => setIcon(e)}>
            <Text style={s.emoji}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color picker */}
      <Text style={s.label}>Color</Text>
      <View style={s.colorRow}>
        {COLORS.map((c) => (
          <TouchableOpacity key={c} style={[s.colorSwatch, { backgroundColor: c }, color === c && s.colorSelected]} onPress={() => setColor(c)} />
        ))}
      </View>

      <View style={s.buttons}>
        <TouchableOpacity style={s.cancelBtn} onPress={onCancel}><Text style={[s.cancelText, { color: colors.textSecondary }]}>Cancel</Text></TouchableOpacity>
        <TouchableOpacity style={[s.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
          <Text style={s.submitText}>{loading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = (colors: any) => StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  preview: { alignItems: 'center', borderRadius: 14, padding: 20, marginBottom: 8 },
  previewIcon: { fontSize: 36, marginBottom: 8 },
  previewName: { fontSize: 16, fontWeight: '600' },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, color: colors.textPrimary, padding: 12, fontSize: 14 },
  segmented: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' },
  segmentBtn: { flex: 1, padding: 10, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor },
  emoji: { fontSize: 22 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorSwatch: { width: 34, height: 34, borderRadius: 17 },
  colorSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  submitBtn: { flex: 2, borderRadius: 10, padding: 14, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
