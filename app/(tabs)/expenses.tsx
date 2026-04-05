import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useBottomSheet } from '../../src/hooks/useBottomSheet';
import MonthYearPicker from '../../src/components/ui/MonthYearPicker';
import TransactionItem from '../../src/components/ui/TransactionItem';
import EmptyState from '../../src/components/ui/EmptyState';
import ExpenseForm from '../../src/components/forms/ExpenseForm';
import { expenseService } from '../../src/services/expenseService';
import { categoryService } from '../../src/services/categoryService';
import { getMonthDateRange } from '../../src/utils/date';
import { formatCurrency } from '../../src/utils/currency';
import { screenStyles } from '../../src/theme/screenStyles';
import type { Expense, Category } from '../../src/types';

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCatFilter, setShowCatFilter] = useState(false);

  const { sheetRef, snapPoints, editing, openAdd, openEdit, closeSheet } = useBottomSheet<Expense>();

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
      Alert.alert(t('common.error'), e.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Expense) => {
    Alert.alert(t('expenses.delete_title'), t('expenses.delete_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          try {
            await expenseService.delete(item._id);
            setExpenses((prev) => prev.filter((e) => e._id !== item._id));
          } catch (e: any) {
            Alert.alert(t('common.error'), e.message || t('common.error'));
          }
        },
      },
    ]);
  };

  const getCategoryIcon = (catName: string) =>
    categories.find((c) => c.name === catName)?.icon ?? '💸';

  const expenseCats = categories.filter((c) => c.type === 'expense');

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={[ss.header, { alignItems: 'flex-start' }]}>
        <View>
          <Text style={[ss.title, { color: colors.textPrimary }]}>{t('expenses.title')}</Text>
          <Text style={[s.total, { color: colors.danger }]}>{formatCurrency(total)}</Text>
        </View>
        <TouchableOpacity style={[ss.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
          <Feather name="plus" size={20} color="#fff" />
          <Text style={ss.addBtnText}>{t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={ss.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
      >
        <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

        {/* Category filter */}
        <TouchableOpacity style={[s.filterBtn, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]} onPress={() => setShowCatFilter(!showCatFilter)}>
          <Text style={[s.filterText, { color: filterCategory ? colors.textPrimary : colors.textMuted }]}>
            {filterCategory || t('common.all_categories')}
          </Text>
          <Feather name="chevron-down" size={14} color={colors.textMuted} />
        </TouchableOpacity>
        {showCatFilter && (
          <View style={[s.dropdown, { backgroundColor: colors.bgTertiary, borderColor: colors.borderColor }]}>
            <TouchableOpacity style={s.dropItem} onPress={() => { setFilterCategory(''); setShowCatFilter(false); }}>
              <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{t('common.all_categories')}</Text>
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
          <EmptyState icon="trending-down" title={t('expenses.empty_title')} subtitle={t('expenses.empty_subtitle')} onAction={openAdd} actionLabel={t('expenses.add')} />
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

const localStyles = (colors: any) => StyleSheet.create({
  total: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  filterBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8 },
  filterText: { fontSize: 13 },
  dropdown: { borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
});
