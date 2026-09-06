import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useRefreshOnFocus } from '../../src/hooks/useRefreshOnFocus';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useAuth } from '../../src/contexts/AuthContext';
import StatCard from '../../src/components/ui/StatCard';
import LendingSummaryCards from '../../src/components/ui/LendingSummaryCards';
import ExpensePieChart from '../../src/components/charts/ExpensePieChart';
import TrendsBarChart from '../../src/components/charts/TrendsBarChart';
import { dashboardService } from '../../src/services/dashboardService';
import { lendingService } from '../../src/services/lendingService';
import { StatGridSkeleton, LendingSummarySkeleton, ChartSkeleton } from '../../src/components/skeletons/DashboardSkeleton';
import ErrorState from '../../src/components/ui/ErrorState';
import { getErrorMessage } from '../../src/utils/error';
import { useCurrency } from '../../src/contexts/CurrencyContext';
import type { Overview, CategoryData, TrendData, LendingSummary } from '../../src/types';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { format } = useCurrency();
  const s = useMemo(() => styles(colors), [colors]);

  const [currentYear] = useState(() => new Date().getFullYear());
  const [currentMonth] = useState(() => new Date().getMonth() + 1);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<CategoryData[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [lendingSummary, setLendingSummary] = useState<LendingSummary>({ totalLent: 0, totalBorrowed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mirrors usePagination's indicators so every screen behaves the same way:
  // 'initial' skeletons, 'pull' spins the RefreshControl, 'silent' shows
  // nothing and leaves the current numbers on screen.
  const fetchData = useCallback(async (indicator: 'initial' | 'pull' | 'silent' = 'initial') => {
    if (indicator === 'pull') setRefreshing(true);
    else if (indicator === 'initial') setLoading(true);
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
      setError(null);
    } catch (e) {
      // Without this the dashboard just renders ৳0 for a request that never
      // succeeded — the same false-empty-state the list screens used to have.
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentYear, currentMonth]);

  useEffect(() => { fetchData('initial'); }, [fetchData]);

  const onRefresh = useCallback(() => { fetchData('pull'); }, [fetchData]);

  // The dashboard is a tab, so it stays mounted; refetch whenever it regains
  // focus to pick up entries added on the other tabs. Silent on purpose — the
  // user did not ask for this reload, so it must not flash an indicator.
  const onFocusReload = useCallback(() => { fetchData('silent'); }, [fetchData]);
  useRefreshOnFocus(onFocusReload);

  const budgetPct = overview ? (overview.budgetUsed / (overview.budgetLimit || 1)) * 100 : 0;

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bgSecondary }]}>
      <ScrollView
        contentContainerStyle={s.scroll}
        // No pull-to-refresh mid-load: it would fire a duplicate request on top
        // of the one already in flight. Scrolling stays enabled.
        refreshControl={
          loading ? undefined
            : <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={[s.greeting, { color: colors.textMuted }]}>{t('dashboard.welcome_back')}</Text>
            <Text style={[s.name, { color: colors.textPrimary }]}>{user?.displayName ?? 'User'}</Text>
          </View>
          <TouchableOpacity
            style={[s.headerBtn, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}
            onPress={() => router.push('/notes')}
            accessibilityRole="button"
            accessibilityLabel={t('notes.title')}
            hitSlop={8}
          >
            <Feather name="file-text" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {error && !loading && (
          <ErrorState
            compact={overview !== null}
            message={error}
            onRetry={() => fetchData('initial')}
          />
        )}

        {/* Budget alert */}
        {budgetPct >= 80 && (
          <View style={[s.alert, { backgroundColor: budgetPct >= 100 ? colors.dangerBg : colors.warningBg }]}>
            <Feather name="alert-triangle" size={16} color={budgetPct >= 100 ? colors.danger : colors.warning} />
            <Text style={[s.alertText, { color: budgetPct >= 100 ? colors.dangerText : colors.warningText }]}>
              {budgetPct >= 100
                ? t('dashboard.budget_exceeded', { pct: budgetPct.toFixed(0) })
                : t('dashboard.budget_warning', { pct: budgetPct.toFixed(0) })}
            </Text>
          </View>
        )}

        {/* Stat cards 2×2 grid */}
        {loading ? (
          <StatGridSkeleton />
        ) : (
          <View style={s.cardGrid}>
            <View style={s.cardRow}>
              <StatCard title={t('dashboard.total_income')} value={format(overview?.totalIncome ?? 0)} icon="trending-up" variant="success" />
              <View style={s.cardGap} />
              <StatCard title={t('dashboard.total_expenses')} value={format(overview?.totalExpenses ?? 0)} icon="trending-down" variant="danger" />
            </View>
            <View style={s.cardRow}>
              <StatCard title={t('dashboard.balance')} value={format(overview?.balance ?? 0)} icon="dollar-sign" variant="primary" />
              <View style={s.cardGap} />
              <StatCard title={t('dashboard.budget_used')} value={`${budgetPct.toFixed(1)}%`} icon="pie-chart" variant="warning" subtitle={t('dashboard.of_budget', { amount: format(overview?.budgetLimit ?? 0) })} />
            </View>
          </View>
        )}

        {/* Lending summary */}
        {loading ? <LendingSummarySkeleton /> : <LendingSummaryCards summary={lendingSummary} />}

        {/* Pie chart */}
        <View style={[s.chartCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Text style={[s.chartTitle, { color: colors.textPrimary }]}>{t('dashboard.expenses_by_category')}</Text>
          {loading
            ? <ChartSkeleton />
            : <ExpensePieChart data={expensesByCategory} />}
        </View>

        {/* Bar chart */}
        <View style={[s.chartCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <Text style={[s.chartTitle, { color: colors.textPrimary }]}>{t('dashboard.income_vs_expenses')}</Text>
          {loading
            ? <ChartSkeleton />
            : <TrendsBarChart data={trends} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (colors: any) => StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: 16, gap: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontSize: 13 },
  name: { fontSize: 22, fontWeight: '700' },
  headerBtn: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  alert: { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  alertText: { flex: 1, fontSize: 13, lineHeight: 18 },
  cardGrid: { gap: 12 },
  cardRow: { flexDirection: 'row' },
  cardGap: { width: 12 },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
});
