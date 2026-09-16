import React, { useState, useMemo, type RefObject } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { BottomSheetTextInput, type BottomSheetScrollViewMethods } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { formStyles } from '../../theme/formStyles';
import QuickCategoryCreator from '../ui/QuickCategoryCreator';
import type { Expense, Category } from '../../types';
import { toISODate } from '../../utils/date';

interface ExpenseFormProps {
  initial?: Partial<Expense>;
  categories: Category[];
  onSubmit: (data: Omit<Expense, '_id'>) => Promise<void>;
  onCreateCategory: (data: Omit<Category, '_id' | 'isDefault'>) => Promise<Category>;
  /** The sheet's scroll view, so the inline category creator can scroll clear of the keyboard. */
  scrollRef: RefObject<BottomSheetScrollViewMethods | null>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ExpenseForm({ initial, categories, onSubmit, onCreateCategory, scrollRef, onCancel, loading }: ExpenseFormProps) {
  const { colors } = useTheme();
  const { symbol } = useCurrency();
  const { t } = useTranslation();
  const fs = useMemo(() => formStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [date, setDate] = useState<Date>(initial?.date ? new Date(initial.date) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const selectedCat = expenseCategories.find((c) => c.name === category);

  function closePicker() {
    setShowCategoryPicker(false);
    setAddingCategory(false);
  }

  // Stray taps and scrolls close the picker, except mid-way through adding a
  // category, where they would discard the half-typed name.
  function dismissPicker() {
    if (!addingCategory) closePicker();
  }

  async function handleSubmit() {
    if (!amount || isNaN(Number(amount))) return Alert.alert(t('common.validation'), t('validation.valid_amount'));
    if (!category) return Alert.alert(t('common.validation'), t('validation.select_category'));
    await onSubmit({ amount: Number(amount), category, notes, date: toISODate(date) });
  }

  return (
    <ScrollView
      style={fs.container}
      keyboardShouldPersistTaps="handled"
      onScrollBeginDrag={dismissPicker}
    >
      {/* Tapping any inert part of the form dismisses the open picker. */}
      <Pressable onPress={dismissPicker} accessible={false}>
        <Text style={fs.title}>{initial?._id ? t('expenses.edit') : t('expenses.add')}</Text>

        <Text style={fs.label}>{t('common.amount_required')}</Text>
        <View style={fs.inputRow}>
          <Text style={fs.currencySymbol}>{symbol}</Text>
          <BottomSheetTextInput style={fs.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} accessibilityLabel={t('a11y.amount_input')} />
        </View>

        <Text style={fs.label}>{t('common.category_required')}</Text>
        <TouchableOpacity
          style={fs.select}
          onPress={() => (showCategoryPicker ? closePicker() : setShowCategoryPicker(true))}
          accessibilityRole="button"
          accessibilityLabel={selectedCat ? selectedCat.name : t('common.select_category')}
          accessibilityState={{ expanded: showCategoryPicker }}
        >
          <Text style={[fs.selectText, { color: category ? colors.textPrimary : colors.textMuted }]}>
            {selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : t('common.select_category')}
          </Text>
          <Feather name="chevron-down" size={16} color={colors.textMuted} />
        </TouchableOpacity>
        {showCategoryPicker && (
          // No inner ScrollView: a plain one isn't part of the sheet's gesture
          // system, so the sheet's pan cancels its drag. The list renders in
          // full and the sheet's own scroll view moves it.
          <View style={[fs.dropdown, { backgroundColor: colors.bgTertiary }]}>
            {expenseCategories.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={fs.dropdownItem}
                onPress={() => { setCategory(c.name); closePicker(); }}
                accessibilityRole="button"
                accessibilityLabel={c.name}
                accessibilityState={{ selected: category === c.name }}
              >
                <Text style={[fs.dropdownText, { color: colors.textPrimary }]}>{c.icon} {c.name}</Text>
              </TouchableOpacity>
            ))}
            <QuickCategoryCreator
              type="expense"
              existing={expenseCategories}
              scrollRef={scrollRef}
              open={addingCategory}
              onOpen={() => setAddingCategory(true)}
              onClose={() => setAddingCategory(false)}
              onCreate={onCreateCategory}
              onCreated={(c) => { setCategory(c.name); closePicker(); }}
            />
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
        <BottomSheetTextInput style={[fs.input, { minHeight: 70 }]} value={notes} onChangeText={setNotes} multiline placeholder={t('common.optional_notes')} placeholderTextColor={colors.textMuted} accessibilityLabel={t('a11y.notes_input')} />

        <View style={fs.buttons}>
          <TouchableOpacity style={fs.cancelBtn} onPress={onCancel}><Text style={[fs.cancelText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text></TouchableOpacity>
          <TouchableOpacity style={[fs.submitBtn, { backgroundColor: colors.primary }]} onPress={handleSubmit} disabled={loading}>
            <Text style={fs.submitText}>{loading ? t('common.saving') : t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </ScrollView>
  );
}

const localStyles = (colors: any) => StyleSheet.create({});
