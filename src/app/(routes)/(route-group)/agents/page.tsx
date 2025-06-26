import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import { Bot, Plus } from "lucide-react";
import React from "react";

export default function page() {
	return (
		<div className="w-full h-full flex flex-col">
			<Header
				title="Agents"
				titleClassName="text-xl font-medium"
				icon={<Bot className="w-5.5 " />}
				actions={
					<Button className="bg-royal-blue hover:bg-royal-blue text-white flex items-center justify-between gap-2 w-fit rounded-sm">
						<Plus className="w-4 h-4 fill-white" />
						Create Agent
					</Button>
				}
			/>
		</div>
	);
}
