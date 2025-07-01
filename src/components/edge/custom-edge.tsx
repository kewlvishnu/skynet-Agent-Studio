"use client";
import React, { FC, useState } from "react";
import {
	EdgeProps,
	getSmoothStepPath,
	BaseEdge,
	useReactFlow,
} from "@xyflow/react";
import { Trash2, X } from "lucide-react";
import { Button } from "../ui/button";

const CustomEdge: FC<EdgeProps> = ({
	id,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
	markerEnd,
	markerStart,
	data,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const { deleteElements } = useReactFlow();

	const [edgePath] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
		borderRadius: 20,
	});

	const processing = data?.processing;

	const edgeStyle = {
		stroke: processing ? "#3b82f6" : "#64748b",
		strokeWidth: 2,
		strokeDasharray: "8 8",
		animation: processing ? "dashFlow 2s linear infinite" : "none",
		...style,
	};

	const handleDelete = (event: React.MouseEvent) => {
		event.stopPropagation();
		deleteElements({ edges: [{ id }] });
	};

	const centerX = (sourceX + targetX) / 2;
	const centerY = (sourceY + targetY) / 2;

	return (
		<g
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<BaseEdge
				id={id}
				path={edgePath}
				markerEnd={markerEnd}
				markerStart={markerStart}
				className="custom-flow-edge"
				style={edgeStyle}
			/>
			{isHovered && (
				<foreignObject
					x={centerX - 16}
					y={centerY - 16}
					className="overflow-visible"
				>
					<Button
						onClick={handleDelete}
						className="flex items-center justify-center size-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors duration-200 cursor-pointer"
						title="Delete edge"
					>
						<Trash2 size={12} />
					</Button>
				</foreignObject>
			)}
		</g>
	);
};

export default CustomEdge;
