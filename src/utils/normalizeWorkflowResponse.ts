export type WorkflowStep = {
	id: string | number;
	name: string;
	status: "pending" | "processing" | "success" | "error";
	message?: string;
	progress?: number;
	data?: any;
	timestamp?: string;
	// Add these fields for better tracking
	itemID?: string | number;
	responseMessage?: string;
	responseData?: Record<string, unknown>;
	files?: { name: string; data: string; type: string }[];
	fileData?: string;
	contentType?: string;
	startTime?: string;
	endTime?: string;
};

export function normalizeWorkflowResponse(raw: any): WorkflowStep | null {
	console.log("Normalizing workflow response:", raw);

	// Handle socket event array format
	if (Array.isArray(raw) && raw.length > 1 && raw[0] === "status") {
		const data = raw[1];
		return normalizeStatusData(data);
	}

	// Handle direct status data
	if (raw && typeof raw === "object" && raw.status) {
		return normalizeStatusData(raw);
	}

	// Handle error format
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

	// Fallback for unknown formats
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
	// Determine status
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

	// Extract subnet name
	const subnetName =
		typeof data.subnet === "object"
			? data.subnet?.subnetName || ""
			: data.subnet || "";

	// If subnetName is missing or empty, skip this step
	if (!subnetName || subnetName === "Unknown Subnet") {
		return null;
	}

	// Extract response data
	let responseMessage = "";
	let responseData: Record<string, unknown> | undefined;
	let files: { name: string; data: string; type: string }[] | undefined;

	if (data.response) {
		if (typeof data.response === "string") {
			responseMessage = data.response;
		} else if (data.response.message) {
			responseMessage = data.response.message;
			responseData = data.response;
		} else {
			responseData = data.response;
		}
	}

	// Handle file data
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
	};
}
