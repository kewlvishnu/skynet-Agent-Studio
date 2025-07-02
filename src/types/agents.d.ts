interface Agent {
	id: string;
	name: string;
	description: string;
}

interface SubnetItem {
	id: string;
	hints: string[];
	input: string;
	doubts: string[];
	itemID: number;
	output: string;
	prompt: string;
	subnetID: string;
	reasoning: string;
	subnetURL: string;
	fileUpload: boolean;
	subnetName: string;
	description: string;
	inputItemID: number[];
	fileDownload: boolean;
	systemPrompt: string;
	expectedInput: string;
	promptExample: string;
	expectedOutput: string;
	associatedSubnets: any[];
}

interface AgentLayout {
	endPosition: {
		x: number;
		y: number;
	};
	startPosition: {
		x: number;
		y: number;
	};
	subnetPositions: {
		[key: string]: {
			x: number;
			y: number;
		};
	};
}

interface AgentDetail extends Agent {
	subnet_list: SubnetItem[];
	user_address: string;
	layout: AgentLayout;
	is_deployed: boolean;
	ipfs_hash: string | null;
	collection_id: string | null;
	nft_address: string | null;
	created_at: string;
	updated_at: string;
}

interface AgentPagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

interface AgentResponse {
	success: boolean;
	data: {
		agents: Agent[];
		pagination: AgentPagination;
	};
	message: string;
}

interface AgentDetailResponse {
	success: boolean;
	data: AgentDetail;
	message: string;
}

interface AgentErrorResponse {
	success: boolean;
	error: string;
}
