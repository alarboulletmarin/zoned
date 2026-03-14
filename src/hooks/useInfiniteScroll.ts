import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll({
  hasMore,
  onLoadMore,
  rootMargin = "200px",
  threshold = 0.1,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const loadMore = useCallback(() => {
    if (!isLoadingRef.current && hasMore) {
      isLoadingRef.current = true;
      onLoadMore();
      requestAnimationFrame(() => {
        isLoadingRef.current = false;
      });
    }
  }, [hasMore, onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadMore, rootMargin, threshold]);

  return { sentinelRef };
}
