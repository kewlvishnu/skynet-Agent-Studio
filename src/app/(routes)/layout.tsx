import { AppSidebar } from "@/components/sidebar/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import WorkflowWrapper from "@/components/workflow-wrapper/wrapper";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-screen overflow-">
			<SidebarProvider>
				<AppSidebar />
				<WorkflowWrapper>{children}</WorkflowWrapper>
			</SidebarProvider>
		</div>
	);
}
