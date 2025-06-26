import { useEffect, useState, useCallback } from "react";

const ITEMS_PER_PAGE = 10;

export const usePaginatedData = <T extends { data: Record<string, unknown> }>(
	fetchFunction: (params: { offset: number; limit: number }) => Promise<T>,
	getItemsArray: (data: T) => unknown[]
) => {
	const [data, setData] = useState<T | undefined>();
	const [pagination, setPagination] = useState<PaginationState>({
		currentPage: 0,
		hasMore: true,
		isLoading: false,
	});

	const fetchData = useCallback(
		async (page: number) => {
			setPagination((prev) => ({ ...prev, isLoading: true }));

			try {
				const response = await fetchFunction({
					offset: page * ITEMS_PER_PAGE,
					limit: ITEMS_PER_PAGE,
				});

				const items = getItemsArray(response);

				setData((prevData) => {
					if (page === 0 || !prevData) return response;

					const prevItems = getItemsArray(prevData);
					return {
						...response,
						data: {
							...response.data,
							[Object.keys(response.data)[0]]: [
								...prevItems,
								...items,
							],
						},
					} as T;
				});

				setPagination((prev) => ({
					...prev,
					hasMore: items.length === ITEMS_PER_PAGE,
					isLoading: false,
				}));
			} catch (error) {
				console.error("Error fetching data:", error);
				setPagination((prev) => ({ ...prev, isLoading: false }));
			}
		},
		[fetchFunction, getItemsArray]
	);

	const loadMore = useCallback(async () => {
		if (!pagination.isLoading && pagination.hasMore) {
			const nextPage = pagination.currentPage + 1;
			setPagination((prev) => ({ ...prev, currentPage: nextPage }));
			fetchData(nextPage);
		}
	}, [
		fetchData,
		pagination.currentPage,
		pagination.isLoading,
		pagination.hasMore,
	]);

	const reset = useCallback(() => {
		setData(undefined);
		setPagination({ currentPage: 0, hasMore: true, isLoading: false });
		fetchData(0);
	}, [fetchData]);

	useEffect(() => {
		fetchData(pagination.currentPage);
	}, [pagination.currentPage]);

	return { data, ...pagination, loadMore, reset };
};
