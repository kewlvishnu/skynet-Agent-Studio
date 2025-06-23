"use client";

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
import { Handle, Position } from "@xyflow/react";
import { Bot, Code, Copy, Maximize2, Plus, Trash } from "lucide-react";

export default function AgentNode() {
	return (
		<div className="group relative w-86">
			<div className="w-80 bg-gray-950 border border-gray-700 rounded-md py-4 flex flex-col gap-2">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-gray-700">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
							<Bot className="w-5 h-5" />
						</div>
						<h1 className="text-lg font-semibold">Agent 1</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-slate-400 hover:text-white"
						>
							<Code className="w-4 h-4" />
						</Button>
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
						<Label className="text-sm font-medium">
							System Prompt
						</Label>
						<Textarea
							placeholder="Enter system prompt..."
							className="min-h-[100px] bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500"
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium">
							User Prompt
						</Label>
						<Textarea
							placeholder="Enter context or user message..."
							className="min-h-[100px] bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<Label
								htmlFor="model"
								className="text-sm font-medium"
							>
								Model <span className="text-red-500">*</span>
							</Label>
							<Select defaultValue="gpt-4o">
								<SelectTrigger className="bg-transparent border border-gray-700 text-white">
									<SelectValue placeholder="Select Model" />
								</SelectTrigger>
								<SelectContent className="bg-gray-950 border border-gray-700 rounded-md">
									{["gpt-4o", "gpt-4", "gpt-3.5-turbo"].map(
										(model) => (
											<SelectItem
												key={model}
												value={model}
												className="text-white hover:bg-gray-800"
											>
												{model}
											</SelectItem>
										)
									)}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-1">
							<Label className="text-sm font-medium">
								Temperature
							</Label>
							<div className="pt-2">
								<Slider
									max={2}
									min={0}
									step={0.1}
									className="w-full bg-gray-600 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
									defaultValue={[0.5]}
								/>
								<div className="text-right text-sm text-gray-400 mt-1">
									0.5
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium">Tools</Label>
						<Button
							variant="outline"
							className="w-full h-12 text-gray-400 hover:text-white bg-transparent hover:bg-transparent"
						>
							<Plus className="w-4 h-4 mr-2" />
							Add Tool
						</Button>
					</div>

					<div className="space-y-1">
						<Label
							htmlFor="response-format"
							className="text-sm font-medium"
						>
							Response Format
						</Label>
						<div className="relative">
							<Textarea
								id="response-format"
								placeholder="Enter JSON schema..."
								className="min-h-[100px] bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500"
							/>
							<Button
								variant="ghost"
								size="icon"
								className="absolute top-2 right-2 text-slate-400 hover:text-white"
							>
								<Code className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
				<Handle
					type="target"
					position={Position.Right}
					className="w-3 h-3 bg-blue-400"
				/>
				<Handle
					type="source"
					position={Position.Left}
					className="w-3 h-3 bg-orange-400"
				/>
			</div>
			<div className="absolute top-0 -right-10">
				<Button variant="ghost" size="icon">
					<Trash className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
