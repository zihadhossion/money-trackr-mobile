import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { formStyles } from '../../theme/formStyles';
import type { Lending } from '../../types';
import { LendingType } from '../../enums/lending-type.enum';
import { LendingStatus } from '../../enums/lending-status.enum';
import { toISODate } from '../../utils/date';

interface LendingFormProps {
  initial?: Partial<Lending>;
  onSubmit: (data: Omit<Lending, '_id'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function LendingForm({ initial, onSubmit, onCancel, loading }: LendingFormProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const fs = useMemo(() => formStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);
  const isEdit = !!initial?._id;

  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '');
  const [personName, setPersonName] = useState(initial?.personName ?? '');
  const [type, setType] = useState<LendingType>(initial?.type ?? LendingType.LENT);
  const [status, setStatus] = useState<LendingStatus>(initial?.status ?? LendingStatus.ACTIVE);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [date, setDate] = useState<Date>(initial?.date ? new Date(initial.date) : new Date());
  const [dueDate, setDueDate] = useState<Date | null>(initial?.dueDate ? new Date(initial.dueDate) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  async function handleSubmit() {
    if (!amount || isNaN(Number(amount))) return Alert.alert(t('common.validation'), t('validation.valid_amount'));
    if (!personName.trim()) return Alert.alert(t('common.validation'), t('validation.enter_person_name'));
    await onSubmit({
      amount: Number(amount), personName, type, status,
      date: toISODate(date), dueDate: dueDate ? toISODate(dueDate) : undefined,
      notes, remainingAmount: Number(amount),
    });
  }

  return (
    <ScrollView style={fs.container} keyboardShouldPersistTaps="handled">
      <Text style={fs.title}>{isEdit ? t('lending.edit') : t('lending.add')}</Text>

      {/* Type toggle */}
      <Text style={fs.label}>{t('common.type')}</Text>
      <View style={s.segmented}>
        {([LendingType.LENT, LendingType.BORROWED] as LendingType[]).map((lType) => (
          <TouchableOpacity
            key={lType}
            style={[s.segmentBtn, type === lType && { backgroundColor: colors.primary }]}
            onPress={() => setType(lType)}
          >
            <Text style={[s.segmentText, { color: type === lType ? '#fff' : colors.textSecondary }]}>{lType === LendingType.LENT ? t('lending.lent') : t('lending.borrowed')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={fs.label}>{t('common.person_name')}</Text>
      <TextInput style={fs.input} value={personName} onChangeText={setPersonName} placeholder={t('common.person_name_placeholder')} placeholderTextColor={colors.textMuted} />

      <Text style={fs.label}>{t('common.amount_required')}</Text>
      <View style={fs.inputRow}>
        <Text style={fs.currencySymbol}>৳</Text>
        <TextInput style={fs.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} />
      </View>

      <Text style={fs.label}>{t('common.date')}</Text>
      <TouchableOpacity style={fs.select} onPress={() => setShowDatePicker(true)}>
        <Text style={[fs.selectText, { color: colors.textPrimary }]}>{toISODate(date)}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
      )}

      <Text style={fs.label}>{t('common.due_date')}</Text>
      <TouchableOpacity style={fs.select} onPress={() => setShowDueDatePicker(true)}>
        <Text style={[fs.selectText, { color: dueDate ? colors.textPrimary : colors.textMuted }]}>{dueDate ? toISODate(dueDate) : t('common.no_due_date')}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDueDatePicker && (
        <DateTimePicker value={dueDate ?? new Date()} mode="date" display="default" onChange={(_, d) => { setShowDueDatePicker(false); if (d) setDueDate(d); }} />
      )}

      {isEdit && (
        <>
          <Text style={fs.label}>{t('common.status')}</Text>
          <View style={s.statusRow}>
            {([LendingStatus.ACTIVE, LendingStatus.SETTLED, LendingStatus.OVERDUE] as LendingStatus[]).map((st) => {
              const statusLabels: Record<LendingStatus, string> = {
                [LendingStatus.ACTIVE]: t('lending.status_active'),
                [LendingStatus.SETTLED]: t('lending.status_settled'),
                [LendingStatus.OVERDUE]: t('lending.status_overdue'),
              };
              return (
                <TouchableOpacity
                  key={st}
                  style={[s.statusBtn, status === st && { backgroundColor: colors.primary }]}
                  onPress={() => setStatus(st)}
                >
                  <Text style={[s.statusText, { color: status === st ? '#fff' : colors.textSecondary }]}>{statusLabels[st]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <Text style={fs.label}>{t('common.notes')}</Text>
      <TextInput style={[fs.input, { minHeight: 70 }]} value={notes} onChangeText={setNotes} multiline placeholder={t('common.optional_notes')} placeholderTextColor={colors.textMuted} />

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
  segmented: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' },
  segmentBtn: { flex: 1, padding: 10, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: colors.borderColor, padding: 8, alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: '600' },
});
