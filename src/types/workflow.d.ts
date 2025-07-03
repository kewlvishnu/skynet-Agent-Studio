export interface AgentTestStatus {
	isRunning: boolean;
	status:
		| "idle"
		| "initializing"
		| "processing"
		| "test completed"
		| "failed";
	progress: number;
	message?: string;
	logs?: string[];
	currentSubnet?: string;
}

export interface NFTData {
	id: number;
	owner: string;
	metadata?: any;
}

export interface Subnet {
	itemID: string;
	subnetName: string;
	description?: string;
	unique_id?: string;
	subnet_name?: string;
	// Add other subnet properties as needed
}
