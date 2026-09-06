import { useState, useCallback, useEffect, useRef } from 'react';
import { getErrorMessage } from '../utils/error';

type Indicator = 'initial' | 'pull' | 'silent';

export interface UseAsyncDataOptions<T> {
  fetcher: () => Promise<T>;
  initial: T;
  deps?: React.DependencyList;
}

export interface UseAsyncDataReturn<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  loading: boolean;
  refreshing: boolean;
  /** Message for the most recent failed fetch, or null. */
  error: string | null;
  /** Pull-to-refresh: refetches behind the RefreshControl spinner. */
  refresh: () => void;
  /** Same refetch with no spinner, for reloads the user did not ask for. */
  reload: () => void;
  retry: () => void;
}

/**
 * The unpaginated sibling of `usePagination`: one request, the same
 * error/retry contract. Screens that fetch a whole collection at once used to
 * swallow their failures in a `console.error`, leaving the user on a blank
 * screen with no way back.
 */
export function useAsyncData<T>({ fetcher, initial, deps = [] }: UseAsyncDataOptions<T>): UseAsyncDataReturn<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Bumped on every load; a response whose id has been superseded is dropped
  // so a slow first request cannot overwrite a newer one's data.
  const requestId = useRef(0);

  const load = useCallback(async (indicator: Indicator = 'initial') => {
    requestId.current += 1;
    const id = requestId.current;
    if (indicator === 'pull') setRefreshing(true);
    else if (indicator === 'initial') setLoading(true);

    try {
      const result = await fetcherRef.current();
      if (id !== requestId.current) return;
      setData(result);
      setError(null);
    } catch (e) {
      if (id !== requestId.current) return;
      setError(getErrorMessage(e));
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load('initial');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refresh = useCallback(() => load('pull'), [load]);
  const reload = useCallback(() => load('silent'), [load]);
  const retry = useCallback(() => load('initial'), [load]);

  return { data, setData, loading, refreshing, error, refresh, reload, retry };
}
