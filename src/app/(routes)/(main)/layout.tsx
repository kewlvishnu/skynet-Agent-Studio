"use client";
import WorkflowWrapper from "@/components/workflow-wrapper/wrapper";
import React from "react";

export default function layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex w-full relative">
			<WorkflowWrapper>{children}</WorkflowWrapper>
		</div>
	);
}
