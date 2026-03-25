import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { formStyles } from '../../theme/formStyles';
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
  const { t } = useTranslation();
  const fs = useMemo(() => formStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

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
    if (!amount || isNaN(Number(amount))) return Alert.alert(t('common.validation'), t('validation.valid_amount'));
    if (!category) return Alert.alert(t('common.validation'), t('validation.select_category'));
    await onSubmit({ amount: Number(amount), category, notes, isRecurring, date: toISODate(date) });
  }

  return (
    <ScrollView style={fs.container} keyboardShouldPersistTaps="handled">
      <Text style={fs.title}>{initial?._id ? t('expenses.edit') : t('expenses.add')}</Text>

      <Text style={fs.label}>{t('common.amount_required')}</Text>
      <View style={fs.inputRow}>
        <Text style={fs.currencySymbol}>৳</Text>
        <TextInput style={fs.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} />
      </View>

      <Text style={fs.label}>{t('common.category_required')}</Text>
      <TouchableOpacity style={fs.select} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
        <Text style={[fs.selectText, { color: category ? colors.textPrimary : colors.textMuted }]}>
          {selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : t('common.select_category')}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showCategoryPicker && (
        <View style={[fs.dropdown, { backgroundColor: colors.bgTertiary }]}>
          {expenseCategories.map((c) => (
            <TouchableOpacity key={c._id} style={fs.dropdownItem} onPress={() => { setCategory(c.name); setShowCategoryPicker(false); }}>
              <Text style={[fs.dropdownText, { color: colors.textPrimary }]}>{c.icon} {c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={fs.label}>{t('common.date')}</Text>
      <TouchableOpacity style={fs.select} onPress={() => setShowDatePicker(true)}>
        <Text style={[fs.selectText, { color: colors.textPrimary }]}>{toISODate(date)}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
      )}

      <Text style={fs.label}>{t('common.notes')}</Text>
      <TextInput style={[fs.input, { minHeight: 70 }]} value={notes} onChangeText={setNotes} multiline placeholder={t('common.optional_notes')} placeholderTextColor={colors.textMuted} />

      <View style={s.switchRow}>
        <Text style={[fs.label, { marginTop: 0, marginBottom: 0 }]}>{t('common.recurring_expense')}</Text>
        <Switch value={isRecurring} onValueChange={setIsRecurring} trackColor={{ true: colors.primary }} />
      </View>

      <View style={fs.buttons}>
        <TouchableOpacity style={fs.cancelBtn} onPress={onCancel}><Text style={[fs.cancelText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text></TouchableOpacity>
        <TouchableOpacity style={[fs.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
          <Text style={fs.submitText}>{loading ? t('common.saving') : t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const localStyles = (colors: any) => StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
});
