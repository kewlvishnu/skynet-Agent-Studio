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
			<div className="w-80 bg-gray-950 border border-gray-700 rounded-md py-4 flex flex-col gap-2">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-gray-700">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
							<GitMerge className="w-5 h-5" />
						</div>
						<h1 className="text-lg font-semibold text-white">
							{data.label || "Router 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-slate-400 hover:text-white"
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-slate-400 hover:text-white"
						>
							<Maximize2 className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="px-4 space-y-3">
					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							Prompt <span className="text-red-500">*</span>
						</Label>
						<Textarea
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="Route to the correct block based on the input..."
							className="min-h-[100px] bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500 resize-none"
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							Model <span className="text-red-500">*</span>
						</Label>
						<Select defaultValue="gpt-4o">
							<SelectTrigger className="bg-transparent border border-gray-700 text-white">
								<SelectValue placeholder="Select Model" />
							</SelectTrigger>
							<SelectContent className="bg-gray-950 border border-gray-700 rounded-md">
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
										className="text-white hover:bg-gray-800"
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
					className="w-3 h-3 bg-blue-400"
				/>
				<Handle
					type="source"
					position={Position.Right}
					className="w-3 h-3 bg-orange-400"
				/>
			</div>

			<div className="absolute top-0 -right-10">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => data.onDelete?.(id)}
					className="text-slate-400 hover:text-white"
				>
					<Trash className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
