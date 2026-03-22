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
  const ss = useMemo(() => screenStyles(colors), [colors]);

  const [month, setMonth] = useState(() => new Date().getMonth() + 1);
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [lendings, setLendings] = useState<Lending[]>([]);
  const [summary, setSummary] = useState<LendingSummary>({ totalLent: 0, totalBorrowed: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [repaying, setRepaying] = useState<Lending | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);

  const { sheetRef, snapPoints, editing, openAdd: baseOpenAdd, openEdit: baseOpenEdit, closeSheet: baseCloseSheet } = useBottomSheet<Lending>();

  const openAdd = () => { baseOpenAdd(); setSheetMode('form'); };
  const openEdit = (item: Lending) => { baseOpenEdit(item); setSheetMode('form'); };
  const openRepay = (item: Lending) => { setRepaying(item); setSheetMode('repayment'); sheetRef.current?.expand(); };
  const closeSheet = () => { baseCloseSheet(); setRepaying(null); setSheetMode(null); };

  const fetchData = useCallback(async () => {
    const { startDate, endDate } = getMonthDateRange(year, month);
    try {
      const [data, sum] = await Promise.all([
        lendingService.getAll(startDate, endDate),
        lendingService.getSummary(),
      ]);
      setLendings(data);
      setSummary(sum);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (data: Omit<Lending, '_id'>) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await lendingService.update(editing._id, data);
        setLendings((prev) => prev.map((l) => (l._id === editing._id ? updated : l)));
      } else {
        const created = await lendingService.create(data);
        setLendings((prev) => [created, ...prev]);
      }
      closeSheet();
      // Refresh summary
      lendingService.getSummary().then(setSummary);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRepayment = async (amount: number) => {
    if (!repaying) return;
    setSaving(true);
    try {
      const updated = await lendingService.addRepayment(repaying._id, amount);
      setLendings((prev) => prev.map((l) => (l._id === repaying._id ? updated : l)));
      closeSheet();
      lendingService.getSummary().then(setSummary);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to record repayment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item: Lending) => {
    Alert.alert('Delete', `Delete lending record for ${item.personName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await lendingService.delete(item._id);
            setLendings((prev) => prev.filter((l) => l._id !== item._id));
            lendingService.getSummary().then(setSummary);
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={ss.header}>
        <Text style={[ss.title, { color: colors.textPrimary }]}>Lending</Text>
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

        {/* Summary cards */}
        <LendingSummaryCards summary={summary} />

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : lendings.length === 0 ? (
          <EmptyState icon="repeat" title="No lending records" subtitle="Track money lent or borrowed" onAction={openAdd} actionLabel="Add Record" />
        ) : (
          lendings.map((item) => (
            <LendingItem
              key={item._id}
              item={item}
              onEdit={() => openEdit(item)}
              onDelete={() => handleDelete(item)}
              onRepay={() => openRepay(item)}
            />
          ))
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
