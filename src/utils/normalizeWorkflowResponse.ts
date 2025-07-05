export type WorkflowStep = {
	id: string | number;
	name: string;
	status: "pending" | "processing" | "success" | "error";
	message?: string;
	progress?: number;
	data?: any;
	timestamp?: string;
	itemID?: string | number;
	responseMessage?: string;
	responseData?: Record<string, unknown>;
	files?: { name: string; data: string; type: string }[];
	fileData?: string;
	contentType?: string;
	startTime?: string;
	endTime?: string;
	extractedImages?: string[];
	outputData?: string;
	isChainableOutput?: boolean;
};

const agentOutputStore = new Map<string | number, string>();

function extractImageUrls(content: string): string[] {
	const imageUrls: string[] = [];

	const urlPatterns = [
		/https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?[^\s<>"{}|\\^`\[\]]*)?/gi,
		/https?:\/\/[^\s<>"{}|\\^`\[\]]+\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)/gi,
	];

	urlPatterns.forEach((pattern) => {
		const matches = content.match(pattern);
		if (matches) {
			imageUrls.push(...matches);
		}
	});

	const imageReferences = content.match(/Image\s+\d+/gi);
	if (imageReferences) {
		console.log("Found image references:", imageReferences);
	}

	return [...new Set(imageUrls)].filter((url) => {
		try {
			new URL(url);
			return true;
		} catch {
			return false;
		}
	});
}

function extractOutputData(data: any): string {
	if (data.response) {
		if (typeof data.response === "string") {
			return data.response;
		} else if (data.response.message) {
			return data.response.message;
		} else if (data.response.content) {
			return data.response.content;
		} else if (typeof data.response === "object") {
			const responseStr = JSON.stringify(data.response);
			return responseStr;
		}
	}

	return data.message || JSON.stringify(data);
}

function isChainableStep(subnetName: string, status: string): boolean {
	if (status !== "success") return false;

	const chainableSubnets = [
		"openai",
		"imagegen",
		"codegen",
		"docker",
		"stackai",
		"ipfs",
	];

	return chainableSubnets.some((type) =>
		subnetName.toLowerCase().includes(type.toLowerCase())
	);
}

export function normalizeWorkflowResponse(raw: any): WorkflowStep | null {
	console.log("Normalizing workflow response:", raw);

	if (Array.isArray(raw) && raw.length > 1 && raw[0] === "status") {
		const data = raw[1];
		return normalizeStatusData(data);
	}

	if (raw && typeof raw === "object" && raw.status) {
		return normalizeStatusData(raw);
	}

	if (Array.isArray(raw) && raw[0] === "error") {
		const errorData = raw[1] || {};
		return {
			id: errorData.itemID ?? Date.now(),
			name: errorData.subnet?.subnetName || errorData.subnet || "unknown",
			status: "error",
			message: errorData.message || errorData.error || "Unknown error",
			data: errorData,
			timestamp: new Date().toISOString(),
			itemID: errorData.itemID,
		};
	}

	console.warn("Unknown response format:", raw);
	return {
		id: Date.now(),
		name: "unknown",
		status: "pending",
		message: typeof raw === "string" ? raw : JSON.stringify(raw),
		data: raw,
		timestamp: new Date().toISOString(),
	};
}

function normalizeStatusData(data: any): WorkflowStep | null {
	let status: WorkflowStep["status"] = "pending";
	if (data.status === "completed" || data.status === "done") {
		status = "success";
	} else if (data.status === "error" || data.status === "failed") {
		status = "error";
	} else if (data.status === "processing") {
		status = "processing";
	} else if (data.status === "starting") {
		status = "processing";
	}

	const subnetName =
		typeof data.subnet === "object"
			? data.subnet?.subnetName || ""
			: data.subnet || "";

	if (!subnetName || subnetName === "Unknown Subnet") {
		return null;
	}

	let responseMessage = "";
	let responseData: Record<string, unknown> | undefined;
	let files: { name: string; data: string; type: string }[] | undefined;
	let extractedImages: string[] = [];
	let outputData = "";

	if (data.response) {
		if (typeof data.response === "string") {
			responseMessage = data.response;
			outputData = data.response;
			extractedImages = extractImageUrls(data.response);
		} else if (data.response.message) {
			responseMessage = data.response.message;
			outputData = data.response.message;
			responseData = data.response;
			extractedImages = extractImageUrls(data.response.message);
		} else {
			responseData = data.response;
			outputData = extractOutputData(data);
			if (typeof data.response === "object") {
				const responseString = JSON.stringify(data.response);
				extractedImages = extractImageUrls(responseString);

				if (
					data.response.images &&
					Array.isArray(data.response.images)
				) {
					extractedImages = [
						...extractedImages,
						...data.response.images,
					];
				}

				if (
					data.response.results &&
					Array.isArray(data.response.results)
				) {
					data.response.results.forEach((result: any) => {
						if (result.content) {
							const resultImages = extractImageUrls(
								result.content
							);
							extractedImages = [
								...extractedImages,
								...resultImages,
							];
						}
					});
				}
			}
		}
	}

	if (data.fileData && data.contentType) {
		const fileName =
			data.fileName ||
			`file-${Date.now()}.${data.contentType.split("/")[1] || "bin"}`;

		files = [
			{
				name: fileName,
				data: typeof data.fileData === "string" ? data.fileData : "",
				type: data.contentType,
			},
		];
	}

	const isChainable = isChainableStep(subnetName, status);
	if (status === "success" && data.itemID && outputData && isChainable) {
		agentOutputStore.set(data.itemID, outputData);
		console.log(
			`Stored output for itemID ${data.itemID}:`,
			outputData.substring(0, 100) + "..."
		);
	}

	return {
		id: data.itemID ?? Date.now(),
		itemID: data.itemID,
		name: subnetName,
		status,
		message: responseMessage || data.message || "",
		data: responseData || data.response || {},
		timestamp: new Date().toISOString(),
		responseMessage,
		responseData,
		files,
		fileData: data.fileData,
		contentType: data.contentType,
		startTime:
			status === "processing" ? new Date().toISOString() : undefined,
		endTime:
			status === "success" || status === "error"
				? new Date().toISOString()
				: undefined,
		extractedImages,
		outputData,
		isChainableOutput: isChainable,
	};
}

export function getStoredOutput(itemID: string | number): string | undefined {
	return agentOutputStore.get(itemID);
}

export function clearStoredOutputs(): void {
	agentOutputStore.clear();
}
