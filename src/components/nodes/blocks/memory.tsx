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
import { Input } from "@/components/ui/input";
import { Handle, Position } from "@xyflow/react";
import { Database, Copy, Maximize2, Trash } from "lucide-react";

interface MemoryNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function MemoryNode({ id, data }: MemoryNodeProps) {
	const [memoryId, setMemoryId] = useState("");
	const [content, setContent] = useState("");

	return (
		<div className="group relative w-86">
			<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-pink transition-all duration-200">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-pink">
							<Database className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "Memory 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-pink hover:bg-brand-pink/10"
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-pink hover:bg-brand-pink/10"
						>
							<Maximize2 className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="px-4 space-y-3">
					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Operation{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Select defaultValue="add-memory">
							<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-pink">
								<SelectValue placeholder="Select Operation" />
							</SelectTrigger>
							<SelectContent className="bg-card border border-border">
								{[
									"Add Memory",
									"Get Memory",
									"Update Memory",
									"Delete Memory",
								].map((operation) => (
									<SelectItem
										key={operation
											.toLowerCase()
											.replace(" ", "-")}
										value={operation
											.toLowerCase()
											.replace(" ", "-")}
										className="text-foreground hover:bg-brand-pink/10 focus:bg-brand-pink/20"
									>
										{operation}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							ID <span className="text-destructive">*</span>
						</Label>
						<Input
							value={memoryId}
							onChange={(e) => setMemoryId(e.target.value)}
							placeholder="Enter memory identifier"
							className="bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-brand-pink"
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Role
						</Label>
						<Select defaultValue="user">
							<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-pink">
								<SelectValue placeholder="Select Role" />
							</SelectTrigger>
							<SelectContent className="bg-card border border-border">
								{["User", "Assistant", "System"].map((role) => (
									<SelectItem
										key={role.toLowerCase()}
										value={role.toLowerCase()}
										className="text-foreground hover:bg-brand-pink/10 focus:bg-brand-pink/20"
									>
										{role}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Content
						</Label>
						<Textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Enter message content"
							className="min-h-[80px] bg-background/50 border border-border text-foreground placeholder:text-muted-foreground resize-none focus:border-brand-pink"
						/>
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
					className="w-3 h-3 bg-brand-pink border-2 border-white"
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
