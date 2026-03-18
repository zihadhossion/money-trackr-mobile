import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import MonthYearPicker from '../../src/components/ui/MonthYearPicker';
import TransactionItem from '../../src/components/ui/TransactionItem';
import EmptyState from '../../src/components/ui/EmptyState';
import IncomeForm from '../../src/components/forms/IncomeForm';
import { incomeService } from '../../src/services/incomeService';
import { categoryService } from '../../src/services/categoryService';
import { getMonthDateRange } from '../../src/utils/date';
import { formatCurrency } from '../../src/utils/currency';
import type { Income, Category } from '../../src/types';

export default function IncomeScreen() {
  const { colors } = useTheme();
  const s = styles(colors);
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['90%'];

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

  const openAdd = () => { setEditing(null); sheetRef.current?.expand(); };
  const openEdit = (item: Income) => { setEditing(item); sheetRef.current?.expand(); };
  const closeSheet = () => { sheetRef.current?.close(); setEditing(null); };

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
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={s.header}>
        <View>
          <Text style={[s.title, { color: colors.textPrimary }]}>Income</Text>
          <Text style={[s.total, { color: '#10b981' }]}>{formatCurrency(total)}</Text>
        </View>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
          <Feather name="plus" size={20} color="#fff" />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
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

const styles = (colors: any) => StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  total: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  scroll: { padding: 16, paddingTop: 8, paddingBottom: 100 },
});
