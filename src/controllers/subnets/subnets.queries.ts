import axiosInstance from "@/lib/axios";

export const getSubnets = async (params?: {
	search?: string;
	limit?: number;
	offset?: number;
}): Promise<SubnetResponse> => {
	const response = await axiosInstance.get("/subnets", {
		params: {
			search: params?.search,
			limit: params?.limit || 10,
			offset: params?.offset || 0,
		},
	});
	return response.data;
};

export const getSubnetById = async (
	id: string
): Promise<SubnetDetailResponse> => {
	const response = (await axiosInstance.get(`/subnets/${id}`)).data;
	if (response.success) {
		response.data.system_prompt = "";
		response.data.prompt = response?.data?.prompt_example;
	}
	return response;
};
