import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
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
    if (!amount || isNaN(Number(amount))) return Alert.alert('Validation', 'Enter a valid amount');
    if (!personName.trim()) return Alert.alert('Validation', 'Enter person name');
    await onSubmit({
      amount: Number(amount), personName, type, status,
      date: toISODate(date), dueDate: dueDate ? toISODate(dueDate) : undefined,
      notes, remainingAmount: Number(amount),
    });
  }

  return (
    <ScrollView style={fs.container} keyboardShouldPersistTaps="handled">
      <Text style={fs.title}>{isEdit ? 'Edit Lending' : 'Add Lending'}</Text>

      {/* Type toggle */}
      <Text style={fs.label}>Type</Text>
      <View style={s.segmented}>
        {([LendingType.LENT, LendingType.BORROWED] as LendingType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.segmentBtn, type === t && { backgroundColor: colors.primary }]}
            onPress={() => setType(t)}
          >
            <Text style={[s.segmentText, { color: type === t ? '#fff' : colors.textSecondary }]}>{t === LendingType.LENT ? 'Lent' : 'Borrowed'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={fs.label}>Person Name *</Text>
      <TextInput style={fs.input} value={personName} onChangeText={setPersonName} placeholder="Name" placeholderTextColor={colors.textMuted} />

      <Text style={fs.label}>Amount *</Text>
      <View style={fs.inputRow}>
        <Text style={fs.currencySymbol}>৳</Text>
        <TextInput style={fs.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} />
      </View>

      <Text style={fs.label}>Date</Text>
      <TouchableOpacity style={fs.select} onPress={() => setShowDatePicker(true)}>
        <Text style={[fs.selectText, { color: colors.textPrimary }]}>{toISODate(date)}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
      )}

      <Text style={fs.label}>Due Date (optional)</Text>
      <TouchableOpacity style={fs.select} onPress={() => setShowDueDatePicker(true)}>
        <Text style={[fs.selectText, { color: dueDate ? colors.textPrimary : colors.textMuted }]}>{dueDate ? toISODate(dueDate) : 'No due date'}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDueDatePicker && (
        <DateTimePicker value={dueDate ?? new Date()} mode="date" display="default" onChange={(_, d) => { setShowDueDatePicker(false); if (d) setDueDate(d); }} />
      )}

      {isEdit && (
        <>
          <Text style={fs.label}>Status</Text>
          <View style={s.statusRow}>
            {([LendingStatus.ACTIVE, LendingStatus.SETTLED, LendingStatus.OVERDUE] as LendingStatus[]).map((st) => (
              <TouchableOpacity
                key={st}
                style={[s.statusBtn, status === st && { backgroundColor: colors.primary }]}
                onPress={() => setStatus(st)}
              >
                <Text style={[s.statusText, { color: status === st ? '#fff' : colors.textSecondary }]}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={fs.label}>Notes</Text>
      <TextInput style={[fs.input, { minHeight: 70 }]} value={notes} onChangeText={setNotes} multiline placeholder="Optional notes" placeholderTextColor={colors.textMuted} />

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
  segmented: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' },
  segmentBtn: { flex: 1, padding: 10, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: colors.borderColor, padding: 8, alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: '600' },
});
