import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import TestProgressIndicator from "./test-progress-indicator";
import TestAccordionItem from "./test-accordion-item";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorIcon } from "react-hot-toast";

export interface TestResult {
	id: number;
	testId: string;
	subnetName?: string;
	response: string;
	hasImage?: boolean;
	fileName?: string;
	responseData?: string;
	fileData?: string | Blob;
	contentType?: string;
}

interface SubnetResponseData {
	itemID: string;
	subnetName: string;
	status: string;
	responseMessage?: string;
	responseData?: Record<string, unknown>;
	files?: { name: string; data: string; type: string }[];
	fileData?: string;
	contentType?: string;
}

interface WorkflowItem {
	id: string;
	itemID: string;
	subnetName: string;
}

interface ResponsePanelProps {
	status: string;
	progress: number;
	currentStep?: string;
	testResults: TestResult[];
	isLoading?: boolean;
	subnetResponses?: SubnetResponseData[];
	workflow?: WorkflowItem[];
}

export default function ResponsePanel({
	status,
	progress,
	currentStep,
	testResults,
	isLoading = false,
	subnetResponses = [],
	workflow = [],
}: ResponsePanelProps) {
	const subnetStatusMap = new Map(
		subnetResponses.map((response) => [response.itemID, response.status])
	);

	const completedTestResultsMap = new Map(
		testResults.map((result) => [result.testId, result])
	);

	const isSubnetRunning = (itemID: string) => {
		const subnetStatus = subnetStatusMap.get(itemID);
		return subnetStatus && subnetStatus !== "completed";
	};

	const isSubnetCompleted = (itemID: string) => {
		const subnetStatus = subnetStatusMap.get(itemID);
		return subnetStatus === "completed";
	};

	const hasSubnetStarted = (itemID: string) => {
		return subnetStatusMap.has(itemID);
	};

	// Function to render skeleton for running test
	const renderTestSkeleton = (workflowItem: WorkflowItem, index: number) => (
		<div
			key={`skeleton-${workflowItem.itemID}`}
			className="border border-gray rounded-lg overflow-hidden data-[state=open]:border"
		>
			<div className="flex items-center justify-between px-2 py-5 cursor-pointer">
				<div className="flex items-center gap-2">
					<Skeleton className="h-4 w-4 rounded-full" />
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-16" />
				</div>
				<Skeleton className="h-4 w-4" />
			</div>
		</div>
	);

	const generateDisplayTests = () => {
		if (workflow.length === 0) {
			return testResults.map((test) => {
				if (isSubnetRunning(test.testId)) {
					return renderTestSkeleton(
						{
							id: test.testId,
							itemID: test.testId,
							subnetName: test.subnetName || "Unknown",
						},
						test.id
					);
				}
				return (
					<TestAccordionItem
						key={test.id}
						testNumber={test.id}
						testId={test.testId}
						subnetName={test.subnetName}
						response={test.response}
						hasImage={test.hasImage}
						fileName={test.fileName}
						responseData={test.responseData}
						fileData={test.fileData}
						contentType={test.contentType}
					/>
				);
			});
		}

		return workflow.map((workflowItem, index) => {
			const itemID = workflowItem.itemID;

			if (isSubnetCompleted(itemID)) {
				const completedResult = completedTestResultsMap.get(itemID);
				if (completedResult) {
					return (
						<TestAccordionItem
							key={`completed-${itemID}`}
							testNumber={index + 1}
							testId={itemID}
							subnetName={workflowItem.subnetName}
							response={completedResult.response}
							hasImage={completedResult.hasImage}
							fileName={completedResult.fileName}
							responseData={completedResult.responseData}
							fileData={completedResult.fileData}
							contentType={completedResult.contentType}
						/>
					);
				}
			}

			return renderTestSkeleton(workflowItem, index + 1);
		});
	};

	const shouldShowError =
		status === "error" || status === "disconnected" || status === "failed";

	return (
		<>
			{!shouldShowError && (
				<TestProgressIndicator
					status={status}
					progress={progress}
					currentStep={currentStep}
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
					) : (
						<Accordion
							type="single"
							collapsible
							className="space-y-2"
						>
							{generateDisplayTests()}
						</Accordion>
					)}
				</div>
			</ScrollArea>
		</>
	);
}
