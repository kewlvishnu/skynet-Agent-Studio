"use client";
import React, { FC } from "react";
import { EdgeProps, getSmoothStepPath, BaseEdge } from "@xyflow/react";

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
	const [edgePath] = getSmoothStepPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
		borderRadius: 20,
	});

	console.log("CustomEdge data:", data);
	console.log("Processing value:", data?.processing);

	const processing = data?.processing;

	const edgeStyle = {
		stroke: processing ? "#3b82f6" : "#64748b",
		strokeWidth: 2,
		strokeDasharray: "8 8",
		animation: processing ? "dashFlow 2s linear infinite" : "none",
		...style,
	};

	console.log("Edge style:", edgeStyle);
	console.log("Processing:", processing);

	return (
		<BaseEdge
			id={id}
			path={edgePath}
			markerEnd={markerEnd}
			markerStart={markerStart}
			className="custom-flow-edge"
			style={edgeStyle}
		/>
	);
};

export default CustomEdge;
