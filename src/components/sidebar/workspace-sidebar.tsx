"use client";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { blocks } from "@/utils/constants/blocks";
import { getSubnets } from "@/controllers/subnets/subnets.queries";
import { getAgents } from "@/controllers/agents/agents.queries";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";

const ITEMS_PER_PAGE = 10;
const navigationItems = [
	{ name: "Blocks", value: "blocks" },
	{ name: "Tools", value: "tools" },
	{ name: "Agents", value: "agents" },
] as const;



const useInfiniteScroll = (
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

const usePaginatedData = <T extends { data: any }>(
	fetchFunction: (params: { offset: number; limit: number }) => Promise<T>,
	getItemsArray: (data: T) => any[]
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


interface DraggableItemProps {
	item: any;
	title: string;
	description: string;
	icon?: React.ComponentType<{ className?: string }>;
	color?: string;
	isLast?: boolean;
	lastElementRef?: (node: HTMLDivElement) => void;
}

const DraggableItem = ({
	item,
	title,
	description,
	icon:  Icon,
	color,
	isLast,
	lastElementRef,
}: DraggableItemProps) => {
	const handleDragStart = useCallback(
		(e: React.DragEvent) => {
			e.dataTransfer.setData(
				"application/reactflow",
				JSON.stringify(item)
			);
		},
		[item]
	);

	return (
		<div
			ref={isLast ? lastElementRef : undefined}
			className="w-full h-fit border border-gray p-3 flex items-center gap-2 rounded-md bg-background hover:bg-accent/50 transition-colors cursor-grab active:cursor-grabbing"
			draggable
			onDragStart={handleDragStart}
		>
			{Icon && color && (
				<div
					className={`${color} size-8 rounded-sm flex items-center justify-center flex-shrink-0`}
				>
					<Icon className="size-5 text-primary-foreground" />
				</div>
			)}
			<div className="flex flex-col min-w-0 flex-1">
				<h6
					className="font-medium text-sm capitalize truncate"
					title={title}
				>
					{title}
				</h6>
				<p className="text-xs text-muted-foreground line-clamp-4 break-words">
					{description}
				</p>
			</div>
		</div>
	);
};

export default function WorkspaceSidebar() {
	const getSubnetsArray = useCallback(
		(data: SubnetResponse) => data.data.subnets,
		[]
	);
	const getAgentsArray = useCallback(
		(data: AgentResponse) => data.data.agents,
		[]
	);

	const {
		data: tools,
		isLoading: isLoadingTools,
		hasMore: hasMoreTools,
		loadMore: loadMoreTools,
		reset: resetTools,
	} = usePaginatedData(getSubnets, getSubnetsArray);

	const {
		data: agents,
		isLoading: isLoadingAgents,
		hasMore: hasMoreAgents,
		loadMore: loadMoreAgents,
		reset: resetAgents,
	} = usePaginatedData(getAgents, getAgentsArray);

	const lastToolRef = useInfiniteScroll(
		loadMoreTools,
		isLoadingTools,
		hasMoreTools
	);
	const lastAgentRef = useInfiniteScroll(
		loadMoreAgents,
		isLoadingAgents,
		hasMoreAgents
	);

	useEffect(() => {
		resetTools();
		resetAgents();
	}, [resetTools, resetAgents]);

	const renderedBlocks = useMemo(
		() =>
			blocks.map((block) => {
				const Icon = block.icon;
				return (
					<DraggableItem
						key={block.type}
						item={block}
						title={block.title}
						description={block.description}
						icon={Icon as React.ComponentType<{ className?: string }>}
						color={block.color}
					/>
				);
			}),
		[blocks]
	);

	const renderedTools = useMemo(
		() =>
			tools?.data.subnets.map((tool, index) => (
				<DraggableItem
					key={`${tool.unique_id}-${index}`}
					item={tool}
					title={tool.subnet_name}
					description={tool.description}
					isLast={index === tools.data.subnets.length - 1}
					lastElementRef={lastToolRef}
				/>
			)) || [],
		[tools, lastToolRef]
	);

	const renderedAgents = useMemo(
		() =>
			agents?.data.agents.map((agent, index) => (
				<DraggableItem
					key={`${agent.id}-${index}`}
					item={agent}
					title={agent.name}
					description={
						agent.description || "No description available"
					}
					isLast={index === agents.data.agents.length - 1}
					lastElementRef={lastAgentRef}
				/>
			)) || [],
		[agents, lastAgentRef]
	);

	return (
		<Sidebar
			className="w-60 border-r border-gray absolute top-1 left-0 h-full mt-0.5 bg-background z-20"
			collapsible="icon"
		>
			<SidebarHeader className="h-14 px-2.5">
				<div className="flex items-center w-full px-2.5 group-data-[collapsible=icon]:hidden">
					<Search className="size-4 absolute left-8 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Search..."
						className="w-full bg-transparent relative pl-10 h-10 rounded-md border border-gray"
					/>
				</div>
			</SidebarHeader>

			<SidebarContent className="overflow-hidden group-data-[collapsible=icon]:overflow-hidden">
				<Tabs
					defaultValue="blocks"
					className="w-full h-full group-data-[collapsible=icon]:hidden"
				>
					<div className="w-full border-b border-gray relative h-10">
						<TabsList className="w-fit bg-transparent py-0 my-0 absolute left-3 top-[7px] flex items-center gap-x-6">
							{navigationItems.map((item) => (
								<TabsTrigger
									key={item.name}
									value={item.value}
									className="w-fit text-sm border-b-4 px-0 pb-1 border-transparent bg-transparent rounded-none data-[state=active]:border-b-4 data-[state=active]:border-eerie-black/70 transition-all duration-200 ease-in-out"
								>
									{item.name}
								</TabsTrigger>
							))}
						</TabsList>
					</div>

					<div className="w-full h-full">
						<TabsContent
							value="blocks"
							className="w-full h-[calc(100%-4rem)] overflow-y-auto"
						>
							<div className="w-[90%] mx-auto h-full gap-4 flex flex-col py-4">
								{renderedBlocks}
							</div>
						</TabsContent>

						<TabsContent
							value="tools"
							className="w-full h-[calc(100%-4rem)] overflow-y-auto"
						>
							<div className="w-[90%] mx-auto h-full gap-4 flex flex-col py-4">
								{renderedTools}
								{isLoadingTools && (
									<div className="flex justify-center py-4">
										<Loader2 className="size-4 animate-spin" />
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent
							value="agents"
							className="w-full h-[calc(100%-4rem)] overflow-y-auto"
						>
							<div className="w-[90%] mx-auto h-full gap-4 flex flex-col py-4">
								{renderedAgents}
								{isLoadingAgents && (
									<div className="flex justify-center py-4">
										<Loader2 className="size-4 animate-spin" />
									</div>
								)}
							</div>
						</TabsContent>
					</div>
				</Tabs>
			</SidebarContent>

			<SidebarFooter className="h-16 border-t border-gray z-50 bg-background">
				<div className="flex items-center justify-between p-2 group-data-[collapsible=icon]:hidden">
					<SidebarTrigger className="size-8" />
				</div>
				<div className="hidden group-data-[collapsible=icon]:flex items-center justify-center p-2">
					<SidebarTrigger className="size-8" />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
