import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate, DATE_FNS_LOCALES } from '../../utils/date';
import type { Lending } from '../../types';
import { LendingType } from '../../enums/lending-type.enum';
import { LendingStatus } from '../../enums/lending-status.enum';

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
  const isLent = item.type === LendingType.LENT;

  const statusColors: Record<LendingStatus, { bg: string; text: string }> = {
    [LendingStatus.ACTIVE]:   { bg: colors.successBg, text: colors.successText },
    [LendingStatus.SETTLED]:  { bg: colors.primaryBg, text: colors.primaryText },
    [LendingStatus.OVERDUE]:  { bg: colors.dangerBg, text: colors.dangerText },
  };
  const statusStyle = statusColors[item.status] ?? statusColors[LendingStatus.ACTIVE];

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeIcon, { backgroundColor: isLent ? colors.successBg : colors.dangerBg }]}>
            <Feather name={isLent ? 'arrow-up-right' : 'arrow-down-left'} size={16} color={isLent ? colors.success : colors.danger} />
          </View>
          <View>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{item.personName}</Text>
            <Text style={[styles.typeLabel, { color: colors.textMuted }]}>{isLent ? t('lending.lent') : t('lending.borrowed')} • {formatDate(item.date, DATE_FNS_LOCALES[language])}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>
            {item.status === LendingStatus.ACTIVE ? t('lending.status_active') : item.status === LendingStatus.SETTLED ? t('lending.status_settled') : t('lending.status_overdue')}
          </Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <View>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>{t('lending.amount')}</Text>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>{'৳'}{item.amount.toLocaleString()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>{t('lending.remaining')}</Text>
          <Text style={[styles.amount, { color: item.remainingAmount > 0 ? colors.warning : colors.success }]}>
            {'৳'}{item.remainingAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      {item.dueDate && (
        <Text style={[styles.dueDate, { color: colors.textMuted }]}>{t('lending.due', { date: formatDate(item.dueDate, DATE_FNS_LOCALES[language]) })}</Text>
      )}

      <View style={styles.actions}>
        {item.status !== LendingStatus.SETTLED && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.successBg }]} onPress={onRepay}>
            <Feather name="check-circle" size={13} color={colors.success} />
            <Text style={[styles.btnText, { color: colors.success }]}>{t('lending.repay')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, { backgroundColor: `${colors.primary}15` }]} onPress={onEdit}>
          <Feather name="edit-2" size={13} color={colors.primary} />
          <Text style={[styles.btnText, { color: colors.primary }]}>{t('common.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.dangerBg }]} onPress={onDelete}>
          <Feather name="trash-2" size={13} color={colors.danger} />
          <Text style={[styles.btnText, { color: colors.danger }]}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: '600' },
  typeLabel: { fontSize: 12 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between' },
  amountLabel: { fontSize: 11, marginBottom: 2 },
  amount: { fontSize: 16, fontWeight: '700' },
  dueDate: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  btnText: { fontSize: 12, fontWeight: '600' },
});
