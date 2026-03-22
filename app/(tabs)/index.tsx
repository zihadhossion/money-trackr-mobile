import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import StatCard from '../../src/components/ui/StatCard';
import LendingSummaryCards from '../../src/components/ui/LendingSummaryCards';
import ExpensePieChart from '../../src/components/charts/ExpensePieChart';
import TrendsBarChart from '../../src/components/charts/TrendsBarChart';
import { dashboardService } from '../../src/services/dashboardService';
import { lendingService } from '../../src/services/lendingService';
import { formatCurrency } from '../../src/utils/currency';
import type { Overview, CategoryData, TrendData, LendingSummary } from '../../src/types';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const s = useMemo(() => styles(colors), [colors]);

  const [currentYear] = useState(() => new Date().getFullYear());
  const [currentMonth] = useState(() => new Date().getMonth() + 1);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [lendingSummary, setLendingSummary] = useState<LendingSummary>({ totalLent: 0, totalBorrowed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [ov, cats, tr, ls] = await Promise.all([
        dashboardService.getOverview(currentYear, currentMonth),
        dashboardService.getExpensesByCategory(currentYear, currentMonth),
        dashboardService.getTrends(currentYear),
        lendingService.getSummary(),
      ]);
      setOverview(ov);
      setExpensesByCategory(cats);
      setTrends(tr);
      setLendingSummary(ls);
    } catch (e) {
      console.error('Dashboard fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const budgetPct = overview ? (overview.budgetUsed / (overview.budgetLimit || 1)) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView style={[s.safe, { backgroundColor: colors.bgSecondary }]}>
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgSecondary }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.greeting, { color: colors.textMuted }]}>Welcome back,</Text>
            <Text style={[s.name, { color: colors.textPrimary }]}>{user?.displayName ?? 'User'}</Text>
          </View>
          <View style={[s.headerIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="home" size={20} color={colors.primary} />
          </View>
        </View>

        {/* Budget alert */}
        {budgetPct >= 80 && (
          <View style={[s.alert, { backgroundColor: budgetPct >= 100 ? colors.dangerBg : colors.warningBg }]}>
            <Feather name="alert-triangle" size={16} color={budgetPct >= 100 ? colors.danger : colors.warning} />
            <Text style={[s.alertText, { color: budgetPct >= 100 ? colors.dangerText : colors.warningText }]}>
              {budgetPct >= 100
                ? `Budget exceeded! You've spent ${budgetPct.toFixed(0)}% of your monthly budget.`
                : `Budget warning: ${budgetPct.toFixed(0)}% of your monthly budget used.`}
            </Text>
          </View>
        )}

        {/* Stat cards 2×2 grid */}
        <View style={s.cardGrid}>
          <View style={s.cardRow}>
            <StatCard title="Total Income" value={formatCurrency(overview?.totalIncome ?? 0)} icon="trending-up" variant="success" />
            <View style={s.cardGap} />
            <StatCard title="Total Expenses" value={formatCurrency(overview?.totalExpenses ?? 0)} icon="trending-down" variant="danger" />
          </View>
          <View style={s.cardRow}>
            <StatCard title="Balance" value={formatCurrency(overview?.balance ?? 0)} icon="dollar-sign" variant="primary" />
            <View style={s.cardGap} />
            <StatCard title="Budget Used" value={`${budgetPct.toFixed(1)}%`} icon="pie-chart" variant="warning" subtitle={`of ${formatCurrency(overview?.budgetLimit ?? 0)}`} />
          </View>
        </View>

        {/* Lending summary */}
        <LendingSummaryCards summary={lendingSummary} />

        {/* Pie chart */}
        <View style={[s.chartCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Text style={[s.chartTitle, { color: colors.textPrimary }]}>Expenses by Category</Text>
          <ExpensePieChart data={expensesByCategory} />
        </View>

        {/* Bar chart */}
        <View style={[s.chartCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Text style={[s.chartTitle, { color: colors.textPrimary }]}>Income vs Expenses</Text>
          <TrendsBarChart data={trends} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: any) => StyleSheet.create({
  safe: { flex: 1 },
  loadingCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontSize: 13 },
  name: { fontSize: 22, fontWeight: '700' },
  headerIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  alert: { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  alertText: { flex: 1, fontSize: 13, lineHeight: 18 },
  cardGrid: { gap: 12 },
  cardRow: { flexDirection: 'row' },
  cardGap: { width: 12 },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
});
