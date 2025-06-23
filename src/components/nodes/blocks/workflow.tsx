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

export default function WorkflowNode() {
	return (
		<div className="group relative w-86">
			<div className="w-80 bg-gray-950 border border-gray-700 rounded-md py-4 flex flex-col gap-2">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-gray-700">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
							<Layers className="w-5 h-5" />
						</div>
						<h1 className="text-lg font-semibold text-white">
							Workflow 1
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
							Select Workflow{" "}
							<span className="text-red-500">*</span>
						</Label>
						<Select>
							<SelectTrigger className="bg-transparent border border-gray-700 text-white">
								<SelectValue placeholder="Select an option" />
							</SelectTrigger>
							<SelectContent className="bg-gray-950 border border-gray-700 rounded-md">
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
										className="text-white hover:bg-gray-800"
									>
										{workflow}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<Label className="text-sm font-medium text-white">
								Input Variable (Optional)
							</Label>
							<Info className="w-3 h-3 text-gray-400" />
						</div>
						<Select>
							<SelectTrigger className="bg-transparent border border-gray-700 text-white">
								<SelectValue placeholder="Select a variable to pass to the child workflow" />
							</SelectTrigger>
							<SelectContent className="bg-gray-950 border border-gray-700 rounded-md">
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
										className="text-white hover:bg-gray-800"
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
					className="text-slate-400 hover:text-white"
				>
					<Trash className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
