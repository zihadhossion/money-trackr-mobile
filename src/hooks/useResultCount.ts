import { useState, useEffect } from 'react';

/**
 * Total rows a pending filter selection would return, for the sheet's apply
 * button.
 *
 * Cheap on purpose: the list endpoints already report `total`, so this asks
 * for a single row and reads that number rather than fetching results the
 * user has not asked to see yet. Debounced, because it re-runs on every tap
 * inside the sheet.
 *
 * `undefined` means "not known" — while counting, on failure, or while the
 * sheet is closed. The button then reads "Apply" instead of a stale figure.
 */
export function useResultCount(fetchTotal: () => Promise<number>, enabled: boolean): number | undefined {
  const [count, setCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      setCount(undefined);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchTotal()
        .then((total) => { if (!cancelled) setCount(total); })
        // A failed count must not block applying the filter, so it just goes
        // quiet and the button falls back to "Apply".
        .catch(() => { if (!cancelled) setCount(undefined); });
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [fetchTotal, enabled]);

  return count;
}
