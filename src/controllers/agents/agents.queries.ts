import axiosInstance from "@/lib/axios";

export const getAgents = async (params?: {
	search?: string;
	limit?: number;
	offset?: number;
}): Promise<AgentResponse> => {
	const response = await axiosInstance.get("/agents", {
		params: {
			search: params?.search,
			limit: params?.limit || 10,
			offset: params?.offset || 0,
		},
	});
	return response.data;
};

export const getAgentById = async (
	id: string
): Promise<AgentDetailResponse> => {
	const response = await axiosInstance.get(`/agents/${id}`);
	return response.data;
};
