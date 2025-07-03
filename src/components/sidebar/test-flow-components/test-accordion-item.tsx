import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CheckCheck, Download, FileText, Image } from "lucide-react";
import ExpandableTextArea from "@/components/common/expandable-text-area";

interface TestAccordionItemProps {
	testNumber: number;
	testId: string;
	subnetName?: string;
	response: string;
	hasImage?: boolean;
	fileName?: string;
	responseData?: string;
	fileData?: string | Blob;
	contentType?: string;
}

export default function TestAccordionItem({
	testNumber,
	testId,
	subnetName,
	response,
	hasImage = true,
	fileName = "image.png",
	responseData = "lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
	fileData,
	contentType,
}: TestAccordionItemProps) {
	const handleDownload = () => {
		if (!fileData) {
			const blob = new Blob([responseData], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			return;
		}

		if (typeof fileData === "string" && fileData.startsWith("data:")) {
			try {
				const base64Data = fileData.split(",")[1];
				const binaryString = atob(base64Data);
				const bytes = new Uint8Array(binaryString.length);
				for (let i = 0; i < binaryString.length; i++) {
					bytes[i] = binaryString.charCodeAt(i);
				}

				const mimeType =
					fileData.split(";")[0].split(":")[1] ||
					contentType ||
					"application/octet-stream";
				const blob = new Blob([bytes], { type: mimeType });

				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = fileName;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
				return;
			} catch (error) {
				console.error("Error processing base64 data:", error);

				// Fallback to treating as plain text
				const blob = new Blob([fileData], { type: "text/plain" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = fileName;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}
			return;
		}

		if (typeof fileData === "string") {
			const blob = new Blob([fileData], {
				type: contentType || "text/plain",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			return;
		}

		if (fileData instanceof Blob) {
			const url = URL.createObjectURL(fileData);
			const a = document.createElement("a");
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

	return (
		<AccordionItem
			value={`item-${testNumber}`}
			className="border border-gray rounded-lg overflow-hidden data-[state=open]:border"
		>
			<AccordionTrigger className="bg-sidebar-accent px-2 py-4 w-full flex items-center hover:underline-none data-[state=open]:border-b data-[state=open]:border-b-gray">
				<div className="flex items-center gap-2">
					<CheckCheck className="h-4 w-4 text-green-500" />
					<h6 className="text-base font-medium capitalize">
						{subnetName && `${subnetName}`}
					</h6>
					<div className="text-[14px] text-muted-foreground">
						[ID: {testId}]
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="px-2 py-4">
				<div className="space-y-6">
					<ExpandableTextArea
						title="Response"
						value={response}
						readOnly
					/>

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
							<Button
								variant="ghost"
								size="icon"
								onClick={handleDownload}
								title="Download file"
							>
								<Download className="h-4 w-4" />
							</Button>
						</div>
						<div className="px-2">
							{hasImage && fileData && (
								<div className="w-1/2 rounded border-gray overflow-hidden">
									<img
										src={
											typeof fileData === "string"
												? fileData
												: URL.createObjectURL(fileData)
										}
										alt="Generated file preview"
										className="w-full h-full object-cover"
									/>
								</div>
							)}
						</div>
					</div>

					<ExpandableTextArea
						title="Response Data"
						value={responseData}
						readOnly
						className="text-xs text-muted-foreground overflow-x-auto"
					/>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}
