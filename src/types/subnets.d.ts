interface Subnet {
  unique_id: string;
  subnet_name: string;
  description: string;
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
