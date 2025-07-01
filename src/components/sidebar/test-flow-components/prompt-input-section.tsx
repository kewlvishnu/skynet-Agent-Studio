import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play } from "lucide-react";
import { useState } from "react";

interface PromptInputSectionProps {
	onRunTest?: () => void;
	placeholder?: string;
	buttonText?: string;
	mode?: "prompt" | "upload" | "both";
}

export default function PromptInputSection({
	onRunTest,
	placeholder = "Enter your prompt here...",
	buttonText = "Run Test",
	mode = "both",
}: PromptInputSectionProps) {
	const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSelectedFiles(event.target.files);
	};

	return (
		<div className="p-4 space-y-4 flex-shrink-0">
			<div className="space-y-3">
				{(mode === "prompt" || mode === "both") && (
					<div className="space-y-1">
						<Label htmlFor="prompt-input" className="text-sm font-medium">
							Enter Prompt
						</Label>
						<Textarea
							id="prompt-input"
							placeholder={placeholder}
							className="resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
							rows={mode === "both" ? 3 : 4}
						/>
					</div>
				)}

				{(mode === "upload" || mode === "both") && (
					<div className="space-y-1">
						<Label htmlFor="file-upload" className="text-sm font-medium">
							Upload Files
						</Label>
						<Input
							id="file-upload"
							type="file"
							multiple
							onChange={handleFileChange}
							className="cursor-pointer"
						/>
						{selectedFiles && selectedFiles.length > 0 && (
							<div className="text-xs text-muted-foreground">
								{selectedFiles.length} file(s) selected
							</div>
						)}
					</div>
				)}
			</div>

			<Button className="w-full" onClick={onRunTest}>
				<Play className="h-4 w-4" />
				{buttonText}
			</Button>
		</div>
	);
}
