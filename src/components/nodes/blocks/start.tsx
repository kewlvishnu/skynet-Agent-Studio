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
		<div className="w-80 bg-theme border border-border rounded-lg py-2 pb-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-blue transition-all duration-200">
			<div className="flex items-center justify-between border-b border-border pb-2 px-3">
				<div className="flex items-center gap-3">
					<div className="size-6 bg-primary rounded flex items-center justify-center shadow-brand-blue">
						<Play className="size-4 text-white" />
					</div>
					<h6 className="text-sm font-medium text-foreground">
						Start
					</h6>
				</div>
				<Info className="size-4 text-muted-foreground" />
			</div>
			<div className="px-3 flex flex-col gap-4">
				<div className="flex flex-col gap-1.5">
					<h6 className="text-sm font-medium text-foreground">
						Start Workflow
					</h6>
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
							className="w-full rounded-sm bg-background/50 border border-border text-foreground focus:border-brand-blue"
						>
							<SelectValue placeholder="Select Trigger" />
						</SelectTrigger>
						<SelectContent className="bg-card border border-border">
							<SelectItem
								value="manual"
								className="text-foreground hover:bg-brand-blue/10"
							>
								Run Manually
							</SelectItem>
							<SelectItem
								value="webhook"
								className="text-foreground hover:bg-brand-blue/10"
							>
								On Webhook call
							</SelectItem>
							<SelectItem
								value="schedule"
								className="text-foreground hover:bg-brand-blue/10"
							>
								On Schedule
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{trigger === "webhook" && (
					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<h6 className="text-sm font-medium text-foreground">
								Webhook Provider
							</h6>
							<Select>
								<SelectTrigger
									defaultValue={"webhook"}
									className="w-full rounded-sm bg-background/50 border border-border text-foreground focus:border-brand-blue"
								>
									<SelectValue placeholder="Select Trigger" />
								</SelectTrigger>
								<SelectContent className="bg-card border border-border">
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
											className="text-foreground hover:bg-brand-blue/10"
										>
											{provider}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex flex-col gap-1.5">
							<h6 className="text-sm font-medium text-foreground">
								Webhook Configuration
							</h6>
							<Button
								variant="outline"
								className="w-full font-light bg-background/50 border-border hover:bg-brand-blue/10 hover:border-brand-blue text-foreground"
							>
								<SquareArrowOutUpRight className="size-4" />
								Configuration Webhook
							</Button>
						</div>
					</div>
				)}
				{trigger === "schedule" && (
					<div className="flex flex-col gap-1.5">
						<h6 className="text-sm font-medium text-foreground">
							Schedule
						</h6>
						<Input
							type="text"
							placeholder="Schedule"
							className="bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-brand-blue"
						/>
					</div>
				)}
			</div>
			<Handle
				type="source"
				position={Position.Right}
				className="w-3 h-3 bg-brand-blue border-2 border-white"
			/>
		</div>
	);
}
