/**
 * Utility functions for normalizing workflow itemIDs
 */

export interface WorkflowItem {
	id: string;
	itemID: number;
	inputItemID: number[];
	subnetName?: string;
	[key: string]: any;
}

/**
 * Normalizes workflow itemIDs to ensure they are sequential starting from 1
 * and updates all inputItemID references accordingly
 */
export const normalizeWorkflowItemIDs = (
	workflow: WorkflowItem[]
): WorkflowItem[] => {
	if (!Array.isArray(workflow) || workflow.length === 0) {
		return workflow;
	}

	// Create a mapping from old itemID to new sequential itemID
	const itemIDMapping = new Map<number, number>();
	let nextItemID = 1;

	// First pass: assign new sequential itemIDs
	workflow.forEach((item) => {
		const oldItemID = item.itemID || 0;
		if (!itemIDMapping.has(oldItemID)) {
			itemIDMapping.set(oldItemID, nextItemID++);
		}
		item.itemID = itemIDMapping.get(oldItemID)!;
	});

	// Second pass: update inputItemID references
	workflow.forEach((item) => {
		if (Array.isArray(item.inputItemID)) {
			item.inputItemID = item.inputItemID.map((inputId: number) => {
				const newInputId = itemIDMapping.get(inputId);
				if (newInputId === undefined) {
					console.warn(
						`Could not map inputItemID ${inputId} for item ${
							item.subnetName || item.id
						}`
					);
					return inputId; // Keep original as fallback
				}
				return newInputId;
			});
		}
	});

	console.log(
		"Normalized workflow itemIDs:",
		workflow.map((item) => ({
			subnetName: item.subnetName,
			itemID: item.itemID,
			inputItemID: item.inputItemID,
		}))
	);

	return workflow;
};

/**
 * Validates that a workflow has unique and sequential itemIDs
 */
export const validateWorkflowItemIDs = (workflow: WorkflowItem[]): boolean => {
	if (!Array.isArray(workflow) || workflow.length === 0) {
		return true;
	}

	const itemIDs = workflow.map((item) => item.itemID).sort((a, b) => a - b);

	// Check if itemIDs are sequential starting from 1
	for (let i = 0; i < itemIDs.length; i++) {
		if (itemIDs[i] !== i + 1) {
			console.warn(
				`Workflow validation failed: itemID ${
					itemIDs[i]
				} at index ${i} should be ${i + 1}`
			);
			return false;
		}
	}

	// Check if all inputItemID references are valid
	for (const item of workflow) {
		if (Array.isArray(item.inputItemID)) {
			for (const inputId of item.inputItemID) {
				if (!itemIDs.includes(inputId)) {
					console.warn(
						`Workflow validation failed: inputItemID ${inputId} in item ${
							item.subnetName || item.id
						} references non-existent itemID`
					);
					return false;
				}
			}
		}
	}

	return true;
};

/**
 * Creates a test workflow with non-sequential itemIDs for testing
 */
export const createTestWorkflow = (): WorkflowItem[] => {
	return [
		{
			id: "openai-completion-1",
			itemID: 3,
			inputItemID: [],
			subnetName: "OpenAI Completion 1",
			prompt: "Test prompt 1",
		},
		{
			id: "openai-completion-2",
			itemID: 106,
			inputItemID: [],
			subnetName: "OpenAI Completion 2",
			prompt: "Test prompt 2",
		},
		{
			id: "image-generator",
			itemID: 107,
			inputItemID: [3], // References the first item
			subnetName: "Image Generator",
			prompt: "Generate image",
		},
	];
};
