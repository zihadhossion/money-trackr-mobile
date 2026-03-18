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
import ExpenseForm from '../../src/components/forms/ExpenseForm';
import { expenseService } from '../../src/services/expenseService';
import { categoryService } from '../../src/services/categoryService';
import { getMonthDateRange } from '../../src/utils/date';
import { formatCurrency } from '../../src/utils/currency';
import type { Expense, Category } from '../../src/types';

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const s = styles(colors);
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [showCatFilter, setShowCatFilter] = useState(false);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['90%'];

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const fetchData = useCallback(async () => {
    const { startDate, endDate } = getMonthDateRange(year, month);
    try {
      const [data, cats] = await Promise.all([
        expenseService.getAll(startDate, endDate, filterCategory || undefined),
        categoryService.getAll('expense'),
      ]);
      setExpenses(data);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year, month, filterCategory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); sheetRef.current?.expand(); };
  const openEdit = (item: Expense) => { setEditing(item); sheetRef.current?.expand(); };
  const closeSheet = () => { sheetRef.current?.close(); setEditing(null); };

  const handleSubmit = async (data: Omit<Expense, '_id'>) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await expenseService.update(editing._id, data);
        setExpenses((prev) => prev.map((e) => (e._id === editing._id ? updated : e)));
      } else {
        const created = await expenseService.create(data);
        setExpenses((prev) => [created, ...prev]);
      }
      closeSheet();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Expense) => {
    Alert.alert('Delete Expense', 'Delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await expenseService.delete(item._id);
            setExpenses((prev) => prev.filter((e) => e._id !== item._id));
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const getCategoryIcon = (catName: string) =>
    categories.find((c) => c.name === catName)?.icon ?? '💸';

  const expenseCats = categories.filter((c) => c.type === 'expense');

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={s.header}>
        <View>
          <Text style={[s.title, { color: colors.textPrimary }]}>Expenses</Text>
          <Text style={[s.total, { color: '#ef4444' }]}>{formatCurrency(total)}</Text>
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

        {/* Category filter */}
        <TouchableOpacity style={[s.filterBtn, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]} onPress={() => setShowCatFilter(!showCatFilter)}>
          <Text style={[s.filterText, { color: filterCategory ? colors.textPrimary : colors.textMuted }]}>
            {filterCategory || 'All Categories'}
          </Text>
          <Feather name="chevron-down" size={14} color={colors.textMuted} />
        </TouchableOpacity>
        {showCatFilter && (
          <View style={[s.dropdown, { backgroundColor: colors.bgTertiary, borderColor: colors.borderColor }]}>
            <TouchableOpacity style={s.dropItem} onPress={() => { setFilterCategory(''); setShowCatFilter(false); }}>
              <Text style={{ color: colors.textPrimary, fontSize: 14 }}>All Categories</Text>
            </TouchableOpacity>
            {expenseCats.map((c) => (
              <TouchableOpacity key={c._id} style={s.dropItem} onPress={() => { setFilterCategory(c.name); setShowCatFilter(false); }}>
                <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{c.icon} {c.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : expenses.length === 0 ? (
          <EmptyState icon="trending-down" title="No expenses this month" subtitle="Tap + Add to record an expense" onAction={openAdd} actionLabel="Add Expense" />
        ) : (
          expenses.map((item) => (
            <TransactionItem
              key={item._id}
              icon={getCategoryIcon(item.category)}
              category={item.category}
              amount={item.amount}
              date={item.date}
              note={item.notes}
              isIncome={false}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          ))
        )}
      </ScrollView>

      <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose backgroundStyle={{ backgroundColor: colors.bgPrimary }} handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <BottomSheetScrollView>
          <ExpenseForm
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
  filterBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8 },
  filterText: { fontSize: 13 },
  dropdown: { borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
});
