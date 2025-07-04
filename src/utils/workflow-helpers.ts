import { UnifiedWorkflowResponse } from "@/hooks/use-unified-workflow-manager";

/**
 * Calculate progress based on unified workflow responses
 */
export function calculateWorkflowProgress(
	responses: UnifiedWorkflowResponse[],
	overallStatus: string
): number {
	if (responses.length === 0) return overallStatus === "running" ? 10 : 0;

	const completed = responses.filter(
		(r) => r.status === "success" || r.status === "error"
	).length;
	const total = responses.length;

	if (overallStatus === "completed") return 100;
	if (total === 0) return 0;

	return Math.floor((completed / total) * 90) + 10; // Reserve 10% for initialization
}

/**
 * Generate workflow items from selected agents
 */
export function generateWorkflowItems(
	selectedAgents: any
): { id: string; itemID: string | number; subnetName: string }[] {
	if (!selectedAgents) return [];

	const workflowItems: {
		id: string;
		itemID: string | number;
		subnetName: string;
	}[] = [];

	Object.values(selectedAgents).forEach((agent: any) => {
		agent.subnets.forEach((subnet: any) => {
			workflowItems.push({
				id: subnet.unique_id || `subnet-${subnet.itemID}`,
				itemID: subnet.itemID || 0,
				subnetName:
					subnet.subnetName || subnet.subnet_name || "Unknown Subnet",
			});
		});
	});

	return workflowItems;
}
