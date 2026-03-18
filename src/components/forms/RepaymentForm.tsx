import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface RepaymentFormProps {
  personName: string;
  remainingAmount: number;
  currency?: string;
  onSubmit: (amount: number) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RepaymentForm({ personName, remainingAmount, currency = '৳', onSubmit, onCancel, loading }: RepaymentFormProps) {
  const { colors } = useTheme();
  const s = styles(colors);
  const [amount, setAmount] = useState('');

  async function handleSubmit() {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) return Alert.alert('Validation', 'Enter a valid amount');
    if (num > remainingAmount) return Alert.alert('Validation', `Amount exceeds remaining balance (${currency}${remainingAmount})`);
    await onSubmit(num);
  }

  return (
    <View style={s.container}>
      <Text style={s.title}>Record Repayment</Text>
      <Text style={s.subtitle}>From: {personName}</Text>
      <Text style={s.remaining}>Remaining: {currency}{remainingAmount.toLocaleString()}</Text>

      <Text style={s.label}>Repayment Amount *</Text>
      <View style={s.inputRow}>
        <Text style={s.symbol}>{currency}</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} autoFocus />
      </View>

      <View style={s.buttons}>
        <TouchableOpacity style={s.cancelBtn} onPress={onCancel}><Text style={[s.cancelText, { color: colors.textSecondary }]}>Cancel</Text></TouchableOpacity>
        <TouchableOpacity style={[s.submitBtn, { backgroundColor: '#10b981' }]} onPress={handleSubmit} disabled={loading}>
          <Text style={s.submitText}>{loading ? 'Saving...' : 'Record'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colors: any) => StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  remaining: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, paddingHorizontal: 12 },
  symbol: { fontSize: 18, color: colors.textMuted, marginRight: 8 },
  input: { flex: 1, fontSize: 18, color: colors.textPrimary, paddingVertical: 12, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  submitBtn: { flex: 2, borderRadius: 10, padding: 14, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
