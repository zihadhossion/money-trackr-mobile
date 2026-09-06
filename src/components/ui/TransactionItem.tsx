import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate, DATE_FNS_LOCALES } from '../../utils/date';
import { TRANSACTION_ROW as R } from '../../theme/shapes';

interface TransactionItemProps {
  icon: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
  currency?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isIncome?: boolean;
}

export default React.memo(function TransactionItem({
  icon, category, amount, date, note, currency = '৳', onEdit, onDelete, isIncome = false,
}: TransactionItemProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const formattedDate = formatDate(date, DATE_FNS_LOCALES[language]);
  const formattedAmount = `${isIncome ? '+' : '-'}${currency}${amount.toLocaleString()}`;

  // One label for the whole row, so a screen reader reads it as a single
  // transaction instead of five disconnected fragments.
  const rowLabel = t(isIncome ? 'a11y.income_item' : 'a11y.expense_item', {
    category,
    amount: formattedAmount,
    date: formattedDate,
  }) + (note ? ` ${note}` : '');

  return (
    <View style={[styles.row, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={styles.summary} accessible accessibilityRole="text" accessibilityLabel={rowLabel}>
        <View style={[styles.iconWrap, { backgroundColor: isIncome ? colors.successBg : colors.dangerBg }]}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.category, { color: colors.textPrimary }]} numberOfLines={1}>{category}</Text>
          {note ? <Text style={[styles.note, { color: colors.textSecondary }]} numberOfLines={1}>{note}</Text> : null}
          <Text style={[styles.date, { color: colors.textMuted }]}>{formattedDate}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? colors.success : colors.danger }]}>
          {formattedAmount}
        </Text>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.edit_transaction', { category })}
            >
              <Feather name="edit-2" size={16} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={t('a11y.delete_transaction', { category })}
              accessibilityHint={t('a11y.delete_hint')}
            >
              <Feather name="trash-2" size={16} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: R.radius,
    padding: R.padding,
    marginBottom: R.marginBottom,
    borderWidth: 1,
    gap: R.gap,
  },
  summary: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: R.gap },
  iconWrap: {
    width: R.iconSize,
    height: R.iconSize,
    borderRadius: R.iconRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  category: { fontSize: 14, fontWeight: '600' },
  note: { fontSize: 12 },
  date: { fontSize: 12 },
  right: { alignItems: 'flex-end', gap: 2 },
  amount: { fontSize: 15, fontWeight: '700' },
  actions: { flexDirection: 'row' },
  actionBtn: {
    width: R.actionSize,
    height: R.actionSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
