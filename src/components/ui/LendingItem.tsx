import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/date';
import type { Lending } from '../../types';
import { LendingType } from '../../enums/lending-type.enum';
import { LendingStatus } from '../../enums/lending-status.enum';

interface LendingItemProps {
  item: Lending;
  currency?: string;
  onEdit: () => void;
  onDelete: () => void;
  onRepay: () => void;
}

const statusColors: Record<LendingStatus, { bg: string; text: string }> = {
  [LendingStatus.ACTIVE]:   { bg: '#d1fae5', text: '#065f46' },
  [LendingStatus.SETTLED]:  { bg: '#e0e7ff', text: '#3730a3' },
  [LendingStatus.OVERDUE]:  { bg: '#fee2e2', text: '#991b1b' },
};

export default function LendingItem({ item, currency = '৳', onEdit, onDelete, onRepay }: LendingItemProps) {
  const { colors } = useTheme();
  const isLent = item.type === LendingType.LENT;
  const statusStyle = statusColors[item.status] ?? statusColors[LendingStatus.ACTIVE];

  return (
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.typeIcon, { backgroundColor: isLent ? '#d1fae5' : '#fee2e2' }]}>
            <Feather name={isLent ? 'arrow-up-right' : 'arrow-down-left'} size={16} color={isLent ? '#10b981' : '#ef4444'} />
          </View>
          <View>
            <Text style={[styles.name, { color: colors.textPrimary }]}>{item.personName}</Text>
            <Text style={[styles.typeLabel, { color: colors.textMuted }]}>{isLent ? 'Lent' : 'Borrowed'} • {formatDate(item.date)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <View>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Amount</Text>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>{currency}{item.amount.toLocaleString()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>Remaining</Text>
          <Text style={[styles.amount, { color: item.remainingAmount > 0 ? '#f59e0b' : '#10b981' }]}>
            {currency}{item.remainingAmount.toLocaleString()}
          </Text>
        </View>
      </View>

      {item.dueDate && (
        <Text style={[styles.dueDate, { color: colors.textMuted }]}>Due: {formatDate(item.dueDate)}</Text>
      )}

      <View style={styles.actions}>
        {item.status !== LendingStatus.SETTLED && (
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#d1fae5' }]} onPress={onRepay}>
            <Feather name="check-circle" size={13} color="#10b981" />
            <Text style={[styles.btnText, { color: '#10b981' }]}>Repay</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.btn, { backgroundColor: `${colors.primary}15` }]} onPress={onEdit}>
          <Feather name="edit-2" size={13} color={colors.primary} />
          <Text style={[styles.btnText, { color: colors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#fee2e2' }]} onPress={onDelete}>
          <Feather name="trash-2" size={13} color="#ef4444" />
          <Text style={[styles.btnText, { color: '#ef4444' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
