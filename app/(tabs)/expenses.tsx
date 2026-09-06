import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import type { Colors } from '../../src/theme/colors';
import { useBottomSheet } from '../../src/hooks/useBottomSheet';
import { usePagination } from '../../src/hooks/usePagination';
import { useRefreshOnFocus } from '../../src/hooks/useRefreshOnFocus';
import { useSheetDismiss } from '../../src/hooks/useSheetDismiss';
import { useListFilters, periodRange, usePeriodChip } from '../../src/hooks/useListFilters';
import { useResultCount } from '../../src/hooks/useResultCount';
import ListToolbar from '../../src/components/ui/ListToolbar';
import ActiveFilterChips, { type ActiveFilter } from '../../src/components/ui/ActiveFilterChips';
import FilterSheet, { FilterSection } from '../../src/components/ui/FilterSheet';
import PeriodPicker from '../../src/components/ui/PeriodPicker';
import CategorySelect from '../../src/components/ui/CategorySelect';
import TransactionItem from '../../src/components/ui/TransactionItem';
import EmptyState from '../../src/components/ui/EmptyState';
import ErrorState from '../../src/components/ui/ErrorState';
import PaginationFooter from '../../src/components/ui/PaginationFooter';
import ExpenseForm from '../../src/components/forms/ExpenseForm';
import { expenseService } from '../../src/services/expenseService';
import { categoryService } from '../../src/services/categoryService';
import { useCurrency } from '../../src/contexts/CurrencyContext';
import { screenStyles } from '../../src/theme/screenStyles';
import { getErrorMessage } from '../../src/utils/error';
import type { Expense, Category } from '../../src/types';
import TransactionListSkeleton from '../../src/components/skeletons/TransactionListSkeleton';

const NO_EXTRA_FILTERS = { category: '' };

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const filterSheetRef = useRef<BottomSheet>(null);

  const {
    applied, draft, setDraft, search, setSearch, debouncedSearch,
    sheetOpen, openSheet, closeSheet, apply, resetDraft, set, clearAll,
  } = useListFilters(NO_EXTRA_FILTERS);

  const {
    data: expenses, meta, loading, loadingMore, refreshing, error,
    reloading, refresh, reload, retry, loadMore,
  } = usePagination<Expense, { periodTotal: number }>({
    fetcher: useCallback(async (page, pageSize) => {
      const { expenses, totalPages, periodTotal } = await expenseService.getAll({
        ...periodRange(applied),
        category: applied.category || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: pageSize,
      });
      return { data: expenses, totalPages, meta: { periodTotal } };
    }, [applied, debouncedSearch]),
    deps: [applied, debouncedSearch],
  });

  const loadCategories = useCallback(() => {
    categoryService.getAll('expense')
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // Tab screens stay mounted, so pull fresh data whenever this one is focused.
  useRefreshOnFocus(useCallback(() => { reload(); loadCategories(); }, [reload, loadCategories]));

  const { sheetRef, snapPoints, editing, formKey, isOpen: formOpen, openAdd, openEdit, closeSheet: closeForm, handleSheetChange } = useBottomSheet<Expense>();

  useSheetDismiss([
    { ref: filterSheetRef, open: sheetOpen, onClose: closeSheet },
    { ref: sheetRef, open: formOpen, onClose: closeForm },
  ]);

  const periodTotal = meta?.periodTotal ?? 0;

  const draftCount = useResultCount(
    useCallback(async () => {
      const { total } = await expenseService.getAll({
        ...periodRange(draft),
        category: draft.category || undefined,
        search: debouncedSearch || undefined,
        limit: 1,
      });
      return total;
    }, [draft, debouncedSearch]),
    sheetOpen,
  );

  const handleSubmit = async (data: Omit<Expense, '_id'>) => {
    setSaving(true);
    try {
      if (editing) {
        await expenseService.update(editing._id, data);
      } else {
        await expenseService.create(data);
      }
      closeForm();
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

  // Filters the user actually chose. The current month is the default, so it
  // is only worth a chip once it has been moved off it.
  const periodChip = usePeriodChip(applied, set);
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const out: ActiveFilter[] = [];
    if (periodChip) out.push(periodChip);
    if (applied.category) {
      out.push({ key: 'category', value: applied.category, onRemove: () => set({ category: '' }) });
    }
    return out;
  }, [periodChip, applied.category, set]);

  const listHeader = (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('filters.search_expenses')}
        activeCount={activeFilters.length}
        onOpenFilters={() => { filterSheetRef.current?.expand(); openSheet(); }}
      />
      <ActiveFilterChips filters={activeFilters} onClearAll={clearAll} />
    </>
  );

  const isFiltered = activeFilters.length > 0 || debouncedSearch.length > 0;

  const listEmpty = loading ? (
    <TransactionListSkeleton />
  ) : error ? (
    <ErrorState message={error} onRetry={retry} />
  ) : isFiltered ? (
    // Telling a user with data to "add your first expense" would be wrong:
    // the rows exist, the filters are hiding them.
    <EmptyState
      icon="filter"
      title={t('filters.empty_filtered_title')}
      subtitle={t('filters.empty_filtered_subtitle')}
      onAction={clearAll}
      actionLabel={t('filters.clear_filters')}
    />
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
      <View style={[ss.header, { alignItems: 'flex-start' }]}>
        <View>
          <Text style={[ss.title, { color: colors.textPrimary }]}>{t('expenses.title')}</Text>
          <Text style={[s.total, { color: colors.danger }]}>{format(periodTotal)}</Text>
        </View>
        <TouchableOpacity
          style={[ss.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAdd}
          accessibilityRole="button"
          accessibilityLabel={t('expenses.add')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={ss.addBtnText}>{t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={ss.scroll}
        keyboardShouldPersistTaps="handled"
        // No pull-to-refresh mid-load: it would fire a duplicate request on top
        // of the one already in flight. Scrolling stays enabled.
        refreshControl={
          loading ? undefined
            : <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={11}
      />

      <FilterSheet
        ref={filterSheetRef}
        onReset={resetDraft}
        onApply={() => { apply(); filterSheetRef.current?.close(); }}
        onClose={closeSheet}
        resultCount={draftCount}
      >
        <FilterSection title={t('filters.period')}>
          <PeriodPicker value={draft} onChange={(next) => setDraft((d) => ({ ...d, ...next }))} />
        </FilterSection>
        <FilterSection title={t('filters.category')}>
          <CategorySelect
            categories={categories}
            selected={draft.category}
            onSelect={(category) => setDraft((d) => ({ ...d, category }))}
            onAddNew={() => { filterSheetRef.current?.close(); closeSheet(); router.push('/categories'); }}
          />
        </FilterSection>
      </FilterSheet>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
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
            onCancel={closeForm}
            loading={saving}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const localStyles = (colors: Colors) => StyleSheet.create({
  total: { fontSize: 16, fontWeight: '600', marginTop: 2 },
});
