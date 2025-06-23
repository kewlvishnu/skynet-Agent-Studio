import React, { useState } from "react";
import { Info, Play, SquareArrowOutUpRight } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Handle, Position } from "@xyflow/react";

export default function StartNode() {
	const [trigger, setTrigger] = useState<"manual" | "webhook" | "schedule">(
		"manual"
	);

	return (
		<div className="w-80 bg-gray-950 border border-gray-700 rounded-sm py-2 pb-4 flex flex-col gap-2">
			<div className="flex items-center justify-between border-b border-gray-700 pb-2 px-3">
				<div className="flex items-center gap-3">
					<div className="size-6 bg-blue-400 rounded flex items-center justify-center">
						<Play className="size-4 text-white" />
					</div>
					<h6 className="text-sm font-medium">Start</h6>
				</div>
				<Info className="size-4 text-gray-500" />
			</div>
			<div className="px-3 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<h6 className="text-sm font-medium">Start Workflow</h6>
					<Select
						value={trigger}
						onValueChange={(value) =>
							setTrigger(
								value as "manual" | "webhook" | "schedule"
							)
						}
					>
						<SelectTrigger
							defaultValue={"manual"}
							className="w-full rounded-sm"
						>
							<SelectValue placeholder="Select Trigger" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="manual">Run Manually</SelectItem>
							<SelectItem value="webhook">
								On Webhook call
							</SelectItem>
							<SelectItem value="schedule">
								On Schedule
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{trigger === "webhook" && (
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<h6 className="text-sm font-medium">
								Webhook Provider
							</h6>
							<Select>
								<SelectTrigger
									defaultValue={"webhook"}
									className="w-full rounded-sm"
								>
									<SelectValue placeholder="Select Trigger" />
								</SelectTrigger>
								<SelectContent>
									{[
										"Slack",
										"Gmail",
										"Airtable",
										"Telegram",
										"Generic",
									].map((provider) => (
										<SelectItem
											key={provider}
											value={provider}
										>
											{provider}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1.5">
							<h6 className="text-sm font-medium">
								Webhook Configuration
							</h6>
							<Button
								variant="outline"
								className="w-full font-light bg-transparent"
							>
								<SquareArrowOutUpRight className="size-4" />
								Configuration Webhook
							</Button>
						</div>
					</div>
				)}
				{trigger === "schedule" && (
					<div className="flex flex-col gap-1.5">
						<h6 className="text-sm font-medium">Schedule</h6>
						<Input type="text" placeholder="Schedule" />
					</div>
				)}
			</div>
			<Handle
				type="source"
				position={Position.Right}
				className="w-3 h-3 bg-orange-400"
			/>
		</div>
	);
}
