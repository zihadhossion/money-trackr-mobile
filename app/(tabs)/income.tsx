import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useBottomSheet } from '../../src/hooks/useBottomSheet';
import { usePagination } from '../../src/hooks/usePagination';
import { useRefreshOnFocus } from '../../src/hooks/useRefreshOnFocus';
import MonthYearPicker from '../../src/components/ui/MonthYearPicker';
import TransactionItem from '../../src/components/ui/TransactionItem';
import EmptyState from '../../src/components/ui/EmptyState';
import ErrorState from '../../src/components/ui/ErrorState';
import PaginationFooter from '../../src/components/ui/PaginationFooter';
import IncomeForm from '../../src/components/forms/IncomeForm';
import { incomeService } from '../../src/services/incomeService';
import { categoryService } from '../../src/services/categoryService';
import { getMonthDateRange } from '../../src/utils/date';
import { formatCurrency } from '../../src/utils/currency';
import { screenStyles } from '../../src/theme/screenStyles';
import { getErrorMessage } from '../../src/utils/error';
import type { Income, Category } from '../../src/types';
import TransactionListSkeleton from '../../src/components/skeletons/TransactionListSkeleton';

export default function IncomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  const {
    data: incomes, meta, loading, loadingMore, refreshing, error,
    reloading, refresh, reload, retry, loadMore,
  } = usePagination<Income, { periodTotal: number }>({
    fetcher: useCallback(async (page, pageSize) => {
      const { startDate, endDate } = getMonthDateRange(year, month);
      const { incomes, totalPages, periodTotal } = await incomeService.getAll(startDate, endDate, page, pageSize);
      return { data: incomes, totalPages, meta: { periodTotal } };
    }, [year, month]),
    deps: [year, month],
  });

  const loadCategories = useCallback(() => {
    categoryService.getAll('income')
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  // Tab screens stay mounted, so pull fresh data whenever this one is focused.
  useRefreshOnFocus(useCallback(() => { reload(); loadCategories(); }, [reload, loadCategories]));

  const { sheetRef, snapPoints, editing, formKey, openAdd, openEdit, closeSheet } = useBottomSheet<Income>();

  const periodTotal = meta?.periodTotal ?? 0;

  const handleSubmit = async (data: Omit<Income, '_id'>) => {
    setSaving(true);
    try {
      if (editing) {
        await incomeService.update(editing._id, data);
      } else {
        await incomeService.create(data);
      }
      closeSheet();
      reload();
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Income) => {
    Alert.alert(t('income.delete_title'), t('income.delete_message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          try {
            await incomeService.delete(item._id);
            reload();
          } catch (e) {
            Alert.alert(t('common.error'), getErrorMessage(e));
          }
        },
      },
    ]);
  };

  const getCategoryIcon = useCallback((catName: string) =>
    categories.find((c) => c.name === catName)?.icon ?? '💰', [categories]);

  const renderItem = useCallback(({ item }: { item: Income }) => (
    <TransactionItem
      icon={getCategoryIcon(item.category)}
      category={item.category}
      amount={item.amount}
      date={item.date}
      note={item.source || item.notes}
      isIncome
      onEdit={() => openEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  ), [getCategoryIcon, openEdit, handleDelete]);

  const listEmpty = loading ? (
    <TransactionListSkeleton />
  ) : error ? (
    <ErrorState message={error} onRetry={retry} />
  ) : (
    <EmptyState icon="trending-up" title={t('income.empty_title')} subtitle={t('income.empty_subtitle')} onAction={openAdd} actionLabel={t('income.add')} />
  );

  // Rows already on screen: report the failure inline instead of replacing them.
  // No footer while page 1 is in flight or the list is empty: there is no
  // "end of list" to load past yet, and anything shown here would be a guess.
  const listFooter = reloading || incomes.length === 0 ? null : error ? (
    <ErrorState compact message={error} onRetry={retry} />
  ) : (
    <PaginationFooter loadingMore={loadingMore} color={colors.primary} />
  );

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={[ss.header, { alignItems: 'flex-start' }]}>
        <View>
          <Text style={[ss.title, { color: colors.textPrimary }]}>{t('income.title')}</Text>
          <Text style={[s.total, { color: colors.success }]}>{formatCurrency(periodTotal)}</Text>
        </View>
        <TouchableOpacity
          style={[ss.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAdd}
          accessibilityRole="button"
          accessibilityLabel={t('income.add')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={ss.addBtnText}>{t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={incomes}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={ss.scroll}
        scrollEnabled={!loading}
        refreshControl={
          loading ? undefined
            : <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
        }
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
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
          <IncomeForm
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

const localStyles = (colors: any) => StyleSheet.create({
  total: { fontSize: 16, fontWeight: '600', marginTop: 2 },
});
