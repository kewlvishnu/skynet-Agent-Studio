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
import { useEffect, useCallback, useMemo, useState } from "react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { usePaginatedData } from "@/hooks/use-paginated-data";
import { DraggableItem } from "./draggable-item";

const navigationItems = [
	{ name: "Blocks", value: "blocks" },
	{ name: "Tools", value: "tools" },
	{ name: "Agents", value: "agents" },
] as const;

// Debounce search
const useDebounceSearch = (value: string, delay: number = 300) => {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
};

export default function WorkspaceSidebar() {
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState("blocks");
	
	const debouncedSearchTerm = useDebounceSearch(searchTerm);

	const getSubnetsArray = useCallback(
		(data: SubnetResponse) => data.data.subnets,
		[]
	);
	const getAgentsArray = useCallback(
		(data: AgentResponse) => data.data.agents,
		[]
	);

	// Memoized subnets fetch function
	const fetchSubnetsWithSearch = useCallback(
		(params: { offset: number; limit: number }) =>
			getSubnets({
				...params,
				...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
			}),
		[debouncedSearchTerm]
	);

	const fetchAgentsWithSearch = useCallback(
		(params: { offset: number; limit: number }) =>
			getAgents({
				...params,
				...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
			}),
		[debouncedSearchTerm]
	);

	const {
		data: tools,
		isLoading: isLoadingTools,
		hasMore: hasMoreTools,
		loadMore: loadMoreTools,
		reset: resetTools,
		error: toolsError,
	} = usePaginatedData(fetchSubnetsWithSearch, getSubnetsArray);

	const {
		data: agents,
		isLoading: isLoadingAgents,
		hasMore: hasMoreAgents,
		loadMore: loadMoreAgents,
		reset: resetAgents,
		error: agentsError,
	} = usePaginatedData(fetchAgentsWithSearch, getAgentsArray);

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

	// Initial load
	useEffect(() => {
		resetTools();
		resetAgents();
	}, [resetTools, resetAgents]);

	// Reset data whenever debounced search term changes
	useEffect(() => {
		resetTools();
		resetAgents();
	}, [debouncedSearchTerm, resetTools, resetAgents]);

	// Reset data when switching tabs with an active search term
	useEffect(() => {
		if (debouncedSearchTerm) {
			if (activeTab === "tools") {
				resetTools();
			} else if (activeTab === "agents") {
				resetAgents();
			}
		}
	}, [activeTab, debouncedSearchTerm, resetTools, resetAgents]);

	// Memoizing blocks filtering (client-side search)
	const filteredBlocks = useMemo(() => {
		if (!searchTerm) return blocks;
		const lowerSearchTerm = searchTerm.toLowerCase();
		return blocks.filter(
			(block) =>
				block.title.toLowerCase().includes(lowerSearchTerm) ||
				block.description.toLowerCase().includes(lowerSearchTerm)
		);
	}, [searchTerm]); 


	// Blocks rendering is memoized
	const renderedBlocks = useMemo(
		() =>
			filteredBlocks.map((block) => {
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
		[filteredBlocks]
	);

	// Tools rendering is not memoized
	const renderedTools = tools?.data.subnets.map((tool, index) => (
		<DraggableItem
			key={`${tool.unique_id}-${index}`}
			item={tool}
			title={tool.subnet_name}
			description={tool.description}
			isLast={index === tools.data.subnets.length - 1}
			lastElementRef={lastToolRef}
		/>
	)) || [];

	// Agents rendering is not memoized
	const renderedAgents = agents?.data.agents.map((agent, index) => (
		<DraggableItem
			key={`${agent.id}-${index}`}
			item={agent}
			title={agent.name}
			description={agent.description || "No description available"}
			isLast={index === agents.data.agents.length - 1}
			lastElementRef={lastAgentRef}
		/>
	)) || [];

	const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
	}, []);

	const showToolsLoading = isLoadingTools && debouncedSearchTerm;
	const showAgentsLoading = isLoadingAgents && debouncedSearchTerm;

	return (
		<Sidebar
			className="w-60 border-r border-gray absolute top-0 left-0 h-full bg-background z-20"
			collapsible="icon"
		>
			<SidebarHeader className="h-14 px-2.5">
				<div className="flex items-center w-full px-2.5 group-data-[collapsible=icon]:hidden">
					<Search className="size-4 absolute left-8 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Search..."
						value={searchTerm}
						onChange={handleSearchChange}
						className="w-full bg-transparent relative pl-10 h-10 rounded-md border border-gray"
					/>
				</div>
			</SidebarHeader>

			<SidebarContent className="overflow-hidden group-data-[collapsible=icon]:overflow-hidden">
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className="w-full h-full group-data-[collapsible=icon]:hidden"
				>
					<div className="w-full border-b border-gray relative h-10">
						<TabsList className="w-fit bg-transparent py-0 my-0 absolute left-3 top-[7px] flex items-center gap-x-6">
							{navigationItems.map((item) => (
								<TabsTrigger
									key={item.name}
									value={item.value}
									className="w-fit text-sm border-b-4 px-0 pb-1 border-transparent bg-transparent rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-eerie-black/70 transition-all duration-200 ease-in-out"
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
								{searchTerm && filteredBlocks.length === 0 && (
									<div className="text-center text-muted-foreground py-8">
										No blocks found for &quot;{searchTerm}&quot;
									</div>
								)}
							</div>
						</TabsContent>

						<TabsContent
							value="tools"
							className="w-full h-[calc(100%-4rem)] overflow-y-auto"
						>
							<div className="w-[90%] mx-auto h-full gap-4 flex flex-col py-4">
								{toolsError ? (
									<div className="text-center text-destructive py-8">
										Failed to fetch tools
									</div>
								) : (
									<>
										{renderedTools}
										{showToolsLoading && (
											<div className="flex justify-center py-4">
												<Loader2 className="size-4 animate-spin" />
											</div>
										)}
										{debouncedSearchTerm && renderedTools.length === 0 && !isLoadingTools && (
											<div className="text-center text-muted-foreground py-8">
												No tools found for &quot;{debouncedSearchTerm}&quot;
											</div>
										)}
										{isLoadingTools && !debouncedSearchTerm && (
											<div className="flex justify-center py-4">
												<Loader2 className="size-4 animate-spin" />
											</div>
										)}
									</>
								)}
							</div>
						</TabsContent>

						<TabsContent
							value="agents"
							className="w-full h-[calc(100%-4rem)] overflow-y-auto"
						>
							<div className="w-[90%] mx-auto h-full gap-4 flex flex-col py-4">
								{agentsError ? (
									<div className="text-center text-destructive py-8">
										Failed to fetch agents
									</div>
								) : (
									<>
										{renderedAgents}
										{showAgentsLoading && (
											<div className="flex justify-center py-4">
												<Loader2 className="size-4 animate-spin" />
											</div>
										)}
										{debouncedSearchTerm && renderedAgents.length === 0 && !isLoadingAgents && (
											<div className="text-center text-muted-foreground py-8">
												No agents found for &quot;{debouncedSearchTerm}&quot;
											</div>
										)}
										{isLoadingAgents && !debouncedSearchTerm && (
											<div className="flex justify-center py-4">
												<Loader2 className="size-4 animate-spin" />
											</div>
										)}
									</>
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