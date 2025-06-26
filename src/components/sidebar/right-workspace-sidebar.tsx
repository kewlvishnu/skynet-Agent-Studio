"use client";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RightWorkspaceSidebar() {
	return (
		<Sidebar
			side="right"
			className="w-60 border-r border-gray absolute top-0 right-0 h-full mt-0.5 bg-background z-20"
		>
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
					<div className="w-full border-b border-gray relative h-10">
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
						></TabsContent>
						<TabsContent value="tools"></TabsContent>
					</div>
				</Tabs>
			</SidebarContent>
			<SidebarFooter className="h-16 border-t border-gray z-50">
				<SidebarTrigger className="ml-auto size-8 z-50 absolute right-3 bottom-5" />
			</SidebarFooter>
		</Sidebar>
	);
}
