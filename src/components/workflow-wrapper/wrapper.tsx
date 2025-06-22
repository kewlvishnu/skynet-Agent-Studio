import React from "react";
import { Button } from "../ui/button";
import { Play } from "lucide-react";

export default function wrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col h-full w-full">
			<div className="h-16 w-full">
				<div className="flex items-center justify-between p-4 border-b border-gray-800 w-full">
					<div className="flex flex-col">
						<h1 className="text-sm font-medium">Workflow</h1>
						<p className="text-xs text-gray-400">
							Saved about 2 hours ago
						</p>
					</div>
					<div className="flex items-center">
						<Button className="bg-[#6518E6] hover:bg-[#6518E6] text-white flex items-center justify-between gap-2 w-fit rounded-sm">
							<Play className="w-4 h-4 fill-white" />
							Run
						</Button>
					</div>
				</div>
			</div>
			<div className="flex-1 h-full">{children}</div>
		</div>
	);
}
