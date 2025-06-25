import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Handle, Position } from "@xyflow/react";
import {
	GitBranch,
	Copy,
	Maximize2,
	Trash,
	Plus,
	ChevronUp,
	ChevronDown,
} from "lucide-react";

interface ConditionNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function ConditionNode({ id, data }: ConditionNodeProps) {
	const [conditions, setConditions] = useState([
		{ type: "if", expanded: true, content: "" },
		{ type: "else", expanded: false, content: "" },
	]);

	const addCondition = (afterIndex: number, type: string) => {
		const newConditions = [...conditions];
		newConditions.splice(afterIndex + 1, 0, {
			type: type,
			expanded: true,
			content: "",
		});
		setConditions(newConditions);
	};

	const toggleExpanded = (index: number) => {
		const updated = [...conditions];
		updated[index].expanded = !updated[index].expanded;
		setConditions(updated);
	};

	const updateContent = (index: number, content: string) => {
		const updated = [...conditions];
		updated[index].content = content;
		setConditions(updated);
	};

	const removeCondition = (index: number) => {
		if (conditions.length > 1) {
			const updated = conditions.filter((_, i) => i !== index);
			setConditions(updated);
		}
	};

	return (
		<div className="group relative w-86">
			<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-indigo transition-all duration-200">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-indigo">
							<GitBranch className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "Condition 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-indigo hover:bg-brand-indigo/10"
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-indigo hover:bg-brand-indigo/10"
						>
							<Maximize2 className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="px-4 space-y-2">
					{conditions.map((condition, index) => (
						<div key={index} className="space-y-2">
							<div className="bg-background/50 border border-border rounded-md">
								<div className="flex items-center justify-between p-3 border-b border-border">
									<div className="flex items-center gap-3">
										<span className="text-foreground font-medium text-sm">
											{condition.type}
										</span>
									</div>
									<div className="flex items-center gap-1">
										{condition.type !== "else" && (
											<Button
												variant="ghost"
												size="icon"
												onClick={() =>
													addCondition(
														index,
														"else if"
													)
												}
												className="text-muted-foreground hover:text-brand-indigo hover:bg-brand-indigo/10 h-6 w-6"
											>
												<Plus className="w-3 h-3" />
											</Button>
										)}
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												toggleExpanded(index)
											}
											className="text-muted-foreground hover:text-brand-indigo hover:bg-brand-indigo/10 h-6 w-6"
										>
											{condition.expanded ? (
												<ChevronUp className="w-3 h-3" />
											) : (
												<ChevronDown className="w-3 h-3" />
											)}
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() =>
												removeCondition(index)
											}
											className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-6 w-6"
											disabled={conditions.length === 1}
										>
											<Trash className="w-3 h-3" />
										</Button>
									</div>
								</div>

								{condition.expanded && (
									<div className="p-3">
										{condition.type !== "else" ? (
											<div className="relative">
												<div className="absolute left-0 top-2 text-xs text-muted-foreground bg-background px-1">
													1
												</div>
												<Textarea
													value={condition.content}
													onChange={(e) =>
														updateContent(
															index,
															e.target.value
														)
													}
													className="min-h-[60px] bg-background border border-border text-foreground font-mono text-sm pl-6 resize-none focus:border-brand-indigo"
													placeholder="Enter condition..."
												/>
											</div>
										) : (
											<div className="min-h-[60px] flex items-center justify-center text-muted-foreground text-sm">
												Default case - no condition
												needed
											</div>
										)}
									</div>
								)}
							</div>

							{index === conditions.length - 1 &&
								condition.type !== "else" && (
									<Button
										variant="ghost"
										size="sm"
										onClick={() =>
											addCondition(index, "else")
										}
										className="text-muted-foreground hover:text-brand-indigo hover:bg-brand-indigo/10 justify-start p-0 h-6 ml-2"
									>
										<Plus className="w-3 h-3 mr-1" />
										Add else
									</Button>
								)}
						</div>
					))}
				</div>

				<Handle
					type="target"
					position={Position.Left}
					className="w-3 h-3 bg-brand-blue border-2 border-white"
				/>
				<Handle
					type="source"
					position={Position.Right}
					className="w-3 h-3 bg-brand-indigo border-2 border-white"
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
