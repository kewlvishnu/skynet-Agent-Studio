import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Handle, Position } from "@xyflow/react";
import { Code, Copy, Maximize2, Trash, Edit } from "lucide-react";

export default function FunctionNode() {
	const [content, setContent] = useState("Write JavaScript...");
	const [isEditing, setIsEditing] = useState(false);

	return (
		<div className="group relative w-86">
			<div className="w-80 bg-gray-950 border border-gray-700 rounded-md py-4 flex flex-col gap-2">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-gray-700">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
							<Code className="w-5 h-5" />
						</div>
						<h1 className="text-lg font-semibold text-white">
							Function 1
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

				<div className="px-4">
					<div className="bg-transparent border border-gray-700 rounded-md">
						<div className="p-3">
							<div className="relative">
								<div className="absolute left-0 top-2 text-xs text-gray-500 bg-gray-950 px-1 z-10">
									1
								</div>
								<div className="absolute right-2 top-2 z-10">
									<Button
										variant="ghost"
										size="icon"
										onClick={() => setIsEditing(!isEditing)}
										className="text-slate-400 hover:text-white h-6 w-6"
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
										className="min-h-[80px] bg-gray-950 border-none text-gray-400 font-mono text-sm pl-6 pr-10 resize-none"
										placeholder="Write JavaScript..."
										onBlur={() => setIsEditing(false)}
										autoFocus
									/>
								) : (
									<div
										className="min-h-[80px] bg-gray-950 border-none text-gray-400 font-mono text-sm pl-6 pr-10 py-2 cursor-text flex items-start"
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
