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
import { Handle, Position } from "@xyflow/react";
import { Rocket, Copy, Maximize2, Trash, Info } from "lucide-react";

export default function ApiNode() {
	return (
		<div className="group relative w-86">
			<div className="w-80 bg-gray-950 border border-gray-700 rounded-md py-4 flex flex-col gap-2">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-gray-700">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
							<Rocket className="w-5 h-5" />
						</div>
						<h1 className="text-lg font-semibold text-white">
							API 1
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
							URL <span className="text-red-500">*</span>
						</Label>
						<Input
							placeholder="Enter URL"
							className="bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500"
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							Method <span className="text-red-500">*</span>
						</Label>
						<Select defaultValue="GET">
							<SelectTrigger className="bg-transparent border border-gray-700 text-white">
								<SelectValue placeholder="Select Method" />
							</SelectTrigger>
							<SelectContent className="bg-gray-950 border border-gray-700 rounded-md">
								{["GET", "POST", "PUT", "DELETE", "PATCH"].map(
									(method) => (
										<SelectItem
											key={method}
											value={method}
											className="text-white hover:bg-gray-800"
										>
											{method}
										</SelectItem>
									)
								)}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label className="text-sm font-medium text-white">
							Query Params
						</Label>
						<div className="space-y-2 border border-gray-700 rounded-md py-2">
							<div className="grid grid-cols-2 gap-2 text-sm text-gray-400 border-b border-gray-700 pb-2 px-4">
								<span>Key</span>
								<span>Value</span>
							</div>
							<div className="space-y-2 px-2">
								<div className="grid grid-cols-2 gap-2">
									<Input
										placeholder="Key"
										className="bg-transparent border-none text-gray-300 placeholder:text-gray-500 text-sm"
									/>
									<Input
										placeholder="Value"
										className="bg-transparent border-none text-gray-300 placeholder:text-gray-500 text-sm"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Label className="text-sm font-medium text-white">
								Headers
							</Label>
							<Info className="w-3 h-3 text-gray-400" />
						</div>
						<div className="space-y-2 border border-gray-700 rounded-md py-2">
							<div className="grid grid-cols-2 gap-2 text-sm text-gray-400 border-b border-gray-700 pb-2 px-4">
								<span>Key</span>
								<span>Value</span>
							</div>
							<div className="space-y-2 px-2">
								<div className="grid grid-cols-2 gap-2">
									<Input
										placeholder="Key"
										className="bg-transparent border-none text-gray-300 placeholder:text-gray-500 text-sm"
									/>
									<Input
										placeholder="Value"
										className="bg-transparent border-none text-gray-300 placeholder:text-gray-500 text-sm"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							Body
						</Label>
						<div className="relative">
							<Textarea
								placeholder="Enter JSON..."
								className="min-h-[100px] bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500 font-mono text-sm"
							/>
						</div>
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
