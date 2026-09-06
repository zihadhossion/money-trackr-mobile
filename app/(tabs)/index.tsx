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
import { fontSize, fontWeight, lineHeight } from '../../src/theme/typography';

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

  // budgetUsed already IS a percentage of the monthly budget (the backend does
  // spent/limit*100). Dividing by the limit again turned 62% into 0.31% here and
  // kept the 80%/100% alert from ever firing.
  const budgetPct = overview?.budgetUsed ?? 0;
  const budgetLimit = overview?.budgetLimit ?? 0;
  // The endpoint sends no taka figure for the month, so recover it from the
  // percentage. Only meaningful once a budget exists.
  const monthExpenses = (budgetPct / 100) * budgetLimit;

  // The overview endpoint returns all-time income/expenses/balance but a
  // current-month budget, and the two charts are month- and year-scoped. One
  // header date would mislabel three of the four, so each block states its own.
  const monthLabel = useMemo(() => {
    const months = t('months_long', { returnObjects: true }) as readonly string[];
    return t('dashboard.scope_month_year', { month: months[currentMonth - 1], year: String(currentYear) });
  }, [t, currentMonth, currentYear]);

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
          {/* Notes is the one screen with no tab of its own, so a bare icon
              here was the whole of its discoverability. The label carries it. */}
          <TouchableOpacity
            style={[s.headerBtn, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}
            onPress={() => router.push('/notes')}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Feather name="file-text" size={18} color={colors.primary} />
            <Text style={[s.headerBtnText, { color: colors.primary }]}>{t('notes.title')}</Text>
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
        {budgetLimit > 0 && budgetPct >= 80 && (
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
            <Text style={[s.scope, { color: colors.textMuted }]}>{t('dashboard.scope_all_time')}</Text>
            <View style={s.cardRow}>
              <StatCard
                title={t('dashboard.total_income')}
                value={format(overview?.totalIncome ?? 0)}
                icon="trending-up"
                variant="success"
                onPress={() => router.push('/income')}
                accessibilityLabel={t('a11y.open_income')}
              />
              <View style={s.cardGap} />
              <StatCard
                title={t('dashboard.total_expenses')}
                value={format(overview?.totalExpenses ?? 0)}
                icon="trending-down"
                variant="danger"
                onPress={() => router.push('/expenses')}
                accessibilityLabel={t('a11y.open_expenses')}
              />
            </View>
            <View style={s.cardRow}>
              <StatCard title={t('dashboard.balance')} value={format(overview?.balance ?? 0)} icon="dollar-sign" variant="primary" />
              <View style={s.cardGap} />
              <StatCard
                title={t('dashboard.budget_used')}
                value={budgetLimit > 0 ? `${budgetPct.toFixed(1)}%` : '—'}
                icon="pie-chart"
                variant="warning"
                badge={t('dashboard.scope_this_month')}
                onPress={() => router.push('/settings')}
                accessibilityLabel={t('a11y.open_budget')}
                subtitle={budgetLimit > 0
                  ? t('dashboard.of_budget', { spent: format(monthExpenses), limit: format(budgetLimit) })
                  : t('dashboard.no_budget_set')}
              />
            </View>
          </View>
        )}

        {/* Lending summary */}
        {loading ? <LendingSummarySkeleton /> : <LendingSummaryCards summary={lendingSummary} />}

        {/* Pie chart */}
        <View style={[s.chartCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <View style={s.chartHeader}>
            <Text style={[s.chartTitle, { color: colors.textPrimary }]}>{t('dashboard.expenses_by_category')}</Text>
            <Text style={[s.scope, { color: colors.textMuted }]}>{monthLabel}</Text>
          </View>
          {loading
            ? <ChartSkeleton />
            : <ExpensePieChart data={expensesByCategory} />}
        </View>

        {/* Bar chart */}
        <View style={[s.chartCard, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
          <View style={s.chartHeader}>
            <Text style={[s.chartTitle, { color: colors.textPrimary }]}>{t('dashboard.income_vs_expenses')}</Text>
            <Text style={[s.scope, { color: colors.textMuted }]}>{currentYear}</Text>
          </View>
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
  greeting: { fontSize: fontSize.meta },
  name: { fontSize: fontSize.title, fontWeight: fontWeight.bold },
  headerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 42, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
  headerBtnText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  alert: { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  alertText: { flex: 1, fontSize: fontSize.meta, lineHeight: lineHeight.meta },
  cardGrid: { gap: 12 },
  cardRow: { flexDirection: 'row' },
  cardGap: { width: 12 },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  chartTitle: { fontSize: fontSize.emphasis, fontWeight: fontWeight.bold, flexShrink: 1 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 },
  scope: { fontSize: fontSize.meta, fontWeight: fontWeight.semibold },
});
