"use client";

import type React from "react";
import { useRef, useState } from "react";

import {
	Wrench,
	Loader2,
	Download,
	Upload,
	Copy,
	Maximize2,
	Trash,
	AtomIcon,
	FileText,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Position } from "@xyflow/react";
import { CustomHandle } from "@/components/handle/custom-handle";

interface ToolNodeProps {
	id: string;
	data: {
		label?: string;
		subnet_name?: string;
		description?: string;
		unique_id?: string;
		created_at?: string;
		updated_at?: string;
		owner?: string;
		status?: string;
		configuration?: Record<string, unknown>;
		prompt?: string;
		input?: string;
		responseType?: string;
		isLoading?: boolean;
		error?: boolean;
		onDelete?: (nodeId: string) => void;
		subnet_id?: number;
		input_description?: string;
		output_description?: string;
		prompt_example?: string;
		file_upload?: boolean;
		file_download?: boolean;
		subnet_url?: string;
		expected_input?: string | null;
		expected_output?: string | null;
	};
}

export default function ToolNode({ id, data }: ToolNodeProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFileName, setSelectedFileName] = useState<string | null>(
		null
	);

	if (data.isLoading) {
		return (
			<div className="group relative w-86">
				<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-blue transition-all duration-200">
					<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-blue">
								<Loader2 className="w-5 h-5 text-white animate-spin" />
							</div>
							<h1 className="text-lg font-semibold text-foreground">
								{data.subnet_name ||
									data.label ||
									"Loading Tool..."}
							</h1>
						</div>
					</div>
					<div className="px-4">
						<p className="text-sm text-muted-foreground">
							Fetching tool details...
						</p>
					</div>
				</div>
			</div>
		);
	}

	if (data.error) {
		return (
			<div className="group relative w-86">
				<div className="w-80 bg-theme border border-destructive/50 rounded-lg py-4 flex flex-col gap-2 shadow-lg transition-all duration-200">
					<div className="flex items-center justify-between px-4 pb-3 border-b border-border">
						<div className="flex items-center gap-3">
							<div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
								<Wrench className="w-5 h-5 text-destructive" />
							</div>
							<h1 className="text-lg font-semibold text-foreground">
								{data.subnet_name || data.label || "Tool Error"}
							</h1>
						</div>
					</div>
					<div className="px-4">
						<p className="text-sm text-destructive">
							{data.description || "Failed to load tool details"}
						</p>
					</div>
				</div>
			</div>
		);
	}

	const toolTitle = data.subnet_name || data.label || "Tool";

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			console.log("File selected:", file.name);
			setSelectedFileName(file.name);
		}
	};

	const handleUploadClick = () => {
		fileInputRef.current?.click();
	};

	const handleDownload = () => {
		console.log("Download requested");
	};

	return (
		<div className="group relative w-86 h-full">
			<div className="w-80 bg-theme border border-border rounded-lg py-4 flex flex-col gap-2 shadow-lg hover:shadow-brand-blue transition-all duration-200">
				<div className="flex items-center justify-between px-4 pb-2 border-b border-border">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-brand-blue">
							<AtomIcon size={20} className="text-white" />
						</div>
						<div className="flex-1">
							<h1 className="text-lg font-medium text-foreground capitalize">
								{toolTitle}
							</h1>
							{data.status && (
								<Badge variant="secondary" className="mt-1">
									{data.status}
								</Badge>
							)}
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
						>
							<Copy className="w-4 h-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="text-muted-foreground hover:text-brand-blue hover:bg-brand-blue/10"
						>
							<Maximize2 className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="px-4 space-y-3">
					{data.prompt_example && (
						<div className="space-y-1 flex-1 flex flex-col">
							<Label className="text-sm font-medium text-foreground">
								Prompt Example
							</Label>
							<Textarea
								value={data.prompt_example}
								readOnly
								className="resize-none flex-1 min-h-[100px] bg-background/50 border border-border text-foreground focus-visible:ring-0 focus-visible:ring-none"
							/>
						</div>
					)}

					{data.file_upload && (
						<div className="space-y-1">
							<Label className="text-sm font-medium text-foreground">
								Upload File
							</Label>
							<div
								onClick={handleUploadClick}
								className="border-2 border-dashed border-border rounded-lg p-4 hover:border-brand-blue/50 transition-colors bg-background/30 cursor-pointer flex flex-col items-center justify-center gap-2"
							>
								<Upload className="w-6 h-6 text-muted-foreground" />
								<span className="text-sm text-muted-foreground">
									Click to upload file
								</span>
								<Input
									ref={fileInputRef}
									type="file"
									onChange={handleFileUpload}
									className="hidden"
									accept="*/*"
								/>
							</div>
							{selectedFileName && (
								<div className="flex items-center gap-2 mt-2 p-2 bg-background/50 border border-border rounded-md">
									<FileText className="w-4 h-4 text-muted-foreground" />
									<span className="text-sm text-foreground truncate">
										{selectedFileName}
									</span>
								</div>
							)}
						</div>
					)}

					{data.file_download && (
						<div className="space-y-1">
							<div className="flex items-center gap-2">
								<Download className="w-4 h-4 text-muted-foreground" />
								<Label className="text-sm font-medium text-foreground">
									Download
								</Label>
							</div>
							<Button
								onClick={handleDownload}
								variant="outline"
								size="sm"
								className="w-full bg-background/50 border border-border text-foreground hover:bg-brand-blue/10 hover:border-brand-blue"
							>
								<Download className="w-4 h-4 mr-2" />
								Download File
							</Button>
						</div>
					)}

					{(data.expected_input === null ||
						data.expected_output === null) && (
						<div className="space-y-3">
							{data.expected_input === null && (
								<div className="space-y-1">
									<Label className="text-sm font-medium text-foreground">
										Input Type
									</Label>
									<Select>
										<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-blue">
											<SelectValue placeholder="Select input type..." />
										</SelectTrigger>
										<SelectContent className="bg-card border border-border">
											{[
												"text",
												"file",
												"json",
												"number",
											].map((item) => (
												<SelectItem
													key={item}
													value={item}
													className="text-foreground hover:bg-brand-blue/10 focus:bg-brand-blue/20"
												>
													{item}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
							{data.expected_output === null && (
								<div className="space-y-1">
									<Label className="text-sm font-medium text-foreground">
										Output Type
									</Label>
									<Select>
										<SelectTrigger className="bg-background/50 border border-border text-foreground focus:border-brand-blue">
											<SelectValue placeholder="Select output type..." />
										</SelectTrigger>
										<SelectContent className="bg-card border border-border">
											{[
												"text",
												"file",
												"json",
												"number",
												"image",
											].map((item) => (
												<SelectItem
													key={item}
													value={item}
													className="text-foreground hover:bg-brand-blue/10 focus:bg-brand-blue/20"
												>
													{item}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
						</div>
					)}

					{data.expected_input && (
						<div className="space-y-1">
							<Label className="text-sm font-medium text-muted-foreground">
								Expected Input
							</Label>
							<Textarea
								value={data.expected_input}
								readOnly
								className="resize-none min-h-[60px] bg-background/50 border border-border text-foreground text-sm"
							/>
						</div>
					)}

					{data.expected_output && (
						<div className="space-y-1">
							<Label className="text-sm font-medium text-muted-foreground">
								Expected Output
							</Label>
							<Textarea
								value={data.expected_output}
								readOnly
								className="resize-none min-h-[60px] bg-background/50 border border-border text-foreground text-sm"
							/>
						</div>
					)}
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
