import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Position } from "@xyflow/react";
import { ChevronDown, RotateCw, Trash } from "lucide-react";
import { CustomHandle } from "@/components/handle/custom-handle";

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
			<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-blue transition-all duration-200">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-blue">
							<RotateCw className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "For Loop"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Popover open={isOpen} onOpenChange={setIsOpen}>
							<PopoverTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
								>
									<ChevronDown className="w-4 h-4" />
								</Button>
							</PopoverTrigger>
							<PopoverContent
								className="w-80 bg-theme border border-border rounded-md p-0"
								align="end"
							>
								<div className="p-3 border-b border-border">
									<h4 className="text-sm font-medium text-foreground mb-2">
										Collection Items
									</h4>
									<p className="text-xs text-muted-foreground">
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
										className="min-h-[100px] bg-background/50 border border-border text-foreground font-mono text-sm resize-none focus:border-brand-blue"
										placeholder='["item1", "item2", "item3"]'
									/>
									<div className="flex justify-end gap-2 mt-3">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => setIsOpen(false)}
											className="text-muted-foreground hover:text-foreground"
										>
											Cancel
										</Button>
										<Button
											size="sm"
											onClick={() => setIsOpen(false)}
											className="bg-brand-blue hover:bg-brand-blue/80 text-white"
										>
											Apply
										</Button>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				<div className="px-4 space-y-3">
					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Items
						</Label>
						<div className="flex-1 flex items-center justify-center py-8 px-4 bg-background/50 border border-border rounded-md">
							<div className="w-12 h-12 bg-brand-blue rounded-lg flex items-center justify-center">
								<RotateCw className="w-6 h-6 text-white" />
							</div>
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
