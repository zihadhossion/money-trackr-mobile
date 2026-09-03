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
import { usePagination } from '../../src/hooks/usePagination';
import MonthYearPicker from '../../src/components/ui/MonthYearPicker';
import LendingItem from '../../src/components/ui/LendingItem';
import LendingSummaryCards from '../../src/components/ui/LendingSummaryCards';
import EmptyState from '../../src/components/ui/EmptyState';
import LendingForm from '../../src/components/forms/LendingForm';
import RepaymentForm from '../../src/components/forms/RepaymentForm';
import { lendingService } from '../../src/services/lendingService';
import { getMonthDateRange } from '../../src/utils/date';
import { screenStyles } from '../../src/theme/screenStyles';
import type { Lending, LendingSummary } from '../../src/types';

type SheetMode = 'form' | 'repayment' | null;

export default function LendingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const ss = useMemo(() => screenStyles(colors), [colors]);

  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [summary, setSummary] = useState<LendingSummary>({ totalLent: 0, totalBorrowed: 0 });
  const [saving, setSaving] = useState(false);
  const [repaying, setRepaying] = useState<Lending | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);

  const { data: lendings, loading, refreshing, refresh, onScroll } = usePagination<Lending>({
    fetcher: useCallback(async (page, pageSize) => {
      const { startDate, endDate } = getMonthDateRange(year, month);
      const { lendings, totalPages } = await lendingService.getAll(startDate, endDate, page, pageSize);
      return { data: lendings, totalPages };
    }, [year, month]),
    deps: [year, month],
  });

  const refreshSummary = useCallback(() => {
    lendingService.getSummary()
      .then(setSummary)
      .catch(console.error);
  }, []);

  useEffect(() => {
    refreshSummary();
  }, [refreshSummary, year, month]);

  const handleRefresh = useCallback(() => {
    refresh();
    refreshSummary();
  }, [refresh, refreshSummary]);

  const { sheetRef, snapPoints, editing, openAdd: baseOpenAdd, openEdit: baseOpenEdit, closeSheet: baseCloseSheet } = useBottomSheet<Lending>();

  const openAdd = () => { baseOpenAdd(); setSheetMode('form'); };
  const openEdit = (item: Lending) => { baseOpenEdit(item); setSheetMode('form'); };
  const openRepay = (item: Lending) => { setRepaying(item); setSheetMode('repayment'); sheetRef.current?.expand(); };
  const closeSheet = () => { baseCloseSheet(); setRepaying(null); setSheetMode(null); };

  const handleSubmit = async (data: Omit<Lending, '_id'>) => {
    setSaving(true);
    try {
      if (editing) {
        await lendingService.update(editing._id, data);
      } else {
        await lendingService.create(data);
      }
      closeSheet();
      handleRefresh();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || t('common.error'));
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
      handleRefresh();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || t('common.error'));
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
            handleRefresh();
          } catch (e: any) {
            Alert.alert(t('common.error'), e.message || t('common.error'));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={ss.header}>
        <Text style={[ss.title, { color: colors.textPrimary }]}>{t('lending.title')}</Text>
        <TouchableOpacity style={[ss.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
          <Feather name="plus" size={20} color="#fff" />
          <Text style={ss.addBtnText}>{t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={ss.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        onScroll={onScroll}
        scrollEventThrottle={400}
      >
        <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />

        {/* Summary cards */}
        <LendingSummaryCards summary={summary} />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : lendings.length === 0 ? (
          <EmptyState icon="repeat" title={t('lending.empty_title')} subtitle={t('lending.empty_subtitle')} onAction={openAdd} actionLabel={t('lending.add_record')} />
        ) : (
          <>
            {lendings.map((item) => (
              <LendingItem
                key={item._id}
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
                onRepay={() => openRepay(item)}
              />
            ))}

          </>
        )}
      </ScrollView>

      <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose backgroundStyle={{ backgroundColor: colors.bgPrimary }} handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <BottomSheetScrollView>
          {sheetMode === 'form' && (
            <LendingForm
              initial={editing ?? undefined}
              onSubmit={handleSubmit}
              onCancel={closeSheet}
              loading={saving}
            />
          )}
          {sheetMode === 'repayment' && repaying && (
            <RepaymentForm
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
