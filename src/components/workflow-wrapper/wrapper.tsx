import React from "react";
import { Header } from "../common/header";
import AuthButton from "../common/auth-button";
// import { Input } from "../ui/input";

export default function WorkflowWrapper({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col h-full w-full relative">
			<Header
				title="Workflow"
				subtitle="Saved about 2 hours ago"
				// rightSideActions={<Input placeholder="Search" />}
				actions={<AuthButton />}
			/>
			<div className="flex-1 h-full bg-background relative">
				{children}
			</div>
		</div>
	);
}
