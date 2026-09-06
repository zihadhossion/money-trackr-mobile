import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMonthDateRange } from '../utils/date';
import type { ActiveFilter } from '../components/ui/ActiveFilterChips';

export type Period = 'month' | 'lastMonth' | 'all';

export interface PeriodFilter {
  period: Period;
  month: number;
  year: number;
}

function lastMonthOf(now: Date): { month: number; year: number } {
  const m = now.getMonth();
  return m === 0
    ? { month: 12, year: now.getFullYear() - 1 }
    : { month: m, year: now.getFullYear() };
}

export function currentPeriod(): PeriodFilter {
  const now = new Date();
  return { period: 'month', month: now.getMonth() + 1, year: now.getFullYear() };
}

/**
 * The date range a period selection means. 'all' deliberately returns no
 * dates: the API treats missing bounds as unbounded.
 */
export function periodRange({ period, month, year }: PeriodFilter): { startDate?: string; endDate?: string } {
  if (period === 'all') return {};
  if (period === 'lastMonth') {
    const lm = lastMonthOf(new Date());
    return getMonthDateRange(lm.year, lm.month);
  }
  return getMonthDateRange(year, month);
}

/**
 * Filter state for a list screen, in two halves.
 *
 * `applied` is what the list is fetched with. `draft` is what the sheet is
 * editing — nothing refetches until apply(), so a user setting three filters
 * costs one request instead of three. Removing a chip outside the sheet goes
 * through set(), which commits straight away.
 */
export function useListFilters<T extends object>(initialExtra: T) {
  const initial = useMemo(() => ({ ...currentPeriod(), ...initialExtra }), [initialExtra]);

  const [applied, setApplied] = useState<PeriodFilter & T>(initial);
  const [draft, setDraft] = useState<PeriodFilter & T>(initial);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Search sits outside the sheet, so it applies as the user types.
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openSheet = useCallback(() => {
    // Start from what is actually applied, not from wherever the sheet was
    // left when it was last dismissed without applying.
    setDraft(applied);
    setSheetOpen(true);
  }, [applied]);

  const closeSheet = useCallback(() => setSheetOpen(false), []);

  const apply = useCallback(() => {
    setApplied(draft);
    setSheetOpen(false);
  }, [draft]);

  const resetDraft = useCallback(() => setDraft(initial), [initial]);

  /** Commit one change immediately — used by the removable chips. */
  const set = useCallback((patch: Partial<PeriodFilter & T>) => {
    const next = { ...applied, ...patch };
    setApplied(next);
    setDraft(next);
  }, [applied]);

  const clearAll = useCallback(() => {
    setApplied(initial);
    setDraft(initial);
    setSearch('');
  }, [initial]);

  return {
    applied, draft, setDraft,
    search, setSearch, debouncedSearch,
    sheetOpen, openSheet, closeSheet,
    apply, resetDraft, set, clearAll,
  };
}

/**
 * The period as a removable chip, or null while it sits on its default of the
 * current month — a chip for "the month you are already looking at" would be
 * noise on every screen, every time.
 */
export function usePeriodChip(applied: PeriodFilter, set: (patch: Partial<PeriodFilter>) => void): ActiveFilter | null {
  const { t } = useTranslation();
  return useMemo(() => {
    const now = new Date();
    const toCurrentMonth = () => set({ period: 'month', month: now.getMonth() + 1, year: now.getFullYear() });

    if (applied.period === 'all') {
      return { key: 'period', value: t('filters.all_time'), onRemove: toCurrentMonth };
    }
    if (applied.period === 'lastMonth') {
      return { key: 'period', value: t('filters.last_month'), onRemove: toCurrentMonth };
    }
    const isCurrent = applied.month === now.getMonth() + 1 && applied.year === now.getFullYear();
    if (isCurrent) return null;

    const months = t('months_short', { returnObjects: true }) as readonly string[];
    return {
      key: 'period',
      value: `${months[applied.month - 1]} ${applied.year}`,
      onRemove: toCurrentMonth,
    };
  }, [applied, set, t]);
}
