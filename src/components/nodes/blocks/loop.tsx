import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Handle, Position } from "@xyflow/react";
import { ChevronDown, RotateCw, Trash } from "lucide-react";

interface LoopNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function LoopNode({ id, data }: LoopNodeProps) {
	const [items, setItems] = useState('["item1", "item2", "item3"]');
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="group relative w-86">
			<div className="w-80 bg-transparent flex flex-col gap-2">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-sm font-medium text-white bg-gray-950 border border-gray-800 rounded-lg px-2 py-1">
							For Loop
						</span>
					</div>
					<div className="flex items-center gap-3 ">
						<div className="flex items-center gap-2">
							<Popover open={isOpen} onOpenChange={setIsOpen}>
								<PopoverTrigger asChild>
									<Label className="flex items-center gap-2 text-sm font-medium text-white bg-gray-950 border border-gray-800 rounded-lg px-2 py-1">
										Items{" "}
										<ChevronDown className="w-4 h-4" />
									</Label>
								</PopoverTrigger>
								<PopoverContent
									className="w-80 bg-gray-950 border border-gray-700 rounded-md p-0"
									align="end"
								>
									<div className="p-3 border-b border-gray-700">
										<h4 className="text-sm font-medium text-white mb-2">
											Collection Items
										</h4>
										<p className="text-xs text-gray-400">
											{`Array or object to iterate over.
											Type '<' to reference other
											blocks.`}
										</p>
									</div>
									<div className="p-3">
										<Textarea
											value={items}
											onChange={(e) =>
												setItems(e.target.value)
											}
											className="min-h-[100px] bg-transparent border border-gray-700 text-white font-mono text-sm resize-none"
											placeholder='["item1", "item2", "item3"]'
										/>
										<div className="flex justify-end gap-2 mt-3">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setIsOpen(false)}
												className="text-gray-400 hover:text-white"
											>
												Cancel
											</Button>
											<Button
												size="sm"
												onClick={() => setIsOpen(false)}
												className="bg-blue-600 hover:bg-blue-700"
											>
												Apply
											</Button>
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</div>

				<div className="flex-1 flex items-center justify-start py-8 px-4 border border-gray-700 rounded-md">
					<div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
						<RotateCw className="w-6 h-6 text-white" />
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
