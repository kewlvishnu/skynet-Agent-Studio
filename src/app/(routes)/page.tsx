"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ReactFlow, Background, BackgroundVariant } from "@xyflow/react";
import AppSidebar from "@/components/workspace-sidebar";

import "@xyflow/react/dist/style.css";
export default function Home() {
	return (
		<div className="w-full max-h-[calc(100svh-4rem)] relative flex overflow-hidden">
			<SidebarProvider className="h-full w-fit">
				<>
					<AppSidebar />
					<SidebarTrigger className="absolute bottom-5 left-3 z-10" />
				</>
			</SidebarProvider>

			<div className="flex-1 overflow-auto mt-2">
				<ReactFlow>
					<Background
						className="bg-[#0d1525]"
						variant={BackgroundVariant.Dots}
						gap={12}
						size={0.5}
					/>
				</ReactFlow>
			</div>
		</div>
	);
}
