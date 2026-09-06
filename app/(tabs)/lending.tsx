import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { useSheetDismiss } from '../../src/hooks/useSheetDismiss';
import { useListFilters, periodRange, usePeriodChip } from '../../src/hooks/useListFilters';
import { useResultCount } from '../../src/hooks/useResultCount';
import ListToolbar from '../../src/components/ui/ListToolbar';
import ActiveFilterChips, { type ActiveFilter } from '../../src/components/ui/ActiveFilterChips';
import FilterSheet, { FilterSection } from '../../src/components/ui/FilterSheet';
import PeriodPicker from '../../src/components/ui/PeriodPicker';
import SegmentedControl from '../../src/components/ui/SegmentedControl';
import LendingItem from '../../src/components/ui/LendingItem';
import LendingSummaryCards from '../../src/components/ui/LendingSummaryCards';
import EmptyState from '../../src/components/ui/EmptyState';
import ErrorState from '../../src/components/ui/ErrorState';
import PaginationFooter from '../../src/components/ui/PaginationFooter';
import LendingForm from '../../src/components/forms/LendingForm';
import RepaymentForm from '../../src/components/forms/RepaymentForm';
import { lendingService } from '../../src/services/lendingService';
import { useCurrency } from '../../src/contexts/CurrencyContext';
import { screenStyles } from '../../src/theme/screenStyles';
import type { Colors } from '../../src/theme/colors';
import { getErrorMessage } from '../../src/utils/error';
import type { Lending, LendingPayload, LendingSummary } from '../../src/types';
import LendingListSkeleton from '../../src/components/skeletons/LendingListSkeleton';

type SheetMode = 'form' | 'repayment' | null;
type FilterType = '' | 'LENT' | 'BORROWED';
type FilterStatus = '' | 'PENDING' | 'PARTIAL' | 'PAID';

// Labels are translation keys, resolved at render time so a language switch
// re-labels the options instead of leaving them in English.
const TYPE_FILTERS = [
  { labelKey: 'lending.filters.all', value: '' },
  { labelKey: 'lending.filters.lent', value: 'LENT' },
  { labelKey: 'lending.filters.borrowed', value: 'BORROWED' },
] as const satisfies readonly { labelKey: string; value: FilterType }[];

const STATUS_FILTERS = [
  { labelKey: 'lending.filters.all', value: '' },
  { labelKey: 'lending.filters.pending', value: 'PENDING' },
  { labelKey: 'lending.filters.partial', value: 'PARTIAL' },
  { labelKey: 'lending.filters.paid', value: 'PAID' },
] as const satisfies readonly { labelKey: string; value: FilterStatus }[];

const NO_EXTRA_FILTERS = { filterType: '' as FilterType, filterStatus: '' as FilterStatus };

