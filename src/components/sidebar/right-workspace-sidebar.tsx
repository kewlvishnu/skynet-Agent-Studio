"use client";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RightWorkspaceSidebar() {
	return (
		<Sidebar
			side="right"
			className="w-64 border-r border-gray absolute top-0 right-0 h-full bg-background z-20"
		>
			<SidebarContent className="overflow-hidden">
				<Tabs
					value="blocks"
					// onValueChange={setActiveTab}
					className="w-full h-full group-data-[collapsible=icon]:hidden"
				>
					<div className="w-full border-b border-gray relative h-10">
						<TabsList className="w-fit bg-transparent py-0 my-0 absolute left-3 top-[7px] flex items-center gap-x-6">
							{[
								{ name: "Logs", value: "logs" },
								{ name: "Variables", value: "variables" },
							].map((item) => (
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
				</Tabs>
			</SidebarContent>
			<SidebarFooter className="h-16 border-t border-gray z-50">
				<SidebarTrigger className="ml-auto size-8 z-50 absolute right-3 bottom-5" />
			</SidebarFooter>
		</Sidebar>
	);
}
