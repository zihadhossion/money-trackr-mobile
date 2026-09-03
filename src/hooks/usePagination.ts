import { useState, useCallback, useEffect, useRef } from 'react';
import type { NativeScrollEvent } from 'react-native';

export interface PaginatedResult<T, M = undefined> {
  data: T[];
  totalPages: number;
  meta?: M;
}

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
  refresh: () => void;
  loadMore: () => void;
  onScroll: (event: { nativeEvent: NativeScrollEvent }) => void;
}

export function usePagination<T, M = undefined>({
  fetcher,
  deps = [],
  pageSize = 15,
}: UsePaginationOptions<T, M>): UsePaginationReturn<T, M> {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<M | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const loadPage = useCallback(async (pageNum: number, isRefresh = false) => {
    if (pageNum === 1) {
      if (isRefresh) setRefreshing(true); else setLoading(true);
    } else {
      setLoadingMore(true);
    }
    try {
      const result = await fetcherRef.current(pageNum, pageSize);
      setData((prev) => (pageNum === 1 ? result.data : [...prev, ...result.data]));
      setMeta(result.meta);
      setHasMore(pageNum < result.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [pageSize]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
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
    setHasMore(true);
    loadPage(1, true);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [loadingMore, hasMore]);

  const onScroll = useCallback(({ nativeEvent }: { nativeEvent: NativeScrollEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const threshold = 50;
    if (!loading && layoutMeasurement.height + contentOffset.y >= contentSize.height - threshold) {
      loadMore();
    }
  }, [loading, loadMore]);

  return { data, meta, loading, loadingMore, refreshing, hasMore, refresh, loadMore, onScroll };
}
