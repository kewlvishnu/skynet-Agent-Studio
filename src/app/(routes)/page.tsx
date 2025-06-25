"use client";
import {
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
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
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

// Create a component that uses the sidebar context
function SidebarContent() {
	const { open } = useSidebar();

	return (
		<>
			<AppSidebar />
			<SidebarTrigger
				className={`absolute bottom-5 left-3 z-10 transition-all duration-200 ${
					open ? "opacity-0 pointer-events-none" : "opacity-100"
				}`}
			/>
		</>
	);
}

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
				onDelete: (nodeId: string) => {
					setNodes((nds) => nds.filter((node) => node.id !== nodeId));
					setEdges((eds) =>
						eds.filter(
							(edge) =>
								edge.source !== nodeId && edge.target !== nodeId
						)
					);
				},
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
				onDelete: (nodeId: string) => {
					setNodes((nds) => nds.filter((node) => node.id !== nodeId));
					setEdges((eds) =>
						eds.filter(
							(edge) =>
								edge.source !== nodeId && edge.target !== nodeId
						)
					);
				},
			},
		};

		setNodes((prev) => [...prev, newNode]);
	};

	const exportConnections = () => {
		const nodeConnections = nodes.map((node) => {
			const incomingConnections = edges
				.filter((edge) => edge.target === node.id)
				.map((edge) => ({
					sourceNodeId: edge.source,
					sourceNodeType:
						nodes.find((n) => n.id === edge.source)?.type ||
						"unknown",
					sourceNodeLabel:
						nodes.find((n) => n.id === edge.source)?.data?.label ||
						"Unknown",
				}));

			const outgoingConnections = edges
				.filter((edge) => edge.source === node.id)
				.map((edge) => ({
					targetNodeId: edge.target,
					targetNodeType:
						nodes.find((n) => n.id === edge.target)?.type ||
						"unknown",
					targetNodeLabel:
						nodes.find((n) => n.id === edge.target)?.data?.label ||
						"Unknown",
				}));

			return {
				nodeId: node.id,
				nodeType: node.type,
				nodeLabel: node.data?.label || "Unknown",
				incomingConnections,
				outgoingConnections,
				totalIncoming: incomingConnections.length,
				totalOutgoing: outgoingConnections.length,
			};
		});

		const connectionsData = {
			summary: {
				totalNodes: nodes.length,
				totalConnections: edges.length,
				timestamp: new Date().toISOString(),
			},
			nodeConnections,
			rawEdges: edges.map((edge) => ({
				id: edge.id,
				source: edge.source,
				target: edge.target,
				sourceLabel:
					nodes.find((n) => n.id === edge.source)?.data?.label ||
					"Unknown",
				targetLabel:
					nodes.find((n) => n.id === edge.target)?.data?.label ||
					"Unknown",
			})),
		};

		navigator.clipboard
			.writeText(JSON.stringify(connectionsData, null, 2))
			.then(() => {
				alert(
					"Connections JSON copied to clipboard! Also check the console for detailed view."
				);
			})
			.catch((err) => {
				console.error("Failed to copy to clipboard:", err);
				alert(
					"Connections JSON logged to console. Please copy from there."
				);
			});
	};

	return (
		<div className="w-full max-h-[calc(100svh-4rem)] relative flex overflow-hidden">
			<SidebarProvider className="h-full w-fit">
				<SidebarContent />
			</SidebarProvider>

			<Button
				onClick={exportConnections}
				className="absolute top-5 right-5 z-10 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
				size="sm"
			>
				<Copy className="w-4 h-4" />
				Export JSON
			</Button>

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
