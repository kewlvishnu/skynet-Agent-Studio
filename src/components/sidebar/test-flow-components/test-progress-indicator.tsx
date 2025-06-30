import { Progress } from "@/components/ui/progress";

interface TestProgressIndicatorProps {
	status: string;
	progress: number;
	currentStep?: string;
}

export default function TestProgressIndicator({
	status,
	progress,
	currentStep,
}: TestProgressIndicatorProps) {
	return (
		<div className="border border-gray rounded-lg mx-4 p-2.5 space-y-1.5">
			<div>
				<div className="flex justify-between items-center mb-1">
					<span className="text-sm font-medium text-gray-800">
						{status}
					</span>
					<span className="text-xs text-gray-600">{progress}%</span>
				</div>
				<Progress value={progress} className="h-2" />
			</div>

			{currentStep && (
				<div className="text-sm bg-gray-50 rounded-md py-1">
					<span className="font-medium text-gray-800">
						Current step:
					</span>{" "}
					<span className="text-gray-700">{currentStep}</span>
				</div>
			)}
		</div>
	);
}
