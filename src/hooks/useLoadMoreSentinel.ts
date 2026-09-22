import { useEffect, useRef } from "react";

interface Options {
    /** Observe only while the list is idle (not loading, not failed, has more). */
    enabled: boolean;
    onLoadMore: () => void;
    /** Change it after every loaded chunk (e.g. the list length): the observer is re-created and reports again. */
    rearmKey: unknown;
}

/**
 * Calls onLoadMore when the returned ref's element comes near the viewport.
 *
 * A fresh IntersectionObserver reports the current state right after observe(); a long-lived one stays silent while
 * the element keeps intersecting. So after each chunk the observer is re-created: if the sentinel is still visible
 * (short chunk, tall screen), the next chunk is requested immediately.
 */
export const useLoadMoreSentinel = ({ enabled, onLoadMore, rearmKey }: Options) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const onLoadMoreRef = useRef(onLoadMore);

    useEffect(() => {
        onLoadMoreRef.current = onLoadMore;
    });

    useEffect(() => {
        const el = ref.current;
        if (!enabled || !el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) onLoadMoreRef.current();
            },
            { rootMargin: "400px" }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [enabled, rearmKey]);

    return ref;
};