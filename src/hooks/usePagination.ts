import { useState, useCallback, useEffect, useRef } from 'react';
import { getErrorMessage } from '../utils/error';

export interface PaginatedResult<T, M = undefined> {
  data: T[];
  totalPages: number;
  meta?: M;
}

type Indicator = 'initial' | 'pull' | 'silent';

export interface UsePaginationOptions<T, M = undefined> {
  fetcher: (page: number, pageSize: number) => Promise<PaginatedResult<T, M>>;
  deps?: React.DependencyList;
  pageSize?: number;
}

export interface UsePaginationReturn<T, M = undefined> {
  data: T[];
  meta: M | undefined;
  loading: boolean;
  loadingMore: boolean;
  refreshing: boolean;
  hasMore: boolean;
  /** True while any page-1 fetch is running, silent reloads included. */
  reloading: boolean;
  /** Message for the most recent failed fetch, or null. Distinguishes a
   *  genuinely empty list from a request that never succeeded. */
  error: string | null;
  /** Pull-to-refresh: refetches page 1 behind the RefreshControl spinner. */
  refresh: () => void;
  /** Same refetch, but with no spinner — for automatic reloads the user did
   *  not ask for, such as a tab regaining focus. */
  reload: () => void;
  /** Re-attempt the page that just failed (page 1, or the failed "load more"). */
  retry: () => void;
  loadMore: () => void;
}

export function usePagination<T, M = undefined>({
  fetcher,
  deps = [],
  pageSize = 15,
}: UsePaginationOptions<T, M>): UsePaginationReturn<T, M> {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<M | undefined>(undefined);
  const [page, setPage] = useState(1);
  // Only ever written from a server response. Guessing `true` on reload is what
  // made the footer flash "Load more" before page 1 had answered.
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // Render-visible twin of `firstPageInFlight`: refs do not re-render, and the
  // footer has to disappear for the whole duration of any page-1 fetch.
  const [reloading, setReloading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // `loading` cannot gate "load more" on its own: a silent reload deliberately
  // leaves it false, so a short list whose onEndReached fires on every layout
  // pass would slip through and request page 2. This ref is true for the whole
  // life of any page-1 fetch, whichever indicator it uses.
  const firstPageInFlight = useRef(false);
  // Bumped whenever a page-1 fetch starts. A response whose id no longer
  // matches belongs to a superseded request — dropping it stops a late page 2
  // from appending duplicates on top of freshly reloaded page-1 data.
  const requestId = useRef(0);

  const loadPage = useCallback(async (pageNum: number, indicator: Indicator = 'initial') => {
    if (pageNum === 1) {
      firstPageInFlight.current = true;
      requestId.current += 1;
      setReloading(true);
      if (indicator === 'pull') setRefreshing(true);
      else if (indicator === 'initial') setLoading(true);
    } else {
      setLoadingMore(true);
    }
    const id = requestId.current;

    try {
      const result = await fetcherRef.current(pageNum, pageSize);
      if (id !== requestId.current) return;
      setData((prev) => (pageNum === 1 ? result.data : [...prev, ...result.data]));
      setMeta(result.meta);
      setHasMore(pageNum < result.totalPages);
      setError(null);
    } catch (e) {
      if (id !== requestId.current) return;
      // Keep whatever is already on screen, but surface the failure so the
      // caller never renders "nothing here yet" for a request that failed.
      setError(getErrorMessage(e));
      if (pageNum === 1) setHasMore(false);
    } finally {
      if (pageNum === 1) firstPageInFlight.current = false;
      // A superseded request must not clear the spinners of the one that
      // replaced it; that newer fetch clears all three when it settles.
      if (id === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setReloading(false);
      }
    }
  }, [pageSize]);

  useEffect(() => {
    setPage(1);
    setError(null);
    loadPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (page > 1) {
      loadPage(page);
    }
  }, [page, loadPage]);

  const refresh = useCallback(() => {
    setPage(1);
    setError(null);
    loadPage(1, 'pull');
  }, [loadPage]);

  const reload = useCallback(() => {
    setPage(1);
    setError(null);
    loadPage(1, 'silent');
  }, [loadPage]);

  const retry = useCallback(() => {
    setError(null);
    loadPage(page);
  }, [loadPage, page]);

  const loadMore = useCallback(() => {
    // FlatList fires onEndReached on every layout pass where the content is
    // shorter than the viewport, which a short list always is. Without these
    // guards that requests page 2 while page 1 is still in flight.
    if (firstPageInFlight.current || loading || loadingMore || !hasMore || data.length === 0) return;
    setPage((prev) => prev + 1);
  }, [loading, loadingMore, hasMore, data.length]);

  return { data, meta, loading, loadingMore, refreshing, hasMore, reloading, error, refresh, reload, retry, loadMore };
}
