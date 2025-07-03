import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCheck, Download, FileText, Image, Maximize2 } from "lucide-react";

interface TestAccordionItemProps {
	testNumber: number;
	testId: string;
	subnetName?: string;
	response: string;
	hasImage?: boolean;
	fileName?: string;
	responseData?: string;
}

export default function TestAccordionItem({
	testNumber,
	testId,
	subnetName,
	response,
	hasImage = true,
	fileName = "image.png",
	responseData = "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
}: TestAccordionItemProps) {
	return (
		<AccordionItem
			value={`item-${testNumber}`}
			className="border border-gray rounded-lg overflow-hidden data-[state=open]:border"
		>
			<AccordionTrigger className="bg-sidebar-accent px-2 py-4 w-full flex items-center hover:underline-none data-[state=open]:border-b data-[state=open]:border-b-gray">
				<div className="flex items-center gap-2">
					<CheckCheck className="h-4 w-4 text-green-500" />
					<h6 className="text-base font-medium">
						{subnetName && `${subnetName}`}
					</h6>
					<div className="text-[14px] text-muted-foreground">
						[ID: {testId}]
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="px-2 py-4">
				<div className="space-y-6">
					<div className="space-y-1">
						<div className="flex items-center gap-2 justify-between">
							<h4 className="text-sm font-medium text-foreground">
								Response
							</h4>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 px-2"
							>
								<Maximize2 className="h-3 w-3" />
							</Button>
						</div>
						<Textarea
							className="text-muted-foreground text-sm px-2"
							rows={4}
							value={response}
							readOnly
						/>
					</div>

					<div className="space-y-2">
						<h4 className="text-sm font-medium text-foreground">
							Generated Files
						</h4>
						<div className="flex items-center gap-2 justify-between">
							<div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
								{hasImage ? (
									<Image className="h-4 w-4 text-green-500" />
								) : (
									<FileText className="h-4 w-4 text-blue-500" />
								)}
								<span className="text-sm">{fileName}</span>
							</div>
							<Button variant="ghost" size="icon">
								<Download className="h-4 w-4" />
							</Button>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2 justify-between">
							<h4 className="text-sm font-medium text-foreground">
								Response Data
							</h4>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 px-2"
							>
								<Maximize2 className="h-3 w-3" />
							</Button>
						</div>
						<Textarea
							className="text-xs text-muted-foreground overflow-x-auto px-2"
							rows={4}
							value={responseData}
							readOnly
						/>
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
