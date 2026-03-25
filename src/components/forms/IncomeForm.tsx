import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { formStyles } from '../../theme/formStyles';
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
  const { t } = useTranslation();
  const fs = useMemo(() => formStyles(colors), [colors]);

  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [source, setSource] = useState(initial?.source ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [date, setDate] = useState<Date>(initial?.date ? new Date(initial.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const selectedCat = categories.find((c) => c.name === category);

  async function handleSubmit() {
    if (!amount || isNaN(Number(amount))) return Alert.alert(t('common.validation'), t('validation.valid_amount'));
    if (!category) return Alert.alert(t('common.validation'), t('validation.select_category'));
    await onSubmit({ amount: Number(amount), category, source, notes, date: toISODate(date) });
  }

  return (
    <ScrollView style={fs.container} keyboardShouldPersistTaps="handled">
      <Text style={fs.title}>{initial?._id ? t('income.edit') : t('income.add')}</Text>

      {/* Amount */}
      <Text style={fs.label}>{t('common.amount_required')}</Text>
      <View style={fs.inputRow}>
        <Text style={fs.currencySymbol}>৳</Text>
        <TextInput
          style={fs.amountInput}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Category */}
      <Text style={fs.label}>{t('common.category_required')}</Text>
      <TouchableOpacity style={fs.select} onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
        <Text style={[fs.selectText, { color: category ? colors.textPrimary : colors.textMuted }]}>
          {selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : t('common.select_category')}
        </Text>
        <Feather name="chevron-down" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showCategoryPicker && (
        <View style={[fs.dropdown, { backgroundColor: colors.bgTertiary }]}>
          {categories.filter((c) => c.type === 'income').map((c) => (
            <TouchableOpacity key={c._id} style={fs.dropdownItem} onPress={() => { setCategory(c.name); setShowCategoryPicker(false); }}>
              <Text style={[fs.dropdownText, { color: colors.textPrimary }]}>{c.icon} {c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Source */}
      <Text style={fs.label}>{t('common.source')}</Text>
      <TextInput style={fs.input} value={source} onChangeText={setSource} placeholder={t('common.source_placeholder')} placeholderTextColor={colors.textMuted} />

      {/* Date */}
      <Text style={fs.label}>{t('common.date')}</Text>
      <TouchableOpacity style={fs.select} onPress={() => setShowDatePicker(true)}>
        <Text style={[fs.selectText, { color: colors.textPrimary }]}>{toISODate(date)}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
      )}

      {/* Notes */}
      <Text style={fs.label}>{t('common.notes')}</Text>
      <TextInput style={[fs.input, { minHeight: 70 }]} value={notes} onChangeText={setNotes} multiline placeholder={t('common.optional_notes')} placeholderTextColor={colors.textMuted} />

      {/* Buttons */}
      <View style={fs.buttons}>
        <TouchableOpacity style={fs.cancelBtn} onPress={onCancel}><Text style={[fs.cancelText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text></TouchableOpacity>
        <TouchableOpacity style={[fs.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
          <Text style={fs.submitText}>{loading ? t('common.saving') : t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
