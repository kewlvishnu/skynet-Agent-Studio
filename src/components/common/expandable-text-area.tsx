import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";

interface ExpandableTextAreaProps {
	title: string;
	value: string;
	placeholder?: string;
	readOnly?: boolean;
	rows?: number;
	className?: string;
	onChange?: (value: string) => void;
}

export default function ExpandableTextArea({
	title,
	value,
	placeholder = "",
	readOnly = false,
	rows = 4,
	className = "",
	onChange,
}: ExpandableTextAreaProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		if (onChange) {
			onChange(e.target.value);
		}
	};

	return (
		<div className="space-y-1">
			<div className="flex items-center gap-2 justify-between">
				<h4 className="text-sm font-medium text-foreground">{title}</h4>
				<Dialog open={isOpen} onOpenChange={setIsOpen}>
					<DialogTrigger asChild>
						<Button variant="ghost" size="sm" className="h-6 px-2">
							<Maximize2 className="h-3 w-3" />
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
						<DialogHeader>
							<DialogTitle>{title}</DialogTitle>
						</DialogHeader>
						<div className="mt-6 overflow-hidden">
							<Textarea
								className={`text-sm min-h-[400px] resize-none ${className}`}
								value={value}
								placeholder={placeholder}
								readOnly={readOnly}
								onChange={handleTextChange}
							/>
						</div>
					</DialogContent>
				</Dialog>
			</div>
			<Textarea
				className={`text-muted-foreground text-sm px-2 border-gray focus-visible:ring-0 focus-visible:ring-offset-0 ${className}`}
				rows={rows}
				value={value}
				placeholder={placeholder}
				readOnly={readOnly}
				onChange={handleTextChange}
			/>
		</div>
	);
}
