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
	useReactFlow,
	OnNodesChange,
	OnEdgesChange,
	OnConnect,
	Node,
	Edge,
	ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { nodeTypes } from "@/components/nodes";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import CustomEdge from "@/components/edge/custom-edge";
import RightWorkspaceSidebar from "@/components/sidebar/right-workspace-sidebar";
import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";

const edgeTypes = {
	custom: CustomEdge,
};

function LeftWorkspaceSidebar() {
	return <WorkspaceSidebar />;
}

function RightSidebar() {
	const { open } = useSidebar();

	return (
		<>
			<RightWorkspaceSidebar />
			<SidebarTrigger
				className={`absolute bottom-5 right-3 z-10 transition-all duration-200 ${
					open ? "opacity-0 pointer-events-none" : "opacity-100"
				}`}
			/>
		</>
	);
}

function FlowCanvas() {
	const { screenToFlowPosition } = useReactFlow();

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
	const [isProcessing, setIsProcessing] = useState(true);

	const updateEdgesProcessing = useCallback((processing: boolean) => {
		setEdges((currentEdges) =>
			currentEdges.map((edge) => ({
				...edge,
				data: {
					...edge.data,
					processing: processing,
				},
			}))
		);
	}, []);

	const deleteNode = useCallback((nodeId: string) => {
		setNodes((nds) => nds.filter((node) => node.id !== nodeId));
		setEdges((eds) =>
			eds.filter(
				(edge) => edge.source !== nodeId && edge.target !== nodeId
			)
		);
	}, []);

	const onNodesChange: OnNodesChange = useCallback(
		(changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
		[]
	);

	const onEdgesChange: OnEdgesChange = useCallback(
		(changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[]
	);

	const onConnect: OnConnect = useCallback(
		(connection) => {
			const newEdge = {
				...connection,
				type: "custom",
				data: {
					processing: isProcessing,
				},
			};
			setEdges((eds) => addEdge(newEdge, eds));
		},
		[isProcessing]
	);

	const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	}, []);

	const onDrop = useCallback(
		(e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();

			const reactFlowBounds = e.currentTarget.getBoundingClientRect();

			// Use ReactFlow's screenToFlowPosition for proper coordinate transformation
			const position = screenToFlowPosition({
				x: e.clientX - reactFlowBounds.left,
				y: e.clientY - reactFlowBounds.top,
			});

			try {
				const block = JSON.parse(
					e.dataTransfer.getData("application/reactflow")
				);

				const newNode: Node = {
					id: `${block.type}-${Date.now()}`,
					type: block.type,
					position,
					data: {
						label: block.title,
						description: block.description,
						icon: block.icon,
						color: block.color,
						blockType: block.type,
						onDelete: deleteNode,
					},
				};

				setNodes((prev) => [...prev, newNode]);
			} catch (error) {
				console.error("Error parsing dropped data:", error);
			}
		},
		[screenToFlowPosition, deleteNode]
	);

	const exportConnections = useCallback(() => {
		const nodeConnections = nodes.map((node) => {
			const incomingConnections = edges
				.filter((edge) => edge.target === node.id)
				.map((edge) => {
					const sourceNode = nodes.find((n) => n.id === edge.source);
					return {
						sourceNodeId: edge.source,
						sourceNodeType: sourceNode?.type || "unknown",
						sourceNodeLabel: sourceNode?.data?.label || "Unknown",
					};
				});

			const outgoingConnections = edges
				.filter((edge) => edge.source === node.id)
				.map((edge) => {
					const targetNode = nodes.find((n) => n.id === edge.target);
					return {
						targetNodeId: edge.target,
						targetNodeType: targetNode?.type || "unknown",
						targetNodeLabel: targetNode?.data?.label || "Unknown",
					};
				});

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
			rawEdges: edges.map((edge) => {
				const sourceNode = nodes.find((n) => n.id === edge.source);
				const targetNode = nodes.find((n) => n.id === edge.target);
				return {
					id: edge.id,
					source: edge.source,
					target: edge.target,
					sourceLabel: sourceNode?.data?.label || "Unknown",
					targetLabel: targetNode?.data?.label || "Unknown",
				};
			}),
		};

		navigator.clipboard
			.writeText(JSON.stringify(connectionsData, null, 2))
			.then(() => {
				alert(
					"Connections JSON copied to clipboard! Also check the console for detailed view."
				);
				console.log("Exported connections:", connectionsData);
			})
			.catch((err) => {
				console.error("Failed to copy to clipboard:", err);
				console.log("Connections data:", connectionsData);
				alert(
					"Connections JSON logged to console. Please copy from there."
				);
			});
	}, [nodes, edges]);

	return (
		<div className="flex-1 overflow-auto mt-2 relative">
			<ReactFlow
				nodeTypes={nodeTypes}
				edgeTypes={edgeTypes}
				onDragOver={onDragOver}
				onDrop={onDrop}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onConnect={onConnect}
				nodes={nodes}
				edges={edges}
				defaultViewport={{ x: 200, y: 100, zoom: 0.8 }}
			>
				<Background
					variant={BackgroundVariant.Dots}
					className="bg-gray-200 opacity-50"
					gap={20}
					size={2}
				/>
			</ReactFlow>
			<div className="absolute top-5 right-5 z-10 flex items-center gap-2">
				<Button
					onClick={() => {
						const newProcessingState = !isProcessing;
						setIsProcessing(newProcessingState);
						updateEdgesProcessing(newProcessingState);
					}}
					className={`${
						isProcessing
							? "bg-blue-600 hover:bg-blue-700"
							: "bg-gray-600 hover:bg-gray-700"
					} text-white flex items-center gap-2`}
					size="sm"
				>
					{isProcessing ? "Processing: ON" : "Processing: OFF"}
				</Button>
				<Button
					onClick={exportConnections}
					className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
					size="sm"
				>
					<Copy className="w-4 h-4" />
					Export JSON
				</Button>
			</div>
		</div>
	);
}

export default function Home() {
	return (
		<div className="w-full max-h-[calc(100svh-4rem)] relative flex overflow-hidden">
			<SidebarProvider className="h-full w-fit">
				<LeftWorkspaceSidebar />
			</SidebarProvider>

			<ReactFlowProvider>
				<FlowCanvas />
			</ReactFlowProvider>

			<SidebarProvider className="h-full w-fit">
				<RightSidebar />
			</SidebarProvider>
		</div>
	);
}
