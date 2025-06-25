import React, { useState } from "react";
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
import { Handle, Position } from "@xyflow/react";
import { GitMerge, Copy, Maximize2, Trash } from "lucide-react";

interface RouterNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function RouterNode({ id, data }: RouterNodeProps) {
	const [prompt, setPrompt] = useState(
		"Route to the correct block based on the input..."
	);

	return (
		<div className="group relative w-86">
			<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-green transition-all duration-200">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-green">
							<GitMerge className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "Router 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-green hover:bg-brand-green/10"
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-green hover:bg-brand-green/10"
						>
							<Maximize2 className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="px-4 space-y-3">
					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Prompt <span className="text-destructive">*</span>
						</Label>
						<Textarea
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="Route to the correct block based on the input..."
							className="min-h-[100px] bg-background/50 border border-border text-foreground placeholder:text-muted-foreground resize-none focus:border-brand-green"
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Model <span className="text-destructive">*</span>
						</Label>
						<Select defaultValue="gpt-4o">
							<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-green">
								<SelectValue placeholder="Select Model" />
							</SelectTrigger>
							<SelectContent className="bg-card border border-border">
								{[
									"gpt-4o",
									"gpt-4",
									"gpt-3.5-turbo",
									"claude-3-opus",
									"claude-3-sonnet",
								].map((model) => (
									<SelectItem
										key={model}
										value={model}
										className="text-foreground hover:bg-brand-green/10 focus:bg-brand-green/20"
									>
										{model}
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
					className="w-3 h-3 bg-brand-green border-2 border-white"
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
