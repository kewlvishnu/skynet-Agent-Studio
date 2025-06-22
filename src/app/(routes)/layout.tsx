import Sidebar from "@/components/sidebar";
import WorkflowWrapper from "@/components/workflow-wrapper/wrapper";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex h-screen">
			<Sidebar />
			<div className="flex-1">
				<WorkflowWrapper>{children}</WorkflowWrapper>
			</div>
		</div>
	);
}
