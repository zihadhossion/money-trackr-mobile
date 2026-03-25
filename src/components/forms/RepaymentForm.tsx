import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const fs = useMemo(() => formStyles(colors), [colors]);
  const [amount, setAmount] = useState('');

  async function handleSubmit() {
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) return Alert.alert(t('common.validation'), t('validation.valid_amount'));
    if (num > remainingAmount) return Alert.alert(t('common.validation'), t('validation.exceeds_balance', { currency, amount: remainingAmount }));
    await onSubmit(num);
  }

  return (
    <View style={fs.container}>
      <Text style={fs.title}>{t('lending.record_repayment')}</Text>
      <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 2 }}>{t('lending.from', { name: personName })}</Text>
      <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>{t('lending.remaining_balance', { currency, amount: remainingAmount.toLocaleString() })}</Text>

      <Text style={fs.label}>{t('common.repayment_amount')}</Text>
      <View style={fs.inputRow}>
        <Text style={fs.currencySymbol}>{currency}</Text>
        <TextInput style={fs.amountInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" placeholderTextColor={colors.textMuted} autoFocus />
      </View>

      <View style={[fs.buttons, { marginBottom: 0 }]}>
        <TouchableOpacity style={fs.cancelBtn} onPress={onCancel}><Text style={[fs.cancelText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text></TouchableOpacity>
        <TouchableOpacity style={[fs.submitBtn, { backgroundColor: colors.success }]} onPress={handleSubmit} disabled={loading}>
          <Text style={fs.submitText}>{loading ? t('common.saving') : t('common.record')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
