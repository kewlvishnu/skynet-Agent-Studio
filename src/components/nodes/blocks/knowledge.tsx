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
import { Handle, Position } from "@xyflow/react";
import { Book, Copy, Maximize2, Trash, Search } from "lucide-react";

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

	return (
		<div className="group relative w-86">
			<div className="w-80 bg-gray-950 border border-gray-700 rounded-md py-4 flex flex-col gap-2">
				<div className="flex items-center justify-between px-4 pb-3 border-b border-gray-700">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center">
							<Book className="w-5 h-5" />
						</div>
						<h1 className="text-lg font-semibold text-white">
							{data.label || "Knowledge 1"}
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
						<Select defaultValue="search">
							<SelectTrigger className="bg-transparent border border-gray-700 text-white">
								<SelectValue placeholder="Select Operation" />
							</SelectTrigger>
							<SelectContent className="bg-gray-950 border border-gray-700 rounded-md">
								{["Search", "Index", "Update", "Delete"].map(
									(operation) => (
										<SelectItem
											key={operation.toLowerCase()}
											value={operation.toLowerCase()}
											className="text-white hover:bg-gray-800"
										>
											{operation}
										</SelectItem>
									)
								)}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							Knowledge Bases
						</Label>
						<Select>
							<SelectTrigger className="bg-transparent border border-gray-700 text-white">
								<div className="flex items-center gap-2">
									<Search className="w-4 h-4 text-gray-400" />
									<SelectValue placeholder="Select knowledge bases" />
								</div>
							</SelectTrigger>
							<SelectContent className="bg-gray-950 border border-gray-700 rounded-md">
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
										className="text-white hover:bg-gray-800"
									>
										{base}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							Search Query
						</Label>
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Enter your search query"
							className="bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500"
						/>
					</div>

					<div className="space-y-1">
						<Label className="text-sm font-medium text-white">
							Number of Results
						</Label>
						<Input
							value={numberOfResults}
							onChange={(e) => setNumberOfResults(e.target.value)}
							placeholder="Enter number of results (default 10)"
							className="bg-transparent border border-gray-700 text-gray-300 placeholder:text-gray-500"
						/>
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
