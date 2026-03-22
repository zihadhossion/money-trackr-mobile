import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useBottomSheet } from '../../src/hooks/useBottomSheet';
import MonthYearPicker from '../../src/components/ui/MonthYearPicker';
import TransactionItem from '../../src/components/ui/TransactionItem';
import EmptyState from '../../src/components/ui/EmptyState';
import IncomeForm from '../../src/components/forms/IncomeForm';
import { incomeService } from '../../src/services/incomeService';
import { categoryService } from '../../src/services/categoryService';
import { getMonthDateRange } from '../../src/utils/date';
import { formatCurrency } from '../../src/utils/currency';
import { screenStyles } from '../../src/theme/screenStyles';
import type { Income, Category } from '../../src/types';

export default function IncomeScreen() {
  const { colors } = useTheme();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { sheetRef, snapPoints, editing, openAdd, openEdit, closeSheet } = useBottomSheet<Income>();

  const total = incomes.reduce((sum, i) => sum + i.amount, 0);

  const fetchData = useCallback(async () => {
    const { startDate, endDate } = getMonthDateRange(year, month);
    try {
      const [data, cats] = await Promise.all([
        incomeService.getAll(startDate, endDate),
        categoryService.getAll('income'),
      ]);
      setIncomes(data);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (data: Omit<Income, '_id'>) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await incomeService.update(editing._id, data);
        setIncomes((prev) => prev.map((i) => (i._id === editing._id ? updated : i)));
      } else {
        const created = await incomeService.create(data);
        setIncomes((prev) => [created, ...prev]);
      }
      closeSheet();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Income) => {
    Alert.alert('Delete Income', `Delete this income entry?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await incomeService.delete(item._id);
            setIncomes((prev) => prev.filter((i) => i._id !== item._id));
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const getCategoryIcon = (catName: string) => {
    return categories.find((c) => c.name === catName)?.icon ?? '💰';
  };

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={[ss.header, { alignItems: 'flex-start' }]}>
        <View>
          <Text style={[ss.title, { color: colors.textPrimary }]}>Income</Text>
          <Text style={[s.total, { color: colors.success }]}>{formatCurrency(total)}</Text>
        </View>
        <TouchableOpacity style={[ss.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
          <Feather name="plus" size={20} color="#fff" />
          <Text style={ss.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={ss.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
      >
        <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : incomes.length === 0 ? (
          <EmptyState icon="trending-up" title="No income this month" subtitle="Tap + Add to record your income" onAction={openAdd} actionLabel="Add Income" />
        ) : (
          incomes.map((item) => (
            <TransactionItem
              key={item._id}
              icon={getCategoryIcon(item.category)}
              category={item.category}
              amount={item.amount}
              date={item.date}
              note={item.source || item.notes}
              isIncome
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          ))
        )}
      </ScrollView>

      <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose backgroundStyle={{ backgroundColor: colors.bgPrimary }} handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <BottomSheetScrollView>
          <IncomeForm
            initial={editing ?? undefined}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={closeSheet}
            loading={saving}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const localStyles = (colors: any) => StyleSheet.create({
  total: { fontSize: 16, fontWeight: '600', marginTop: 2 },
});
