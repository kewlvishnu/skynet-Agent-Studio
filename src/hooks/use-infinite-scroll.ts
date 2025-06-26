import { useEffect, useRef, useCallback } from "react";

export const useInfiniteScroll = (
	fetchFunction: (page: number) => Promise<void>,
	isLoading: boolean,
	hasMore: boolean
) => {
	const observerRef = useRef<IntersectionObserver | null>(null);

	const lastElementRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (isLoading || !node) return;

			observerRef.current?.disconnect();
			observerRef.current = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting && hasMore) {
						fetchFunction(0);
					}
				},
				{ threshold: 0.1 }
			);
			observerRef.current.observe(node);
		},
		[isLoading, hasMore, fetchFunction]
	);

	useEffect(() => {
		return () => observerRef.current?.disconnect();
	}, []);

	return lastElementRef;
};
