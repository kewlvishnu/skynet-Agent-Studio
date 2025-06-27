import React from "react";
import { Header } from "../common/header";
// import { Input } from "../ui/input";

export default function wrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col h-full w-full relative">
			<Header
				title="Workflow"
				subtitle="Saved about 2 hours ago"
				// rightSideActions={<Input placeholder="Search" />}
			/>
			<div className="flex-1 h-full bg-background relative">
				{children}
			</div>
		</div>
	);
}
