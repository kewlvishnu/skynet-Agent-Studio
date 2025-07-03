import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion } from "@/components/ui/accordion";
import TestProgressIndicator from "./test-progress-indicator";
import TestAccordionItem from "./test-accordion-item";

export interface TestResult {
	id: number;
	testId: string;
	subnetName?: string;
	response: string;
	hasImage?: boolean;
	fileName?: string;
	responseData?: string;
}

interface ResponsePanelProps {
	status: string;
	progress: number;
	currentStep?: string;
	testResults: TestResult[];
}

export default function ResponsePanel({
	status,
	progress,
	currentStep,
	testResults,
}: ResponsePanelProps) {
	return (
		<>
			<TestProgressIndicator
				status={status}
				progress={progress}
				currentStep={currentStep}
			/>
			<ScrollArea className="h-[calc(100%-5.2rem)] py-3 px-4">
				<div className="space-y-2">
					<Accordion type="single" collapsible className="space-y-2">
						{testResults.map((test) => (
							<TestAccordionItem
								key={test.id}
								testNumber={test.id}
								testId={test.testId}
								subnetName={test.subnetName}
								response={test.response}
								hasImage={test.hasImage}
								fileName={test.fileName}
								responseData={test.responseData}
							/>
						))}
					</Accordion>
				</div>
			</ScrollArea>
		</>
	);
}
