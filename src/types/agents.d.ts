interface Agent {
	id: string;
	name: string;
	description: string;
}

interface AgentDetail extends Agent {
	subnet_list: string;
	user_address: string;
	layout: string;
	is_deployed: boolean;
	ipfs_hash: string;
	collection_id: string;
	nft_address: string;
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
