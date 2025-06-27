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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Position } from "@xyflow/react";
import { Copy, Maximize2, Trash } from "lucide-react";
import { CustomHandle } from "@/components/handle/custom-handle";

interface NodeProps {
	id: string;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	data: {
		label?: string;
		prompt?: string;
		input?: string;
		responseType?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function Node({ 
	id, 
	title, 
	icon: Icon, 
	color, 
	data 
}: NodeProps) {
	return (
		<div className="group relative w-86">
			<div className={`w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-md hover:shadow-royal-blue-hover/50 transition-all duration-200`}>
				<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
					<div className="flex items-center gap-3">
						<div className={`w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-${color}`}>
							<Icon className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground capitalize">
							{data.label || title}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className={`text-muted-foreground hover:text-${color}`}
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className={`text-muted-foreground hover:text-${color}`}
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
							value={data.prompt || ""}
							className={`min-h-[100px] bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-${color}`}
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Input
						</Label>
						<Input
							placeholder="Enter input"
							value={data.input || ""}
							className={`bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-${color}`}
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Response Type
						</Label>
						<Select value={data.responseType || "text"}>
							<SelectTrigger className={`bg-background/50 border border-border text-foreground focus:border-${color}`}>
								<SelectValue placeholder="Select Response Type" />
							</SelectTrigger>
							<SelectContent className="bg-card border border-border">
								{["text", "json", "xml", "html"].map(
									(type) => (
										<SelectItem
											key={type}
											value={type}
											className={`text-foreground hover:bg-${color}/10 focus:bg-${color}/20`}
										>
											{type.toUpperCase()}
										</SelectItem>
									)
								)}
							</SelectContent>
						</Select>
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

