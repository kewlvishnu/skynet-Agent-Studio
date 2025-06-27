interface Subnet {
	unique_id: string;
	subnet_name: string;
	description: string;
}

interface SubnetDetail extends Subnet {
	created_at?: string;
	updated_at?: string;
	owner?: string;
	status?: string;
	configuration?: Record<string, unknown>;
	// Additional properties for tool functionality
	subnet_id?: number;
	input_description?: string;
	output_description?: string;
	prompt_example?: string;
	file_upload?: boolean;
	file_download?: boolean;
	subnet_url?: string;
	expected_input?: string | null;
	expected_output?: string | null;
}

interface SubnetPagination {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

interface SubnetResponse {
	success: boolean;
	data: {
		subnets: Subnet[];
		pagination: SubnetPagination;
	};
	message: string;
}

interface SubnetDetailResponse {
	success: boolean;
	data: SubnetDetail;
	message: string;
}
