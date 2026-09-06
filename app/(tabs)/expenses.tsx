import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, Pressable,
  Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import type { Colors } from '../../src/theme/colors';
import { useBottomSheet } from '../../src/hooks/useBottomSheet';
import { usePagination } from '../../src/hooks/usePagination';
import { useRefreshOnFocus } from '../../src/hooks/useRefreshOnFocus';
import MonthYearPicker from '../../src/components/ui/MonthYearPicker';
import TransactionItem from '../../src/components/ui/TransactionItem';
import EmptyState from '../../src/components/ui/EmptyState';
import ErrorState from '../../src/components/ui/ErrorState';
import PaginationFooter from '../../src/components/ui/PaginationFooter';
import ExpenseForm from '../../src/components/forms/ExpenseForm';
import { expenseService } from '../../src/services/expenseService';
import { categoryService } from '../../src/services/categoryService';
import { getMonthDateRange } from '../../src/utils/date';
import { formatCurrency } from '../../src/utils/currency';
import { screenStyles } from '../../src/theme/screenStyles';
import { getErrorMessage } from '../../src/utils/error';
import type { Expense, Category } from '../../src/types';
import TransactionListSkeleton from '../../src/components/skeletons/TransactionListSkeleton';

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [showCatFilter, setShowCatFilter] = useState(false);

  const {
    data: expenses, meta, loading, loadingMore, refreshing, error,
    reloading, refresh, reload, retry, loadMore,
  } = usePagination<Expense, { periodTotal: number }>({
    fetcher: useCallback(async (page, pageSize) => {
      const { startDate, endDate } = getMonthDateRange(year, month);
      const { expenses, totalPages, periodTotal } = await expenseService.getAll(startDate, endDate, filterCategory || undefined, page, pageSize);
      return { data: expenses, totalPages, meta: { periodTotal } };
    }, [year, month, filterCategory]),
    deps: [year, month, filterCategory],
  });

  const loadCategories = useCallback(() => {
    categoryService.getAll('expense')
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // Tab screens stay mounted, so pull fresh data whenever this one is focused.
  useRefreshOnFocus(useCallback(() => { reload(); loadCategories(); }, [reload, loadCategories]));

  const { sheetRef, snapPoints, editing, formKey, openAdd, openEdit, closeSheet } = useBottomSheet<Expense>();

  const periodTotal = meta?.periodTotal ?? 0;

  const handleSubmit = async (data: Omit<Expense, '_id'>) => {
    setSaving(true);
    try {
      if (editing) {
        await expenseService.update(editing._id, data);
      } else {
        await expenseService.create(data);
      }
      closeSheet();
      reload();
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e));
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
            reload();
          } catch (e) {
            Alert.alert(t('common.error'), getErrorMessage(e));
          }
        },
      },
    ]);
  };

  const getCategoryIcon = useCallback((catName: string) =>
    categories.find((c) => c.name === catName)?.icon ?? '💸', [categories]);

  const expenseCats = useMemo(() => categories.filter((c) => c.type === 'expense'), [categories]);

  const renderItem = useCallback(({ item }: { item: Expense }) => (
    <TransactionItem
      icon={getCategoryIcon(item.category)}
      category={item.category}
      amount={item.amount}
      date={item.date}
      note={item.notes}
      isIncome={false}
      onEdit={() => openEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  ), [getCategoryIcon, openEdit, handleDelete]);

  const listHeader = (
    <>
      <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

      {/* Category filter */}
      <TouchableOpacity
        style={[s.filterBtn, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}
        onPress={() => setShowCatFilter(!showCatFilter)}
        accessibilityRole="button"
        accessibilityLabel={filterCategory || t('common.all_categories')}
        accessibilityState={{ expanded: showCatFilter }}
      >
        <Text style={[s.filterText, { color: filterCategory ? colors.textPrimary : colors.textMuted }]}>
          {filterCategory || t('common.all_categories')}
        </Text>
        <Feather name="chevron-down" size={14} color={colors.textMuted} />
      </TouchableOpacity>
      {showCatFilter && (
        <View style={[s.dropdown, { backgroundColor: colors.bgTertiary, borderColor: colors.borderColor }]}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            <TouchableOpacity
              style={s.dropItem}
              onPress={() => { setFilterCategory(''); setShowCatFilter(false); }}
              accessibilityRole="button"
              accessibilityLabel={t('common.all_categories')}
              accessibilityState={{ selected: filterCategory === '' }}
            >
              <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{t('common.all_categories')}</Text>
            </TouchableOpacity>
            {expenseCats.map((c) => (
              <TouchableOpacity
                key={c._id}
                style={s.dropItem}
                onPress={() => { setFilterCategory(c.name); setShowCatFilter(false); }}
                accessibilityRole="button"
                accessibilityLabel={c.name}
                accessibilityState={{ selected: filterCategory === c.name }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 14 }}>{c.icon} {c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );

  const listEmpty = loading ? (
    <TransactionListSkeleton />
  ) : error ? (
    <ErrorState message={error} onRetry={retry} />
  ) : (
    <EmptyState icon="trending-down" title={t('expenses.empty_title')} subtitle={t('expenses.empty_subtitle')} onAction={openAdd} actionLabel={t('expenses.add')} />
  );

  // Rows already on screen: report the failure inline instead of replacing them.
  // No footer while page 1 is in flight or the list is empty: there is no
  // "end of list" to load past yet, and anything shown here would be a guess.
  const listFooter = reloading || expenses.length === 0 ? null : error ? (
    <ErrorState compact message={error} onRetry={retry} />
  ) : (
    <PaginationFooter loadingMore={loadingMore} color={colors.primary} />
  );

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <Pressable
        style={[ss.header, { alignItems: 'flex-start' }]}
        onPress={() => setShowCatFilter(false)}
        accessible={false}
      >
        <View>
          <Text style={[ss.title, { color: colors.textPrimary }]}>{t('expenses.title')}</Text>
          <Text style={[s.total, { color: colors.danger }]}>{formatCurrency(periodTotal)}</Text>
        </View>
        <TouchableOpacity
          style={[ss.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => { setShowCatFilter(false); openAdd(); }}
          accessibilityRole="button"
          accessibilityLabel={t('expenses.add')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={ss.addBtnText}>{t('common.add')}</Text>
        </TouchableOpacity>
      </Pressable>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={ss.scroll}
        // No pull-to-refresh mid-load: it would fire a duplicate request on top
        // of the one already in flight. Scrolling stays enabled.
        refreshControl={
          loading ? undefined
            : <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        onScrollBeginDrag={() => setShowCatFilter(false)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={11}
      />

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{ backgroundColor: colors.bgPrimary }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}
      >
        <BottomSheetScrollView>
          <ExpenseForm
            key={formKey}
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

const localStyles = (colors: Colors) => StyleSheet.create({
  total: { fontSize: 16, fontWeight: '600', marginTop: 2 },
  filterBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 10, marginBottom: 8 },
  filterText: { fontSize: 13 },
  dropdown: { borderRadius: 10, borderWidth: 1, overflow: 'hidden', marginBottom: 8, maxHeight: 280 },
  dropItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderColor },
});
