import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity,
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
import LendingItem from '../../src/components/ui/LendingItem';
import LendingSummaryCards from '../../src/components/ui/LendingSummaryCards';
import EmptyState from '../../src/components/ui/EmptyState';
import ErrorState from '../../src/components/ui/ErrorState';
import PaginationFooter from '../../src/components/ui/PaginationFooter';
import LendingForm from '../../src/components/forms/LendingForm';
import RepaymentForm from '../../src/components/forms/RepaymentForm';
import { lendingService } from '../../src/services/lendingService';
import { getMonthDateRange } from '../../src/utils/date';
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
// re-labels the chips instead of leaving them in English.
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

export default function LendingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [summary, setSummary] = useState<LendingSummary>({ totalLent: 0, totalBorrowed: 0 });
  const [saving, setSaving] = useState(false);
  const [repaying, setRepaying] = useState<Lending | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [filterType, setFilterType] = useState<FilterType>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('');

  const {
    data: lendings, loading, loadingMore, refreshing, error,
    reloading, refresh, reload, retry, loadMore,
  } = usePagination<Lending>({
    fetcher: useCallback(async (page, pageSize) => {
      const { startDate, endDate } = getMonthDateRange(year, month);
      const { lendings, totalPages } = await lendingService.getAll(
        startDate, endDate, page, pageSize,
        filterType || undefined,
        filterStatus || undefined,
      );
      return { data: lendings, totalPages };
    }, [year, month, filterType, filterStatus]),
    deps: [year, month, filterType, filterStatus],
  });

  const refreshSummary = useCallback(() => {
    lendingService.getSummary()
      .then(setSummary)
      .catch(console.error);
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary, year, month]);

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

  const { sheetRef, snapPoints, editing, formKey, openAdd: baseOpenAdd, openEdit: baseOpenEdit, closeSheet: baseCloseSheet } = useBottomSheet<Lending>();

  const openAdd = () => { baseOpenAdd(); setSheetMode('form'); };
  const openEdit = (item: Lending) => { baseOpenEdit(item); setSheetMode('form'); };
  const openRepay = (item: Lending) => { baseOpenAdd(); setRepaying(item); setSheetMode('repayment'); };
  const closeSheet = () => { baseCloseSheet(); setRepaying(null); setSheetMode(null); };

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

  const listHeader = (
    <>
      <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

      {/* Type Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[s.chip, filterType === f.value && s.chipActive]}
            onPress={() => setFilterType(f.value)}
            accessibilityRole="button"
            accessibilityLabel={t(f.labelKey)}
            accessibilityState={{ selected: filterType === f.value }}
          >
            <Text style={[s.chipText, filterType === f.value && s.chipTextActive]}>
              {t(f.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            style={[s.chip, filterStatus === f.value && s.chipActive]}
            onPress={() => setFilterStatus(f.value)}
            accessibilityRole="button"
            accessibilityLabel={t(f.labelKey)}
            accessibilityState={{ selected: filterStatus === f.value }}
          >
            <Text style={[s.chipText, filterStatus === f.value && s.chipTextActive]}>
              {t(f.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary cards */}
      <LendingSummaryCards summary={summary} />
    </>
  );

  const listEmpty = loading ? (
    <LendingListSkeleton />
  ) : error ? (
    <ErrorState message={error} onRetry={retry} />
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
  filterRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip: {
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.bgTertiary,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    // textMuted fails AA on the light chip surface at 13px; textSecondary passes in both themes.
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.white,
  },
});
