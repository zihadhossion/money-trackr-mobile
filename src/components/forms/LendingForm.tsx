import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
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
  const s = styles(colors);
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
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>{isEdit ? 'Edit Lending' : 'Add Lending'}</Text>

      {/* Type toggle */}
      <Text style={s.label}>Type</Text>
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

      <Text style={s.label}>Person Name *</Text>
      <TextInput style={s.input} value={personName} onChangeText={setPersonName} placeholder="Name" placeholderTextColor={colors.textMuted} />

      <Text style={s.label}>Amount *</Text>
      <View style={s.inputRow}>
        <Text style={s.currencySymbol}>৳</Text>
        <TextInput style={s.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} />
      </View>

      <Text style={s.label}>Date</Text>
      <TouchableOpacity style={s.select} onPress={() => setShowDatePicker(true)}>
        <Text style={[s.selectText, { color: colors.textPrimary }]}>{toISODate(date)}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker value={date} mode="date" display="default" onChange={(_, d) => { setShowDatePicker(false); if (d) setDate(d); }} />
      )}

      <Text style={s.label}>Due Date (optional)</Text>
      <TouchableOpacity style={s.select} onPress={() => setShowDueDatePicker(true)}>
        <Text style={[s.selectText, { color: dueDate ? colors.textPrimary : colors.textMuted }]}>{dueDate ? toISODate(dueDate) : 'No due date'}</Text>
        <Feather name="calendar" size={16} color={colors.textMuted} />
      </TouchableOpacity>
      {showDueDatePicker && (
        <DateTimePicker value={dueDate ?? new Date()} mode="date" display="default" onChange={(_, d) => { setShowDueDatePicker(false); if (d) setDueDate(d); }} />
      )}

      {isEdit && (
        <>
          <Text style={s.label}>Status</Text>
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

      <Text style={s.label}>Notes</Text>
      <TextInput style={[s.input, { minHeight: 70 }]} value={notes} onChangeText={setNotes} multiline placeholder="Optional notes" placeholderTextColor={colors.textMuted} />

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
  segmented: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: colors.borderColor, overflow: 'hidden' },
  segmentBtn: { flex: 1, padding: 10, alignItems: 'center' },
  segmentText: { fontSize: 14, fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: { flex: 1, borderRadius: 8, borderWidth: 1, borderColor: colors.borderColor, padding: 8, alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, paddingHorizontal: 12 },
  currencySymbol: { fontSize: 18, color: colors.textMuted, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 18, color: colors.textPrimary, paddingVertical: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, color: colors.textPrimary, padding: 12, fontSize: 14 },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, padding: 12 },
  selectText: { fontSize: 14 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  submitBtn: { flex: 2, borderRadius: 10, padding: 14, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
