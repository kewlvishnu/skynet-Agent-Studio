import React from "react";
import { Button } from "../ui/button";
import { Play } from "lucide-react";

export default function wrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex flex-col h-full">
			<div className="h-16 w-full">
				<div className="flex items-center justify-between p-4 border-b border-gray-800">
					<div className="flex items-center">
						<h1 className="text-2xl font-bold">Workflow</h1>
					</div>
					<div className="flex items-center">
						<Button className="bg-[#6518E6] hover:bg-[#6518E6] text-white flex items-center justify-between gap-2 w-fit rounded-sm">
							<Play className="w-4 h-4 fill-white" />
							Run
						</Button>
					</div>
				</div>
			</div>
			<div className="flex-1 flex overflow-auto">{children}</div>
		</div>
	);
}
