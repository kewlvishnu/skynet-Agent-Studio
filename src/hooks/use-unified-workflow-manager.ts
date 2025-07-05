import { useState, useCallback, useRef } from "react";
import {
	normalizeWorkflowResponse,
	WorkflowStep,
} from "@/utils/normalizeWorkflowResponse";

export interface UnifiedWorkflowResponse {
	id: string | number;
	itemID: string | number;
	subnetName: string;
	status: "pending" | "processing" | "success" | "error";
	message?: string;
	responseData?: any;
	files?: { name: string; data: string; type: string }[];
	fileData?: string;
	contentType?: string;
	progress?: number;
	timestamp: string;
	startTime?: string;
	endTime?: string;
	extractedImages?: string[];
}

export function useUnifiedWorkflowManager() {
	const [responses, setResponses] = useState<
		Map<string | number, UnifiedWorkflowResponse>
	>(new Map());
	const [currentStep, setCurrentStep] = useState<string | number | null>(
		null
	);
	const [overallStatus, setOverallStatus] = useState<
		"idle" | "running" | "completed" | "error"
	>("idle");
	const responseOrderRef = useRef<(string | number)[]>([]);

	const updateResponse = useCallback(
		(rawResponse: any) => {
			const normalized = normalizeWorkflowResponse(rawResponse);
			if (!normalized) return null;
			const responseId = normalized.itemID || normalized.id;

			setResponses((prev) => {
				const newMap = new Map(prev);
				const existing = newMap.get(responseId);

				if (
					!existing &&
					!responseOrderRef.current.includes(responseId)
				) {
					responseOrderRef.current.push(responseId);
				}

				const unified: UnifiedWorkflowResponse = {
					id: responseId,
					itemID: responseId,
					subnetName: normalized.name,
					status: normalized.status,
					message: normalized.message,
					responseData: normalized.responseData || normalized.data,
					files: normalized.files,
					fileData: normalized.fileData,
					contentType: normalized.contentType,
					timestamp: normalized.timestamp || new Date().toISOString(),
					startTime:
						existing?.startTime ||
						(normalized.status === "processing"
							? new Date().toISOString()
							: undefined),
					endTime:
						normalized.status === "success" ||
						normalized.status === "error"
							? new Date().toISOString()
							: existing?.endTime,
					extractedImages: normalized.extractedImages,
				};

				newMap.set(responseId, unified);
				return newMap;
			});

			if (normalized.status === "processing") {
				setCurrentStep(responseId);
			} else if (
				normalized.status === "success" ||
				normalized.status === "error"
			) {
				setCurrentStep(null);
			}

			if (
				normalized.status === "processing" &&
				overallStatus !== "running"
			) {
				setOverallStatus("running");
			}

			return normalized;
		},
		[overallStatus]
	);

	const markCompleted = useCallback(() => {
		setOverallStatus("completed");
		setCurrentStep(null);
	}, []);

	const markError = useCallback(() => {
		setOverallStatus("error");
		setCurrentStep(null);
	}, []);

	const reset = useCallback(() => {
		setResponses(new Map());
		setCurrentStep(null);
		setOverallStatus("idle");
		responseOrderRef.current = [];
	}, []);

	const getOrderedResponses = useCallback(() => {
		return responseOrderRef.current
			.map((id) => responses.get(id))
			.filter(Boolean) as UnifiedWorkflowResponse[];
	}, [responses]);

	const getResponseById = useCallback(
		(id: string | number) => {
			return responses.get(id);
		},
		[responses]
	);

	const getAllResponses = useCallback(() => {
		return Array.from(responses.values());
	}, [responses]);

	return {
		responses: getOrderedResponses(),
		currentStep,
		overallStatus,
		updateResponse,
		markCompleted,
		markError,
		reset,
		getResponseById,
		getAllResponses,
		totalResponses: responses.size,
	};
}
