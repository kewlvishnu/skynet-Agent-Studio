"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
	ReactFlow,
	Background,
	BackgroundVariant,
	applyNodeChanges,
	applyEdgeChanges,
	addEdge,
	OnNodesChange,
	OnEdgesChange,
	OnConnect,
	Node,
	Edge,
} from "@xyflow/react";
import AppSidebar from "@/components/workspace-sidebar";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "@/components/nodes";
import { useState, useCallback } from "react";

export default function Home() {
	const [nodes, setNodes] = useState<Node[]>([
		{
			id: "1",
			type: "start",
			position: { x: 500, y: 250 },
			data: {
				label: "Start",
				description: "Start",
				icon: "🚀",
				color: "bg-blue-500",
			},
		},
	]);
	const [edges, setEdges] = useState<Edge[]>([]);

	const onNodesChange: OnNodesChange = useCallback(
		(changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
		[setNodes]
	);

	const onEdgesChange: OnEdgesChange = useCallback(
		(changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[setEdges]
	);

	const onConnect: OnConnect = useCallback(
		(connection) => setEdges((eds) => addEdge(connection, eds)),
		[setEdges]
	);

	const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
	};

	const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();

		const reactFlowBounds = e.currentTarget.getBoundingClientRect();

		const position = {
			x: e.clientX - reactFlowBounds.left,
			y: e.clientY - reactFlowBounds.top,
		};

		const block = JSON.parse(
			e.dataTransfer.getData("application/reactflow")
		);

		const newNode = {
			id: `${block.type}-${Date.now()}`,
			type: block.type,
			position,
			data: {
				label: block.title,
				description: block.description,
				icon: block.icon,
				color: block.color,
				blockType: block.type,
			},
		};

		setNodes((prev) => [...prev, newNode]);
	};

	return (
		<div className="w-full max-h-[calc(100svh-4rem)] relative flex overflow-hidden">
			<SidebarProvider className="h-full w-fit">
				<>
					<AppSidebar />
					<SidebarTrigger className="absolute bottom-5 left-3 z-10" />
				</>
			</SidebarProvider>

			<div className="flex-1 overflow-auto mt-2">
				<ReactFlow
					nodeTypes={nodeTypes}
					onDragOver={onDragOver}
					onDrop={onDrop}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					nodes={nodes}
					edges={edges}
				>
					<Background
						className="bg-[#0d1525]"
						variant={BackgroundVariant.Dots}
						gap={12}
						size={0.5}
					/>
				</ReactFlow>
			</div>
		</div>
	);
}
