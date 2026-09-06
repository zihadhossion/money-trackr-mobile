/**
 * Geometry shared between a component and its loading skeleton.
 *
 * A skeleton is only useful while it matches the real content's footprint —
 * if the two drift, the layout jumps the moment data arrives. Both sides read
 * these numbers so a change lands in one place.
 */

/** Minimum touch target: Apple HIG and WCAG 2.5.5 both ask for 44. */
export const TOUCH_TARGET = 44;

/**
 * Every row-level edit/delete/repay button, on every card. One shape so a
 * transaction row, a category tile, a lending card and a note all read as the
 * same control instead of three sizes and two styles.
 */
export const ROW_ACTION = {
  size: TOUCH_TARGET,
  iconSize: 18,
} as const;

/** TransactionItem / TransactionListSkeleton */
export const TRANSACTION_ROW = {
  padding: 12,
  radius: 12,
  gap: 12,
  marginBottom: 8,
  iconSize: 42,
  iconRadius: 12,
} as const;

/** LendingItem / LendingListSkeleton */
export const LENDING_CARD = {
  padding: 14,
  radius: 14,
  gap: 12,
  marginBottom: 10,
  iconSize: 36,
  iconRadius: 10,
} as const;

/** StatCard / StatGridSkeleton */
export const STAT_CARD = {
  padding: 16,
  radius: 16,
  gap: 12,
  minHeight: 110,
  iconSize: 40,
  iconRadius: 12,
} as const;

/** LendingSummaryCards / LendingSummarySkeleton */
export const SUMMARY_CARD = {
  padding: 14,
  radius: 14,
  gap: 12,
} as const;

/** Dashboard chart cards / ChartSkeleton */
export const CHART_CARD = {
  padding: 16,
  radius: 16,
  titleMarginBottom: 16,
  plotHeight: 200,
} as const;

/** CategoryCard / CategoryGridSkeleton */
export const CATEGORY_CARD = {
  padding: 14,
  radius: 14,
  gap: 8,
  minWidth: 90,
  iconSize: 50,
  iconRadius: 14,
} as const;

/** NoteCard / NoteListSkeleton */
export const NOTE_CARD = {
  padding: 14,
  radius: 14,
  marginBottom: 10,
  accentWidth: 4,
} as const;
