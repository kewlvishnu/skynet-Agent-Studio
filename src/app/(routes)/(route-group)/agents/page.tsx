"use client";
import { Header } from "@/components/common/header";
import { Button } from "@/components/ui/button";
import WorkflowGenerator from "@/components/common/WorkflowGenerator";
import { Bot, Plus } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function page() {
	const [showGenerator, setShowGenerator] = useState(false);

	const handleWorkflowGenerated = (workflow: any) => {
		console.log("Generated workflow:", workflow);
		toast.success(
			"Agent generated successfully! You can now use it in the main workspace."
		);
		setShowGenerator(false);
	};

	return (
		<div className="w-full h-full flex flex-col">
			<Header
				title="Agents"
				titleClassName="text-xl font-medium"
				icon={<Bot className="w-5.5 " />}
				actions={
					<Button
						onClick={() => setShowGenerator(!showGenerator)}
						className="bg-royal-blue hover:bg-royal-blue text-white flex items-center justify-between gap-2 w-fit rounded-sm"
					>
						<Plus className="w-4 h-4 fill-white" />
						{showGenerator ? "Hide Generator" : "Create Agent"}
					</Button>
				}
			/>

			<div className="flex-1 p-6">
				{showGenerator && (
					<div className="max-w-2xl mx-auto">
						<WorkflowGenerator
							onWorkflowGenerated={handleWorkflowGenerated}
							className="w-full"
						/>
					</div>
				)}

				{!showGenerator && (
					<div className="text-center text-muted-foreground mt-8">
						<p>
							Click "Create Agent" to generate a new workflow
							agent.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
