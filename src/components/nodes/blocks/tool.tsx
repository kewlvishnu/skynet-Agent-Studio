import React from "react";
import { Wrench } from "lucide-react";
import Node from "@/components/common/node";

interface ToolNodeProps {
	id: string;
	data: {
		label?: string;
		subnet_name?: string;
		description?: string;
		unique_id?: string;
		prompt?: string;
		input?: string;
		responseType?: string;
		onDelete?: (nodeId: string) => void;
	};
}

export default function ToolNode({ id, data }: ToolNodeProps) {
	return (
		<Node
			id={id}
			title={data.subnet_name || data.label || "Tool"}
			icon={Wrench}
			color="royal-blue"
			data={{
				label: data.subnet_name || data.label,
				prompt: data.prompt,
				input: data.input,
				responseType: data.responseType,
				onDelete: data.onDelete,
			}}
		/>
	);
}
