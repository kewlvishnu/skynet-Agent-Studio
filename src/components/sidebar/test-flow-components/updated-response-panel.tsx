import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import TestProgressIndicator from "./test-progress-indicator";
import TestAccordionItem from "./test-accordion-item";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorIcon } from "react-hot-toast";
import { UnifiedWorkflowResponse } from "@/hooks/use-unified-workflow-manager";

interface UpdatedResponsePanelProps {
	status: string;
	progress: number;
	currentStep?: string | number;
	responses: UnifiedWorkflowResponse[];
	isLoading?: boolean;
	workflow?: { id: string; itemID: string | number; subnetName: string }[];
}

export function UpdatedResponsePanel({
	status,
	progress,
	currentStep,
	responses,
	isLoading = false,
	workflow = [],
}: UpdatedResponsePanelProps) {
	const renderResponseItem = (
		response: UnifiedWorkflowResponse,
		index: number
	) => {
		if (response.status === "processing") {
			return (
				<div
					key={`skeleton-${response.id}`}
					className="border border-gray rounded-lg overflow-hidden p-4"
				>
					<div className="flex items-center gap-2">
						<Skeleton className="h-4 w-4 rounded-full" />
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-16" />
					</div>
				</div>
			);
		}

		return (
			<TestAccordionItem
				key={`response-${response.id}`}
				testNumber={index + 1}
				testId={String(response.id)}
				subnetName={response.subnetName}
				response={response.message || "No response message"}
				hasImage={Boolean(
					response.files?.some((f) => f.type.startsWith("image/")) ||
						(response.contentType &&
							response.contentType.startsWith("image/"))
				)}
				fileName={response.files?.[0]?.name}
				responseData={
					response.responseData
						? JSON.stringify(response.responseData, null, 2)
						: undefined
				}
				fileData={response.fileData}
				contentType={response.contentType}
			/>
		);
	};

	const shouldShowError =
		status === "error" || status === "disconnected" || status === "failed";

	return (
		<>
			{!shouldShowError && (
				<TestProgressIndicator
					status={status}
					progress={progress}
					currentStep={currentStep ? String(currentStep) : undefined}
				/>
			)}
			<ScrollArea className="h-[calc(100%-5.2rem)] py-3 px-4">
				<div className="space-y-2">
					{shouldShowError ? (
						<div className="flex flex-col items-center justify-center h-full py-8">
							<div className="text-red-500 text-center">
								<ErrorIcon className="w-16 h-16 mx-auto mb-2 text-red-500" />
								<h3 className="text-lg font-medium mb-2">
									Connection Error
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									{status === "disconnected"
										? "Connection lost. Please check your network and try again."
										: "An error occurred while processing your request. Please try again."}
								</p>
							</div>
						</div>
					) : responses.length === 0 ? (
						status === "idle" ? (
							<div className="space-y-2">
								<div className="border border-gray rounded-lg overflow-hidden p-4">
									<div className="flex items-center gap-2">
										<Skeleton className="h-4 w-4 rounded-full" />
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-3 w-16" />
									</div>
								</div>
							</div>
						) : (
							<div className="text-center text-muted-foreground py-8">
								<p>
									No responses yet. Run a test to see results.
								</p>
							</div>
						)
					) : (
						<Accordion
							type="single"
							collapsible
							className="space-y-2"
						>
							{responses.map((response, index) =>
								renderResponseItem(response, index)
							)}
						</Accordion>
					)}
				</div>
			</ScrollArea>
		</>
	);
}
