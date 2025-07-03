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
import { Input } from "@/components/ui/input";
import { Position } from "@xyflow/react";
import { Book, Copy, Maximize2, Trash, Search, Minimize2 } from "lucide-react";
import { CustomHandle } from "@/components/handle/custom-handle";

interface KnowledgeNodeProps {
	id: string;
	data: {
		label?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function KnowledgeNode({ id, data }: KnowledgeNodeProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [numberOfResults, setNumberOfResults] = useState("");
	const [isExpanded, setIsExpanded] = useState(true);

	return (
		<div className={`group relative ${isExpanded ? "w-96" : "w-full"}`}>
			<div
				className={`bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-blue ${
					isExpanded ? "w-96" : "w-full"
				}`}
			>
				<div
					className={`flex items-center justify-between px-4 border-border ${
						isExpanded ? "border-b pb-2" : "pt-1 border-b-0 gap-x-6"
					}`}
				>
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-cyan">
							<Book className="w-5 h-5 text-white" />
						</div>
						<h1 className="text-lg font-semibold text-foreground">
							{data.label || "Knowledge 1"}
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-cyan hover:bg-brand-cyan/10"
							onClick={() => setIsExpanded(!isExpanded)}
						>
							{isExpanded ? (
								<Minimize2 className="w-4 h-4" />
							) : (
								<Maximize2 className="w-4 h-4" />
							)}
						</Button>
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

				<div
					className={`px-4 space-y-3 ${
						isExpanded ? "block" : "hidden"
					}`}
				>
					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Operation{" "}
							<span className="text-destructive">*</span>
						</Label>
						<Select defaultValue="search">
							<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-cyan">
								<SelectValue placeholder="Select Operation" />
							</SelectTrigger>
							<SelectContent className="bg-card border border-border">
								{[
									"Search",
									"Get",
									"Create",
									"Update",
									"Delete",
								].map((operation) => (
									<SelectItem
										key={operation.toLowerCase()}
										value={operation.toLowerCase()}
										className="text-foreground hover:bg-brand-cyan/10 focus:bg-brand-cyan/20"
									>
										{operation}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Knowledge Bases
						</Label>
						<Select>
							<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-cyan">
								<div className="flex items-center gap-2">
									<Search className="w-4 h-4 text-muted-foreground" />
									<SelectValue placeholder="Select knowledge bases" />
								</div>
							</SelectTrigger>
							<SelectContent className="bg-card border border-border">
								{[
									"General Knowledge",
									"Technical Docs",
									"Company Policies",
									"FAQ Database",
								].map((base) => (
									<SelectItem
										key={base
											.toLowerCase()
											.replace(" ", "-")}
										value={base
											.toLowerCase()
											.replace(" ", "-")}
										className="text-foreground hover:bg-brand-cyan/10 focus:bg-brand-cyan/20"
									>
										{base}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Search Query
						</Label>
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Enter your search query"
							className="bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-brand-cyan"
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-foreground">
							Number of Results
						</Label>
						<Input
							value={numberOfResults}
							onChange={(e) => setNumberOfResults(e.target.value)}
							placeholder="Enter number of results (default 10)"
							className="bg-background/50 border border-border text-foreground placeholder:text-muted-foreground focus:border-brand-cyan"
						/>
					</div>
				</div>

				<CustomHandle
					type="target"
					position={Position.Left}
					className={!isExpanded ? "!h-8" : ""}
				/>
				<CustomHandle
					type="source"
					position={Position.Right}
					className={!isExpanded ? "!h-8" : ""}
				/>
			</div>
		</div>
	);
}
