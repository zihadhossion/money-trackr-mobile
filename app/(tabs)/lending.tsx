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
import LendingItem from '../../src/components/ui/LendingItem';
import EmptyState from '../../src/components/ui/EmptyState';
import LendingForm from '../../src/components/forms/LendingForm';
import RepaymentForm from '../../src/components/forms/RepaymentForm';
import { lendingService } from '../../src/services/lendingService';
import { getMonthDateRange } from '../../src/utils/date';
import { formatCurrency } from '../../src/utils/currency';
import type { Lending, LendingSummary } from '../../src/types';

type SheetMode = 'form' | 'repayment' | null;

export default function LendingScreen() {
  const { colors } = useTheme();
  const s = styles(colors);
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [lendings, setLendings] = useState<Lending[]>([]);
  const [summary, setSummary] = useState<LendingSummary>({ totalLent: 0, totalBorrowed: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState<Lending | null>(null);
  const [repaying, setRepaying] = useState<Lending | null>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['90%'];

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

  const openAdd = () => { setEditing(null); setSheetMode('form'); sheetRef.current?.expand(); };
  const openEdit = (item: Lending) => { setEditing(item); setSheetMode('form'); sheetRef.current?.expand(); };
  const openRepay = (item: Lending) => { setRepaying(item); setSheetMode('repayment'); sheetRef.current?.expand(); };
  const closeSheet = () => { sheetRef.current?.close(); setEditing(null); setRepaying(null); setSheetMode(null); };

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
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={s.header}>
        <Text style={[s.title, { color: colors.textPrimary }]}>Lending</Text>
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

        {/* Summary cards */}
        <View style={s.summaryRow}>
          <View style={[s.summaryCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
            <Feather name="arrow-up-right" size={16} color="#10b981" />
            <Text style={[s.summaryLabel, { color: colors.textMuted }]}>Total Lent</Text>
            <Text style={[s.summaryAmount, { color: '#10b981' }]}>{formatCurrency(summary.totalLent)}</Text>
          </View>
          <View style={[s.summaryCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
            <Feather name="arrow-down-left" size={16} color="#ef4444" />
            <Text style={[s.summaryLabel, { color: colors.textMuted }]}>Total Borrowed</Text>
            <Text style={[s.summaryAmount, { color: '#ef4444' }]}>{formatCurrency(summary.totalBorrowed)}</Text>
          </View>
        </View>

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

const styles = (colors: any) => StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  scroll: { padding: 16, paddingTop: 8, paddingBottom: 100 },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 1, gap: 4 },
  summaryLabel: { fontSize: 12 },
  summaryAmount: { fontSize: 17, fontWeight: '700' },
});
