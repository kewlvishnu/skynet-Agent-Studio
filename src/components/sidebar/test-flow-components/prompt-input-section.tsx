import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play } from "lucide-react";

interface PromptInputSectionProps {
	onRunTest?: () => void;
	placeholder?: string;
	buttonText?: string;
}

export default function PromptInputSection({
	onRunTest,
	placeholder = "Enter your prompt here...",
	buttonText = "Run Test",
}: PromptInputSectionProps) {
	return (
		<div className="p-4 space-y-4 flex-shrink-0">
			<div className="space-y-1">
				<h5 className="text-sm font-medium">Enter Prompt</h5>
				<Textarea
					id="request-input"
					placeholder={placeholder}
					className="resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
					rows={4}
				/>
			</div>

			<Button className="w-full" onClick={onRunTest}>
				<Play className="h-4 w-4" />
				{buttonText}
			</Button>
		</div>
	);
}
