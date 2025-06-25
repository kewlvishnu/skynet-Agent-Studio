import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Handle, Position } from "@xyflow/react";
import { Layers, Copy, Maximize2, Trash, Info } from "lucide-react";

interface WorkflowNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function WorkflowNode({ id, data }: WorkflowNodeProps) {
	return (
		<div className="group relative w-86">
			<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-amber transition-all duration-200">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-amber">
							<Layers className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "Workflow 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-amber hover:bg-brand-amber/10"
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-amber hover:bg-brand-amber/10"
						>
							<Maximize2 className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="px-4 space-y-3">
					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Select Workflow{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Select>
							<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-amber">
								<SelectValue placeholder="Select an option" />
							</SelectTrigger>
							<SelectContent className="bg-card border border-border">
								{[
									"Customer Support Flow",
									"Data Processing Pipeline",
									"Content Generation",
									"Quality Assurance",
									"Document Review",
								].map((workflow) => (
									<SelectItem
										key={workflow
											.toLowerCase()
											.replace(/\s+/g, "-")}
										value={workflow
											.toLowerCase()
											.replace(/\s+/g, "-")}
										className="text-foreground hover:bg-brand-amber/10 focus:bg-brand-amber/20"
									>
										{workflow}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<Label className="text-sm font-medium text-foreground">
								Input Variable (Optional)
							</Label>
							<Info className="w-3 h-3 text-muted-foreground" />
						</div>
						<Select>
							<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-amber">
								<SelectValue placeholder="Select a variable to pass to the child workflow" />
							</SelectTrigger>
							<SelectContent className="bg-card border border-border">
								{[
									"user_input",
									"response",
									"data",
									"context",
									"parameters",
									"session_id",
								].map((variable) => (
									<SelectItem
										key={variable}
										value={variable}
										className="text-foreground hover:bg-brand-amber/10 focus:bg-brand-amber/20"
									>
										{variable}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<Handle
					type="target"
					position={Position.Left}
					className="w-3 h-3 bg-brand-blue border-2 border-white"
				/>
				<Handle
					type="source"
					position={Position.Right}
					className="w-3 h-3 bg-brand-amber border-2 border-white"
				/>
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
