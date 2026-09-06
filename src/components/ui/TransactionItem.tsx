import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { formatDate, DATE_FNS_LOCALES } from '../../utils/date';
import RowAction from './RowAction';
import { TRANSACTION_ROW as R } from '../../theme/shapes';
import { fontSize, fontWeight } from '../../theme/typography';

interface TransactionItemProps {
  icon: string;
  category: string;
  amount: number;
  date: string;
  note?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  isIncome?: boolean;
}

export default React.memo(function TransactionItem({
  icon, category, amount, date, note, onEdit, onDelete, isIncome = false,
}: TransactionItemProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { format } = useCurrency();

  const formattedDate = formatDate(date, DATE_FNS_LOCALES[language]);
  const formattedAmount = `${isIncome ? '+' : '-'}${format(amount)}`;

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
            <RowAction
              icon="edit-2"
              color={colors.primary}
              onPress={onEdit}
              accessibilityLabel={t('a11y.edit_transaction', { category })}
            />
          )}
          {onDelete && (
            <RowAction
              icon="trash-2"
              color={colors.danger}
              onPress={onDelete}
              accessibilityLabel={t('a11y.delete_transaction', { category })}
              accessibilityHint={t('a11y.delete_hint')}
            />
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
  iconText: { fontSize: R.emojiSize },
  info: { flex: 1, gap: 2 },
  category: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  note: { fontSize: fontSize.meta },
  date: { fontSize: fontSize.meta },
  right: { alignItems: 'flex-end', gap: 2 },
  amount: { fontSize: fontSize.body, fontWeight: fontWeight.bold },
  actions: { flexDirection: 'row' },
});
