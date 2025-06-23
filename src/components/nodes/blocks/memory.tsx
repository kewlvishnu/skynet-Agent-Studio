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

export default function MemoryNode() {
	const [memoryId, setMemoryId] = useState("");
	const [content, setContent] = useState("");

	return (
		<div className="group relative w-86">
			<div className="w-80 bg-gray-950 border border-gray-700 rounded-md py-4 flex flex-col gap-2">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-gray-700">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
							<Database className="w-5 h-5" />
						</div>
						<h1 className="text-lg font-semibold text-white">
							Memory 1
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
							Operation <span className="text-red-500">*</span>
						</Label>
						<Select defaultValue="add-memory">
							<SelectTrigger className="bg-transparent border border-gray-700 text-white">
								<SelectValue placeholder="Select Operation" />
							</SelectTrigger>
							<SelectContent className="bg-gray-950 border border-gray-700 rounded-md">
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
										className="text-white hover:bg-gray-800"
									>
										{operation}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							ID <span className="text-red-500">*</span>
						</Label>
						<Input
							value={memoryId}
							onChange={(e) => setMemoryId(e.target.value)}
							placeholder="Enter memory identifier"
							className="bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500"
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							Role
						</Label>
						<Select defaultValue="user">
							<SelectTrigger className="bg-transparent border border-gray-700 text-white">
								<SelectValue placeholder="Select Role" />
							</SelectTrigger>
							<SelectContent className="bg-gray-950 border border-gray-700 rounded-md">
								{["User", "Assistant", "System"].map((role) => (
									<SelectItem
										key={role.toLowerCase()}
										value={role.toLowerCase()}
										className="text-white hover:bg-gray-800"
									>
										{role}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							Content
						</Label>
						<Textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder="Enter message content"
							className="min-h-[80px] bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500 resize-none"
						/>
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
