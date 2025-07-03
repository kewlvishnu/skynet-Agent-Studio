import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play } from "lucide-react";
import { useState } from "react";

interface PromptInputSectionProps {
	onRunTest?: (prompt: string) => void;
	placeholder?: string;
	buttonText?: string;
	isProcessing?: boolean;
}

export default function PromptInputSection({
	onRunTest,
	placeholder = "Enter your prompt here...",
	buttonText = "Run Test",
	isProcessing = false,
}: PromptInputSectionProps) {
	const [prompt, setPrompt] = useState<string>("");

	const handleRunClick = () => {
		if (onRunTest) {
			onRunTest(prompt);
		}
	};

	return (
		<div className="p-4 space-y-4 flex-shrink-0">
			<div className="space-y-3">
				<div className="space-y-1">
					<Label
						htmlFor="prompt-input"
						className="text-sm font-medium"
					>
						Enter Prompt
					</Label>
					<Textarea
						id="prompt-input"
						placeholder={placeholder}
						value={prompt}
						onChange={(e) => setPrompt(e.target.value)}
						className="resize-none focus-visible:ring-0 focus-visible:ring-offset-0 border-gray"
						rows={4}
					/>
				</div>
			</div>

			<Button
				className="w-full"
				onClick={handleRunClick}
				disabled={!prompt.trim() || isProcessing}
			>
				<Play className="h-4 w-4" />
				{buttonText}
			</Button>
		</div>
	);
}
