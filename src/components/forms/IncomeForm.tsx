import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { Income, Category } from '../../types';
import { toISODate } from '../../utils/date';

interface IncomeFormProps {
  initial?: Partial<Income>;
  categories: Category[];
  onSubmit: (data: Omit<Income, '_id'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function IncomeForm({ initial, categories, onSubmit, onCancel, loading }: IncomeFormProps) {
  const { colors } = useTheme();
  const s = styles(colors);
  const today = toISODate(new Date());

  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [source, setSource] = useState(initial?.source ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [date, setDate] = useState<Date>(initial?.date ? new Date(initial.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const selectedCat = categories.find((c) => c.name === category);

  async function handleSubmit() {
    if (!amount || isNaN(Number(amount))) return Alert.alert('Validation', 'Enter a valid amount');
    if (!category) return Alert.alert('Validation', 'Select a category');
    await onSubmit({ amount: Number(amount), category, source, notes, date: toISODate(date) });
  }

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>{initial?._id ? 'Edit Income' : 'Add Income'}</Text>

      {/* Amount */}
      <Text style={s.label}>Amount *</Text>
      <View style={s.inputRow}>
        <Text style={s.currencySymbol}>৳</Text>
        <TextInput
          style={s.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Category */}
      <Text style={s.label}>Category *</Text>
      <TouchableOpacity style={s.select} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
        <Text style={[s.selectText, { color: category ? colors.textPrimary : colors.textMuted }]}>
          {selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : 'Select category'}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showCategoryPicker && (
        <View style={[s.dropdown, { backgroundColor: colors.bgTertiary }]}>
          {categories.filter((c) => c.type === 'income').map((c) => (
            <TouchableOpacity key={c._id} style={s.dropdownItem} onPress={() => { setCategory(c.name); setShowCategoryPicker(false); }}>
              <Text style={[s.dropdownText, { color: colors.textPrimary }]}>{c.icon} {c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Source */}
      <Text style={s.label}>Source</Text>
      <TextInput style={s.input} value={source} onChangeText={setSource} placeholder="e.g. Salary, Freelance" placeholderTextColor={colors.textMuted} />

      {/* Date */}
      <Text style={s.label}>Date</Text>
      <TouchableOpacity style={s.select} onPress={() => setShowDatePicker(true)}>
        <Text style={[s.selectText, { color: colors.textPrimary }]}>{toISODate(date)}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
      )}

      {/* Notes */}
      <Text style={s.label}>Notes</Text>
      <TextInput style={[s.input, { minHeight: 70 }]} value={notes} onChangeText={setNotes} multiline placeholder="Optional notes" placeholderTextColor={colors.textMuted} />

      {/* Buttons */}
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
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, paddingHorizontal: 12 },
  currencySymbol: { fontSize: 18, color: colors.textMuted, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 18, color: colors.textPrimary, paddingVertical: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, color: colors.textPrimary, padding: 12, fontSize: 14 },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, padding: 12 },
  selectText: { fontSize: 14 },
  dropdown: { borderRadius: 10, marginTop: 4, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderColor },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderColor },
  dropdownText: { fontSize: 14 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  submitBtn: { flex: 2, borderRadius: 10, padding: 14, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
