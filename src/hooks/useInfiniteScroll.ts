import { useCallback, useEffect, useRef } from "react";

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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(hasMore);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const attach = useCallback(
    (node: HTMLDivElement) => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            !isLoadingRef.current &&
            hasMoreRef.current
          ) {
            isLoadingRef.current = true;
            onLoadMoreRef.current();
            // unobserve/re-observe: sentinel may stay intersecting after
            // new content renders, which would skip the next IO callback
            observer.unobserve(node);
            requestAnimationFrame(() => {
              isLoadingRef.current = false;
              if (
                hasMoreRef.current &&
                nodeRef.current === node &&
                observerRef.current === observer
              ) {
                observer.observe(node);
              }
            });
          }
        },
        { rootMargin, threshold },
      );
      observerRef.current = observer;
      observer.observe(node);
    },
    [rootMargin, threshold],
  );

  useEffect(() => {
    if (!hasMore && observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    } else if (hasMore && !observerRef.current && nodeRef.current) {
      attach(nodeRef.current);
    }
  }, [hasMore, attach]);

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      nodeRef.current = node;
      if (node && hasMoreRef.current) {
        attach(node);
      }
    },
    [attach],
  );

  return { sentinelRef };
}
