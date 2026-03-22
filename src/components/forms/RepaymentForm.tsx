import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { formStyles } from '../../theme/formStyles';

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
  const fs = useMemo(() => formStyles(colors), [colors]);
  const [amount, setAmount] = useState('');

  async function handleSubmit() {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) return Alert.alert('Validation', 'Enter a valid amount');
    if (num > remainingAmount) return Alert.alert('Validation', `Amount exceeds remaining balance (${currency}${remainingAmount})`);
    await onSubmit(num);
  }

  return (
    <View style={fs.container}>
      <Text style={fs.title}>Record Repayment</Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 2 }}>From: {personName}</Text>
      <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>Remaining: {currency}{remainingAmount.toLocaleString()}</Text>

      <Text style={fs.label}>Repayment Amount *</Text>
      <View style={fs.inputRow}>
        <Text style={fs.currencySymbol}>{currency}</Text>
        <TextInput style={fs.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} autoFocus />
      </View>

      <View style={[fs.buttons, { marginBottom: 0 }]}>
        <TouchableOpacity style={fs.cancelBtn} onPress={onCancel}><Text style={[fs.cancelText, { color: colors.textSecondary }]}>Cancel</Text></TouchableOpacity>
        <TouchableOpacity style={[fs.submitBtn, { backgroundColor: colors.success }]} onPress={handleSubmit} disabled={loading}>
          <Text style={fs.submitText}>{loading ? 'Saving...' : 'Record'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
