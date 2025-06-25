import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Handle, Position } from "@xyflow/react";
import { Code, Copy, Maximize2, Trash, Edit } from "lucide-react";

interface FunctionNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function FunctionNode({ id, data }: FunctionNodeProps) {
	const [content, setContent] = useState("Write JavaScript...");
	const [isEditing, setIsEditing] = useState(false);

	return (
		<div className="group relative w-86">
			<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-purple transition-all duration-200">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-purple">
							<Code className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "Function 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
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

				<div className="px-4">
					<div className="bg-background/50 border border-border rounded-md">
						<div className="p-3">
							<div className="relative">
								<div className="absolute left-0 top-2 text-xs text-muted-foreground bg-background px-1 z-10">
									1
								</div>
								<div className="absolute right-2 top-2 z-10">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setIsEditing(!isEditing)}
										className="text-muted-foreground hover:text-foreground h-6 w-6"
									>
										<Edit className="w-3 h-3" />
									</Button>
								</div>
								{isEditing ? (
									<Textarea
										value={content}
										onChange={(e) =>
											setContent(e.target.value)
										}
										className="min-h-[80px] bg-background border border-border text-foreground font-mono text-sm pl-6 pr-10 resize-none focus:border-brand-purple"
										placeholder="Write JavaScript..."
										onBlur={() => setIsEditing(false)}
										autoFocus
									/>
								) : (
									<div
										className="min-h-[80px] bg-background border border-border text-foreground font-mono text-sm pl-6 pr-10 py-2 cursor-text flex items-start rounded-md"
										onClick={() => setIsEditing(true)}
									>
										{content || "Write JavaScript..."}
									</div>
								)}
							</div>
						</div>
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
					className="w-3 h-3 bg-brand-purple border-2 border-white"
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
