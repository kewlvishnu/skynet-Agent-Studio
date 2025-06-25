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
import { Rocket, Copy, Maximize2, Trash, Info } from "lucide-react";
import { CustomHandle } from "@/components/handle/custom-handle";

interface ApiNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function ApiNode({ id, data }: ApiNodeProps) {
	return (
		<div className="group relative w-86">
			<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-blue transition-all duration-200">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-blue">
							<Rocket className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "API 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
						>
							<Maximize2 className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="px-4 space-y-3">
					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							URL <span className="text-destructive">*</span>
						</Label>
						<Input
							placeholder="Enter URL"
							className="bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-brand-blue"
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Method <span className="text-destructive">*</span>
						</Label>
						<Select defaultValue="GET">
							<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-blue">
								<SelectValue placeholder="Select Method" />
							</SelectTrigger>
							<SelectContent className="bg-card border border-border">
								{["GET", "POST", "PUT", "DELETE", "PATCH"].map(
									(method) => (
										<SelectItem
											key={method}
											value={method}
											className="text-foreground hover:bg-brand-blue/10 focus:bg-brand-blue/20"
										>
											{method}
										</SelectItem>
									)
								)}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label className="text-sm font-medium text-foreground">
							Query Params
						</Label>
						<div className="space-y-2 border border-border rounded-md py-2">
							<div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground border-b border-border pb-2 px-4">
								<span>Key</span>
								<span>Value</span>
							</div>
							<div className="space-y-2 px-2">
								<div className="grid grid-cols-2 gap-2">
									<Input
										placeholder="Key"
										className="bg-transparent border-none text-foreground placeholder:text-muted-foreground text-sm focus:border-brand-blue"
									/>
									<Input
										placeholder="Value"
										className="bg-transparent border-none text-foreground placeholder:text-muted-foreground text-sm focus:border-brand-blue"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label className="text-sm font-medium text-foreground">
								Headers
							</Label>
							<Info className="w-3 h-3 text-muted-foreground" />
						</div>
						<div className="space-y-2 border border-border rounded-md py-2">
							<div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground border-b border-border pb-2 px-4">
								<span>Key</span>
								<span>Value</span>
							</div>
							<div className="space-y-2 px-2">
								<div className="grid grid-cols-2 gap-2">
									<Input
										placeholder="Key"
										className="bg-transparent border-none text-foreground placeholder:text-muted-foreground text-sm focus:border-brand-blue"
									/>
									<Input
										placeholder="Value"
										className="bg-transparent border-none text-foreground placeholder:text-muted-foreground text-sm focus:border-brand-blue"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Body
						</Label>
						<div className="relative">
							<Textarea
								placeholder="Enter JSON..."
								className="min-h-[100px] bg-background/50 border border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:border-brand-blue"
							/>
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
