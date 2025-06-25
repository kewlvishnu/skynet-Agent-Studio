"use client";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { blocks } from "@/utils/constants/blocks";

export default function AppSidebar() {
	return (
		<Sidebar className="w-60 border-r border-gray-800 absolute top-1 left-0 h-full mt-0.5 bg-background z-20">
			<SidebarHeader className="h-14 ">
				<div className="flex items-center px-2.5">
					<Search className="size-4 absolute left-8 text-muted-foreground" />
					<Input
						placeholder="Search..."
						className="w-full bg-transparent relative pl-10 h-10"
					/>
				</div>
			</SidebarHeader>
			<SidebarContent className="overflow-hidden">
				<Tabs defaultValue="blocks" className="w-full h-full">
					<div className="w-full border-b border-gray-800 relative h-10">
						<TabsList className="w-fit bg-transparent py-0 my-0 absolute left-3 top-[5px] flex items-center gap-x-6">
							<TabsTrigger
								value="blocks"
								className="w-fit text-sm border-b-2 px-0 pb-2  border-transparent bg-transparent rounded-none data-[state=active]:border-b data-[state=active]:border-white"
							>
								Blocks
							</TabsTrigger>
							<TabsTrigger
								value="tools"
								className="w-fit text-sm border-b-2 px-0 pb-2 border-transparent bg-transparent rounded-none data-[state=active]:border-b data-[state=active]:border-white"
							>
								Tools
							</TabsTrigger>
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
											className="w-full h-full border border-gray-700 p-3 flex items-center gap-2"
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
						<TabsContent value="tools"></TabsContent>
					</div>
				</Tabs>
			</SidebarContent>
			<SidebarFooter className="h-16 border-t border-gray-800 z-50 bg-background">
				<SidebarTrigger className="ml-auto size-8 z-50" />
			</SidebarFooter>
		</Sidebar>
	);
}
