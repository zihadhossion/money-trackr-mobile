import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { formatDate, DATE_FNS_LOCALES } from '../../utils/date';
import type { Lending } from '../../types';
import { LendingType } from '../../enums/lending-type.enum';
import { LendingStatus } from '../../enums/lending-status.enum';
import RowAction from './RowAction';
import { LENDING_CARD as C } from '../../theme/shapes';
import { fontSize, fontWeight } from '../../theme/typography';

interface LendingItemProps {
  item: Lending;
  onEdit: () => void;
  onDelete: () => void;
  onRepay: () => void;
}

export default React.memo(function LendingItem({ item, onEdit, onDelete, onRepay }: LendingItemProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { format } = useCurrency();
  const isLent = item.type === LendingType.LENT;

  const statusColors: Record<LendingStatus, { bg: string; text: string }> = {
    [LendingStatus.PENDING]:  { bg: colors.dangerBg, text: colors.dangerText },
    [LendingStatus.PAID]:     { bg: colors.successBg, text: colors.successText },
    [LendingStatus.PARTIAL]:  { bg: colors.primaryBg, text: colors.primaryText },
  };
  const statusStyle = statusColors[item.status] ?? statusColors[LendingStatus.PENDING];

  const typeLabel = isLent ? t('lending.lent') : t('lending.borrowed');
  const statusLabel = item.status === LendingStatus.PAID
    ? t('lending.status_paid')
    : item.status === LendingStatus.PARTIAL
      ? t('lending.status_partial')
      : t('lending.status_pending');
  const cardLabel = t('a11y.lending_item', {
    type: typeLabel,
    name: item.personName,
    amount: format(item.amount),
    remaining: format(item.remainingAmount),
    status: statusLabel,
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={styles.details} accessible accessibilityRole="text" accessibilityLabel={cardLabel}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.typeIcon, { backgroundColor: isLent ? colors.successBg : colors.dangerBg }]}>
              <Feather name={isLent ? 'arrow-up-right' : 'arrow-down-left'} size={16} color={isLent ? colors.success : colors.danger} />
            </View>
            <View>
              <Text style={[styles.name, { color: colors.textPrimary }]}>{item.personName}</Text>
              <Text style={[styles.typeLabel, { color: colors.textSecondary }]}>{typeLabel} • {formatDate(item.date, DATE_FNS_LOCALES[language])}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.amountRow}>
          <View>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>{t('lending.amount')}</Text>
            <Text style={[styles.amount, { color: colors.textPrimary }]}>{format(item.amount)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.amountLabel, { color: colors.textMuted }]}>{t('lending.remaining')}</Text>
            <Text style={[styles.amount, { color: item.remainingAmount > 0 ? colors.warning : colors.success }]}>
              {format(item.remainingAmount)}
            </Text>
          </View>
        </View>

        {item.dueDate && (
          <Text style={[styles.dueDate, { color: colors.textSecondary }]}>{t('lending.due', { date: formatDate(item.dueDate, DATE_FNS_LOCALES[language]) })}</Text>
        )}
      </View>

      {/* Repay is the only action that can disappear, so the row is anchored to
          the right edge: edit and delete keep their position either way. */}
      <View style={styles.actions}>
        {item.status !== LendingStatus.PAID && (
          <RowAction
            icon="check-circle"
            color={colors.success}
            onPress={onRepay}
            accessibilityLabel={t('a11y.repay_lending', { name: item.personName })}
          />
        )}
        <RowAction
          icon="edit-2"
          color={colors.primary}
          onPress={onEdit}
          accessibilityLabel={t('a11y.edit_lending', { name: item.personName })}
        />
        <RowAction
          icon="trash-2"
          color={colors.danger}
          onPress={onDelete}
          accessibilityLabel={t('a11y.delete_lending', { name: item.personName })}
          accessibilityHint={t('a11y.delete_hint')}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: C.radius, padding: C.padding, borderWidth: 1, marginBottom: C.marginBottom, gap: C.gap },
  details: { gap: C.gap },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeIcon: { width: C.iconSize, height: C.iconSize, borderRadius: C.iconRadius, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  typeLabel: { fontSize: fontSize.meta },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: fontSize.meta, fontWeight: fontWeight.semibold },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountLabel: { fontSize: fontSize.caption, marginBottom: 2 },
  amount: { fontSize: fontSize.emphasis, fontWeight: fontWeight.bold },
  dueDate: { fontSize: fontSize.meta },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
});
