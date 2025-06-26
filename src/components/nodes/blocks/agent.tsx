"use client";

import { CustomHandle } from "@/components/handle/custom-handle";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Position } from "@xyflow/react";
import { Bot, Code, Copy, Maximize2, Trash } from "lucide-react";

interface AgentNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function AgentNode({ id, data }: AgentNodeProps) {
	return (
		<div className="group relative w-86">
			<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-purple transition-all duration-200">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-purple">
							<Bot className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "Agent 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-purple hover:bg-brand-purple/10"
						>
							<Code className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-purple hover:bg-brand-purple/10"
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-purple hover:bg-brand-purple/10"
						>
							<Maximize2 className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="px-4 space-y-3">
					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Prompt
						</Label>
						<Textarea
							placeholder="Enter context or user message..."
							className="min-h-[100px] bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-brand-purple"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<Label
								htmlFor="model"
								className="text-sm font-medium text-foreground"
							>
								Model{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Select defaultValue="gpt-4o" disabled>
								<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-purple">
									<SelectValue placeholder="Select Model" />
								</SelectTrigger>
								<SelectContent className="bg-card border border-border">
									{["gpt-4o", "gpt-4", "gpt-3.5-turbo"].map(
										(model) => (
											<SelectItem
												key={model}
												value={model}
												className="text-foreground hover:bg-brand-purple/10 focus:bg-brand-purple/20"
											>
												{model}
											</SelectItem>
										)
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1">
							<Label className="text-sm font-medium text-foreground">
								Temperature
							</Label>
							<div className="pt-2">
								<Slider
									max={2}
									min={0}
									step={0.1}
									className="w-full bg-gray-600 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
									defaultValue={[0.5]}
									disabled
								/>
								<div className="text-right text-sm text-muted-foreground mt-1">
									0.5
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-1">
						<Label
							htmlFor="response-format"
							className="text-sm font-medium text-foreground"
						>
							Response Type
						</Label>
						<div className="relative">
							<Select>
								<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-purple">
									<SelectValue placeholder="Select Response Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="json">JSON</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
				<CustomHandle type="target" position={Position.Left} />
				<CustomHandle type="source" position={Position.Right} />
			</div>
			<div className="absolute top-0 -right-10">
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
	);
}
