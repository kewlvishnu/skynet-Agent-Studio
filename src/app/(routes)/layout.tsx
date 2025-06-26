import { AppSidebar } from "@/components/sidebar/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import WorkflowWrapper from "@/components/workflow-wrapper/wrapper";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider className="flex h-screen overflow-hidden bg-background text-foreground">
			<div className="flex w-fit max-w-48">
				<AppSidebar />
			</div>

			<div className="flex w-full relative">
				<WorkflowWrapper>{children}</WorkflowWrapper>
			</div>
		</SidebarProvider>
	);
}
