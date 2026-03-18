import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { Expense, Category } from '../../types';
import { toISODate } from '../../utils/date';

interface ExpenseFormProps {
  initial?: Partial<Expense>;
  categories: Category[];
  onSubmit: (data: Omit<Expense, '_id'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ExpenseForm({ initial, categories, onSubmit, onCancel, loading }: ExpenseFormProps) {
  const { colors } = useTheme();
  const s = styles(colors);

  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [isRecurring, setIsRecurring] = useState(initial?.isRecurring ?? false);
  const [date, setDate] = useState<Date>(initial?.date ? new Date(initial.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const selectedCat = expenseCategories.find((c) => c.name === category);

  async function handleSubmit() {
    if (!amount || isNaN(Number(amount))) return Alert.alert('Validation', 'Enter a valid amount');
    if (!category) return Alert.alert('Validation', 'Select a category');
    await onSubmit({ amount: Number(amount), category, notes, isRecurring, date: toISODate(date) });
  }

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>{initial?._id ? 'Edit Expense' : 'Add Expense'}</Text>

      <Text style={s.label}>Amount *</Text>
      <View style={s.inputRow}>
        <Text style={s.currencySymbol}>৳</Text>
        <TextInput style={s.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} />
      </View>

      <Text style={s.label}>Category *</Text>
      <TouchableOpacity style={s.select} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
        <Text style={[s.selectText, { color: category ? colors.textPrimary : colors.textMuted }]}>
          {selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : 'Select category'}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showCategoryPicker && (
        <View style={[s.dropdown, { backgroundColor: colors.bgTertiary }]}>
          {expenseCategories.map((c) => (
            <TouchableOpacity key={c._id} style={s.dropdownItem} onPress={() => { setCategory(c.name); setShowCategoryPicker(false); }}>
              <Text style={[s.dropdownText, { color: colors.textPrimary }]}>{c.icon} {c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={s.label}>Date</Text>
      <TouchableOpacity style={s.select} onPress={() => setShowDatePicker(true)}>
        <Text style={[s.selectText, { color: colors.textPrimary }]}>{toISODate(date)}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
      )}

      <Text style={s.label}>Notes</Text>
      <TextInput style={[s.input, { minHeight: 70 }]} value={notes} onChangeText={setNotes} multiline placeholder="Optional notes" placeholderTextColor={colors.textMuted} />

      <View style={s.switchRow}>
        <Text style={[s.label, { marginTop: 0, marginBottom: 0 }]}>Recurring expense</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} trackColor={{ true: colors.primary }} />
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
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  submitBtn: { flex: 2, borderRadius: 10, padding: 14, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
