import React from "react";
import { Button } from "../ui/button";
import { Play } from "lucide-react";
import { Header } from "../common/header";

export default function wrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col h-full w-full relative">
			<Header
				title="Workflow"
				subtitle="Saved about 2 hours ago"
				actions={
					<Button className="bg-[#6518E6] hover:bg-[#6518E6] text-white flex items-center justify-between gap-2 w-fit rounded-sm">
						<Play className="w-4 h-4 fill-white" />
						Run
					</Button>
				}
			/>
			<div className="flex-1 h-full bg-background relative">
				{children}
			</div>
		</div>
	);
}