export default function LendingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [summary, setSummary] = useState<LendingSummary>({ totalLent: 0, totalBorrowed: 0 });
  const [saving, setSaving] = useState(false);
  const [repaying, setRepaying] = useState<Lending | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const filterSheetRef = useRef<BottomSheet>(null);

  const {
    applied, draft, setDraft, search, setSearch, debouncedSearch,
    sheetOpen, openSheet, closeSheet: closeFilterSheet, apply, resetDraft, set, clearAll,
  } = useListFilters(NO_EXTRA_FILTERS);

  const {
    data: lendings, loading, loadingMore, refreshing, error,
    reloading, refresh, reload, retry, loadMore,
  } = usePagination<Lending>({
    fetcher: useCallback(async (page, pageSize) => {
      const { lendings, totalPages } = await lendingService.getAll({
        ...periodRange(applied),
        type: applied.filterType || undefined,
        status: applied.filterStatus || undefined,
        search: debouncedSearch || undefined,
        page,
        limit: pageSize,
      });
      return { data: lendings, totalPages };
    }, [applied, debouncedSearch]),
    deps: [applied, debouncedSearch],
  });

  const refreshSummary = useCallback(() => {
    lendingService.getSummary()
      .then(setSummary)
      .catch(console.error);
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary, applied]);

  // Outstanding position: money still owed to you, less money you still owe.
  const net = summary.totalLent - summary.totalBorrowed;

  const handleRefresh = useCallback(() => {
    refresh();
    refreshSummary();
  }, [refresh, refreshSummary]);

  const handleReload = useCallback(() => {
    reload();
    refreshSummary();
  }, [reload, refreshSummary]);

  // Tab screens stay mounted, so pull fresh data whenever this one is focused.
  useRefreshOnFocus(handleReload);

  const { sheetRef, snapPoints, editing, formKey, isOpen: formOpen, openAdd: baseOpenAdd, openEdit: baseOpenEdit, closeSheet: baseCloseSheet, handleSheetChange } = useBottomSheet<Lending>();

  const draftCount = useResultCount(
    useCallback(async () => {
      const { total } = await lendingService.getAll({
        ...periodRange(draft),
        type: draft.filterType || undefined,
        status: draft.filterStatus || undefined,
        search: debouncedSearch || undefined,
        limit: 1,
      });
      return total;
    }, [draft, debouncedSearch]),
    sheetOpen,
  );

  const openAdd = () => { baseOpenAdd(); setSheetMode('form'); };
  const openEdit = (item: Lending) => { baseOpenEdit(item); setSheetMode('form'); };
  const openRepay = (item: Lending) => { baseOpenAdd(); setRepaying(item); setSheetMode('repayment'); };
  const closeSheet = () => { baseCloseSheet(); setRepaying(null); setSheetMode(null); };

  useSheetDismiss([
    { ref: filterSheetRef, open: sheetOpen, onClose: closeFilterSheet },
    { ref: sheetRef, open: formOpen, onClose: closeSheet },
  ]);

  const handleSubmit = async (data: LendingPayload) => {
    setSaving(true);
    try {
      if (editing) {
        await lendingService.update(editing._id, data);
      } else {
        await lendingService.create(data);
      }
      closeSheet();
      handleReload();
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleRepayment = async (amount: number) => {
    if (!repaying) return;
    setSaving(true);
    try {
      await lendingService.addRepayment(repaying._id, amount);
      closeSheet();
      handleReload();
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Lending) => {
    Alert.alert(t('lending.delete_title'), t('lending.delete_message', { name: item.personName }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          try {
            await lendingService.delete(item._id);
            handleReload();
          } catch (e) {
            Alert.alert(t('common.error'), getErrorMessage(e));
          }
        },
      },
    ]);
  };

  const renderItem = useCallback(({ item }: { item: Lending }) => (
    <LendingItem
      item={item}
      onEdit={() => openEdit(item)}
      onDelete={() => handleDelete(item)}
      onRepay={() => openRepay(item)}
    />
  ), [openEdit, handleDelete, openRepay]);

  // Both dimensions are bare words — "Lent" and "Pending" sit side by side
  // with nothing to say which is which — so these chips carry their label.
  const periodChip = usePeriodChip(applied, set);
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const out: ActiveFilter[] = [];
    if (periodChip) out.push(periodChip);
    if (applied.filterType) {
      const opt = TYPE_FILTERS.find((f) => f.value === applied.filterType);
      out.push({
        key: 'type',
        label: t('filters.type'),
        value: t(opt!.labelKey as any),
        onRemove: () => set({ filterType: '' }),
      });
    }
    if (applied.filterStatus) {
      const opt = STATUS_FILTERS.find((f) => f.value === applied.filterStatus);
      out.push({
        key: 'status',
        label: t('filters.status'),
        value: t(opt!.labelKey as any),
        onRemove: () => set({ filterStatus: '' }),
      });
    }
    return out;
  }, [periodChip, applied.filterType, applied.filterStatus, set, t]);

  const typeOptions = useMemo(
    () => TYPE_FILTERS.map((f) => ({ value: f.value as FilterType, label: t(f.labelKey as any) })),
    [t],
  );
  const statusOptions = useMemo(
    () => STATUS_FILTERS.map((f) => ({ value: f.value as FilterStatus, label: t(f.labelKey as any) })),
    [t],
  );

  const listHeader = (
    <>
      <ListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder={t('filters.search_debts')}
        activeCount={activeFilters.length}
        onOpenFilters={() => { filterSheetRef.current?.expand(); openSheet(); }}
      />
      <ActiveFilterChips filters={activeFilters} onClearAll={clearAll} />

      {/* Summary cards are figures, not controls, so they stay on the screen. */}
      <LendingSummaryCards summary={summary} />
    </>
  );

  const isFiltered = activeFilters.length > 0 || debouncedSearch.length > 0;

  const listEmpty = loading ? (
    <LendingListSkeleton />
  ) : error ? (
    <ErrorState message={error} onRetry={retry} />
  ) : isFiltered ? (
    <EmptyState
      icon="filter"
      title={t('filters.empty_filtered_title')}
      subtitle={t('filters.empty_filtered_subtitle')}
      onAction={clearAll}
      actionLabel={t('filters.clear_filters')}
    />
  ) : (
    <EmptyState icon="repeat" title={t('lending.empty_title')} subtitle={t('lending.empty_subtitle')} onAction={openAdd} actionLabel={t('lending.add_record')} />
  );

  // Rows already on screen: report the failure inline instead of replacing them.
  // No footer while page 1 is in flight or the list is empty: there is no
  // "end of list" to load past yet, and anything shown here would be a guess.
  const listFooter = reloading || lendings.length === 0 ? null : error ? (
    <ErrorState compact message={error} onRetry={retry} />
  ) : (
    <PaginationFooter loadingMore={loadingMore} color={colors.primary} />
  );

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={[ss.header, { alignItems: 'flex-start' }]}>
        <View>
          <Text style={[ss.title, { color: colors.textPrimary }]}>{t('lending.title')}</Text>
          {/* Net of what is still owed to you minus what you still owe, the
              same slot expenses and income use for their period total. The
              lending API has no per-period figure, so this one is all-time —
              the two summary cards below it break the same number down. */}
          <Text
            style={[s.total, { color: net >= 0 ? colors.success : colors.danger }]}
            accessibilityLabel={t('lending.net_a11y', { amount: format(Math.abs(net)) })}
          >
            {net >= 0 ? '' : '-'}{format(Math.abs(net))}
          </Text>
        </View>
        <TouchableOpacity
          style={[ss.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAdd}
          accessibilityRole="button"
          accessibilityLabel={t('lending.add_record')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={ss.addBtnText}>{t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={lendings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={ss.scroll}
        keyboardShouldPersistTaps="handled"
        // No pull-to-refresh mid-load: it would fire a duplicate request on top
        // of the one already in flight. Scrolling stays enabled.
        refreshControl={
          loading ? undefined
            : <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={11}
      />

      <FilterSheet
        ref={filterSheetRef}
        onReset={resetDraft}
        onApply={() => { apply(); filterSheetRef.current?.close(); }}
        onClose={closeFilterSheet}
        resultCount={draftCount}
      >
        <FilterSection title={t('filters.period')}>
          <PeriodPicker value={draft} onChange={(next) => setDraft((d) => ({ ...d, ...next }))} />
        </FilterSection>
        <FilterSection title={t('filters.type')}>
          <SegmentedControl
            options={typeOptions}
            value={draft.filterType}
            onChange={(filterType) => setDraft((d) => ({ ...d, filterType }))}
          />
        </FilterSection>
        <FilterSection title={t('filters.status')}>
          <SegmentedControl
            options={statusOptions}
            value={draft.filterStatus}
            onChange={(filterStatus) => setDraft((d) => ({ ...d, filterStatus }))}
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
          {sheetMode === 'form' && (
            <LendingForm
              key={formKey}
              initial={editing ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeSheet}
              loading={saving}
            />
          )}
          {sheetMode === 'repayment' && repaying && (
            <RepaymentForm
              key={formKey}
              personName={repaying.personName}
              remainingAmount={repaying.remainingAmount}
              onSubmit={handleRepayment}
              onCancel={closeSheet}
              loading={saving}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const localStyles = (colors: Colors) => StyleSheet.create({
  total: { fontSize: 16, fontWeight: '600', marginTop: 2 },
});
