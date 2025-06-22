"use client";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarFooter,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import {
	ReactFlow,
	Background,
	BackgroundVariant,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
export default function Home() {
	return (
		<div className="w-full max-h-[calc(100svh-4rem)] relative flex overflow-hidden">
			<SidebarProvider className="h-full w-fit">
				<>
					<Sidebar className="w-60 border-r border-gray-800 absolute top-1 left-0 h-full bg-background">
						<SidebarHeader>hi</SidebarHeader>
						<SidebarContent></SidebarContent>
						<SidebarFooter className="">
							<SidebarTrigger />
						</SidebarFooter>
					</Sidebar>
					<SidebarTrigger className="absolute bottom-3 left-3" />
				</>
			</SidebarProvider>

			<div className="flex-1 overflow-auto mt-2">
				<ReactFlow>
					<Background className="bg-[#0d1525]" variant={BackgroundVariant.Dots} gap={12} size={0.5} />
				</ReactFlow>
			</div>
		</div>
	);
}
