import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Keyboard } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { formStyles } from '../../theme/formStyles';
import { fontSize } from '../../theme/typography';

interface RepaymentFormProps {
  personName: string;
  remainingAmount: number;
  onSubmit: (amount: number) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function RepaymentForm({ personName, remainingAmount, onSubmit, onCancel, loading }: RepaymentFormProps) {
  const { colors } = useTheme();
  const { symbol, format } = useCurrency();
  const { t } = useTranslation();
  const fs = useMemo(() => formStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);
  const [amount, setAmount] = useState(remainingAmount.toString());
  const [isExceeded, setIsExceeded] = useState(false);

  const handleChangeText = useCallback((text: string) => {
    setAmount(text);
    const num = Number(text);
    setIsExceeded(text !== '' && !isNaN(num) && num > remainingAmount);
  }, [remainingAmount]);

  const numValue = Number(amount);
  const canSubmit = !loading && amount !== '' && !isNaN(numValue) && numValue > 0 && numValue <= remainingAmount;

  async function handleSubmit() {
    Keyboard.dismiss();
    const num = Number(amount);
    if (!amount || isNaN(num) || num <= 0) return Alert.alert(t('common.validation'), t('validation.valid_amount'));
    if (num > remainingAmount) return Alert.alert(t('common.validation'), t('validation.exceeds_balance', { amount: format(remainingAmount) }));
    await onSubmit(num);
  }

  return (
    <View style={fs.container}>
      <Text style={fs.title}>{t('lending.record_repayment')}</Text>
      <Text style={{ fontSize: fontSize.body, color: colors.textSecondary, marginBottom: 2 }}>{t('lending.from', { name: personName })}</Text>
      <Text style={{ fontSize: fontSize.meta, color: colors.textSecondary, marginBottom: 20 }}>{t('lending.remaining_balance', { amount: format(remainingAmount) })}</Text>

      <Text style={fs.label}>{t('common.repayment_amount')}</Text>
      <View style={[fs.inputRow, isExceeded && { borderColor: colors.danger }]}>
        <Text style={fs.currencySymbol}>{symbol}</Text>
        <BottomSheetTextInput
          style={fs.amountInput}
          value={amount}
          onChangeText={handleChangeText}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.textMuted}
          autoFocus
          accessibilityLabel={t('a11y.repayment_amount_input')}
        />
      </View>
      {isExceeded && (
        <Text style={[s.warning, { color: colors.danger }]}>{t('validation.exceeds_balance', { amount: format(remainingAmount) })}</Text>
      )}

      <View style={[fs.buttons, { marginBottom: 0 }]}>
        <TouchableOpacity style={fs.cancelBtn} onPress={() => { Keyboard.dismiss(); onCancel(); }} accessibilityRole="button" accessibilityLabel={t('common.cancel')}><Text style={[fs.cancelText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text></TouchableOpacity>
        <TouchableOpacity
          style={[fs.submitBtn, { backgroundColor: colors.success }, !canSubmit && { opacity: 0.4 }]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel={t('common.record')}
          accessibilityState={{ disabled: !canSubmit, busy: loading }}
        >
          <Text style={fs.submitText}>{loading ? t('common.saving') : t('common.record')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = (colors: any) => StyleSheet.create({
  warning: { fontSize: fontSize.meta, marginTop: 6, fontWeight: '500' as const },
});
