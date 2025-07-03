import React, { useState } from "react";
import {
	Info,
	Play,
	SquareArrowOutUpRight,
	Trash,
	Maximize2,
	Minimize2,
} from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Position } from "@xyflow/react";
import { CustomHandle } from "@/components/handle/custom-handle";

interface StartNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function StartNode({ id, data }: StartNodeProps) {
	const [trigger, setTrigger] = useState<"manual" | "webhook" | "schedule">(
		"manual"
	);
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<div className={`group relative ${isExpanded ? "w-96" : "w-full"}`}>
			<div
				className={`bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-blue ${
					isExpanded ? "w-96" : "w-full"
				}`}
			>
				<div
					className={`flex items-center justify-between px-4 border-border ${
						isExpanded ? "border-b pb-2" : "pt-1 border-b-0 gap-x-6"
					}`}
				>
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-blue transition-all duration-300 ease-in-out">
							<Play size={20} className=" text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "Condition 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							{isExpanded ? (
								<Minimize2 className="w-4 h-4" />
							) : (
								<Maximize2 className="w-4 h-4" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => data.onDelete?.(id)}
							className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
						>
							<Trash className="w-4 h-4" />
						</Button>
					</div>
				</div>
				<div
					className={`px-3 flex flex-col gap-4 ${
						isExpanded ? "block" : "hidden"
					}`}
				>
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
				<CustomHandle
					type="source"
					position={Position.Right}
					className={`!bg-royal-blue !border-royal-blue opacity-80 ${
						!isExpanded ? "!h-8" : ""
					}`}
				/>
			</div>
		</div>
	);
}
