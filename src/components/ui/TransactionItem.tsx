import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/date';

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

  return (
    <View style={[styles.row, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={[styles.iconWrap, { backgroundColor: isIncome ? colors.successBg : colors.dangerBg }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.category, { color: colors.textPrimary }]}>{category}</Text>
        {note ? <Text style={[styles.note, { color: colors.textMuted }]} numberOfLines={1}>{note}</Text> : null}
        <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(date)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isIncome ? colors.success : colors.danger }]}>
          {isIncome ? '+' : '-'}{currency}{amount.toLocaleString()}
        </Text>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit} hitSlop={8}>
              <Feather name="edit-2" size={14} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete} hitSlop={8}>
              <Feather name="trash-2" size={14} color={colors.danger} />
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontSize: 20 },
  info: { flex: 1, gap: 2 },
  category: { fontSize: 14, fontWeight: '600' },
  note: { fontSize: 12 },
  date: { fontSize: 12 },
  right: { alignItems: 'flex-end', gap: 6 },
  amount: { fontSize: 15, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10 },
  actionBtn: { padding: 4 },
});
