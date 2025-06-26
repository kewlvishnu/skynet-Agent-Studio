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
import { useEffect, useState, useRef, useCallback } from "react";
import { icons } from "@/utils/constants/icons";

const navigationItems = [
	{
		name: "Blocks",
		value: "blocks",
	},
	{
		name: "Tools",
		value: "tools",
	},
	{
		name: "Agents",
		value: "agents",
	},
];

export default function WorkspaceSidebar() {
	const [tools, setTools] = useState<SubnetResponse>();
	const [hasMore, setHasMore] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);

	const observerRef = useRef<IntersectionObserver>(null);

	const lastToolRef = useCallback(
		(node: HTMLDivElement) => {
			if (isLoading) return;
			if (observerRef.current) observerRef.current.disconnect();

			observerRef.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					setCurrentPage((prev) => prev + 1);
				}
			});

			if (node) observerRef.current.observe(node);
		},
		[isLoading, hasMore]
	);

	const fetchTools = async (page: number) => {
		setIsLoading(true);
		try {
			const response = await getSubnets({
				offset: page * 10,
				limit: 10,
			});

			if (page === 0) {
				// First page - replace all data
				setTools(response);
			} else {
				// Subsequent pages - append data
				setTools((prev) => {
					if (!prev) return response;
					return {
						...response,
						data: {
							...response.data,
							subnets: [
								...prev.data.subnets,
								...response.data.subnets,
							],
						},
					};
				});
			}

			setHasMore(response.data.subnets.length === 10);
		} catch (error) {
			console.error("Error fetching tools:", error);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchTools(currentPage);
	}, [currentPage]);

	// Reset pagination when component mounts
	useEffect(() => {
		setCurrentPage(0);
		setTools(undefined);
		setHasMore(true);
	}, []);

	return (
		<Sidebar
			className="w-60 border-r border-gray absolute top-1 left-0 h-full mt-0.5 bg-background z-20"
			collapsible="icon"
		>
			<SidebarHeader className="h-14 px-2.5">
				<div className="flex items-center w-full px-2.5 group-data-[collapsible=icon]:hidden">
					<Search className="size-4 absolute left-8 text-muted-foreground" />
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
									className="w-fit text-sm border-b-4	 px-0 pb-1 border-transparent bg-transparent rounded-none data-[state=active]:border-b-4 data-[state=active]:border-eerie-black/70 transition-all duration-200 ease-in-out"
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
							<div className="w-[90%] mx-auto h-full gap-4 flex flex-col">
								{blocks.map((block) => {
									const Icon = block.icon;
									return (
										<div
											key={block.type}
											className="w-full h-fit border border-gray p-3 flex items-center gap-2 rounded-md bg-background"
											draggable
											onDragStart={(e) => {
												e.dataTransfer.setData(
													"application/reactflow",
													JSON.stringify(block)
												);
											}}
										>
											<div
												className={`${block.color} size-8 rounded-sm flex items-center justify-center`}
											>
												<Icon className="size-5 text-primary-foreground" />
											</div>
											<div className="flex flex-col">
												<h6 className="font-medium text-sm">
													{block.title}
												</h6>
												<p className="text-xs text-muted-foreground">
													{block.description}
												</p>
											</div>
										</div>
									);
								})}
							</div>
						</TabsContent>
						<TabsContent
							value="tools"
							className="w-full h-[calc(100%-4rem)] overflow-y-auto"
						>
							<div className="w-[90%] mx-auto h-full gap-4 flex flex-col">
								{tools?.data.subnets.map((tool, index) => {
									const isLastTool =
										index === tools.data.subnets.length - 1;
									return (
										<div
											key={`${tool.unique_id}-${index}`}
											ref={
												isLastTool ? lastToolRef : null
											}
											className="w-full h-fit border border-gray p-3 flex items-center gap-2 rounded-md bg-background"
											draggable
											onDragStart={(e) => {
												e.dataTransfer.setData(
													"application/reactflow",
													JSON.stringify(tool)
												);
											}}
										>
											<div className="flex flex-col">
												<h6 className="font-medium text-sm capitalize">
													{tool.subnet_name}
												</h6>
												<p className="text-xs text-muted-foreground line-clamp-4">
													{tool.description}
												</p>
											</div>
										</div>
									);
								})}
								{isLoading && (
									<Loader2 className="size-4 animate-spin mx-auto" />
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
