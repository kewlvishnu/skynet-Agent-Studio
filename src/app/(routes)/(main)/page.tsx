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
import { getSubnetById } from "@/controllers/subnets/subnets.queries";
import { getAgentById } from "@/controllers/agents/agents.queries";

const edgeTypes = {
	custom: CustomEdge,
};

function LeftWorkspaceSidebar() {
	return <WorkspaceSidebar />;
}

function RightSidebar({
	onWidthChange,
}: {
	onWidthChange?: (width: number) => void;
}) {
	return (
		<>
			<RightWorkspaceSidebar onWidthChange={onWidthChange} />
		</>
	);
}

function FlowCanvas({ rightSidebarWidth }: { rightSidebarWidth: number }) {
	const { screenToFlowPosition } = useReactFlow();
	const { open } = useSidebar();
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
		async (e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();

			const position = screenToFlowPosition({
				x: e.clientX,
				y: e.clientY,
			});

			try {
				const droppedData = JSON.parse(
					e.dataTransfer.getData("application/reactflow")
				);

				let newNode: Node;

				if (droppedData.unique_id && droppedData.subnet_name) {
					const nodeId = `tool-${Date.now()}`;

					const initialNode: Node = {
						id: nodeId,
						type: "tool",
						position,
						data: {
							...droppedData,
							onDelete: deleteNode,
						},
					};

					console.log({
						...droppedData,
					});

					setNodes((prev) => [...prev, initialNode]);

					try {
						const detailedResponse = await getSubnetById(
							droppedData.unique_id
						);
						if (detailedResponse.success) {
							const toolDetail = detailedResponse.data;

							setNodes((prev) =>
								prev.map((node) =>
									node.id === nodeId
										? {
												...node,
												data: {
													...node.data,
													...toolDetail,
													onDelete: deleteNode,
												},
										  }
										: node
								)
							);
						} else {
							setNodes((prev) =>
								prev.map((node) =>
									node.id === nodeId
										? {
												...node,
												data: {
													...node.data,
													description:
														"Failed to load tool details",
													isLoading: false,
													error: true,
												},
										  }
										: node
								)
							);
						}
					} catch (error) {
						console.error("Error fetching tool details:", error);

						setNodes((prev) =>
							prev.map((node) =>
								node.id === nodeId
									? {
											...node,
											data: {
												...node.data,
												description:
													"Failed to load tool details",
												isLoading: false,
												error: true,
											},
									  }
									: node
							)
						);
					}
					return;
				} else if (droppedData.name && droppedData.id) {
					const nodeId = `agent-${Date.now()}`;

					// Create initial node with loading state
					const initialNode: Node = {
						id: nodeId,
						type: "agent",
						position,
						data: {
							label: droppedData.name,
							description: "Loading agent details...",
							isLoading: true,
							onDelete: deleteNode,
						},
					};

					setNodes((prev) => [...prev, initialNode]);

					// Fetch detailed information
					try {
						const detailedResponse = await getAgentById(
							droppedData.id
						);
						if (detailedResponse.success) {
							const agentDetail = detailedResponse.data;

							// Update the node with detailed information
							setNodes((prev) =>
								prev.map((node) =>
									node.id === nodeId
										? {
												...node,
												data: {
													...node.data,
													label: agentDetail.name,
													description:
														agentDetail.description,
													subnet_list:
														agentDetail.subnet_list,
													user_address:
														agentDetail.user_address,
													layout: agentDetail.layout,
													is_deployed:
														agentDetail.is_deployed,
													ipfs_hash:
														agentDetail.ipfs_hash,
													collection_id:
														agentDetail.collection_id,
													nft_address:
														agentDetail.nft_address,
													created_at:
														agentDetail.created_at,
													updated_at:
														agentDetail.updated_at,
													isLoading: false,
													onDelete: deleteNode,
												},
										  }
										: node
								)
							);
						} else {
							// Handle API error
							setNodes((prev) =>
								prev.map((node) =>
									node.id === nodeId
										? {
												...node,
												data: {
													...node.data,
													description:
														"Failed to load agent details",
													isLoading: false,
													error: true,
												},
										  }
										: node
								)
							);
						}
					} catch (error) {
						console.error("Error fetching agent details:", error);
						// Update node with error state
						setNodes((prev) =>
							prev.map((node) =>
								node.id === nodeId
									? {
											...node,
											data: {
												...node.data,
												description:
													"Failed to load agent details",
												isLoading: false,
												error: true,
											},
									  }
									: node
							)
						);
					}
					return; // Early return to avoid creating newNode below
				}
				// Otherwise it's a block
				else {
					newNode = {
						id: `${droppedData.type}-${Date.now()}`,
						type: droppedData.type,
						position,
						data: {
							label: droppedData.title,
							description: droppedData.description,
							icon: droppedData.icon,
							color: droppedData.color,
							blockType: droppedData.type,
							onDelete: deleteNode,
						},
					};

					setNodes((prev) => [...prev, newNode]);
				}
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
		<div className="flex-1 overflow-auto  relative">
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
			<div
				className="absolute top-5 z-10 flex items-center gap-2 transition-all duration-300"
				style={{
					right: rightSidebarWidth > 0 ? `${rightSidebarWidth - 200}px` : '20px',
				}}
			>
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
	const [rightSidebarWidth, setRightSidebarWidth] = useState(0);

	const handleRightSidebarWidthChange = useCallback((width: number) => {
		setRightSidebarWidth(width);
	}, []);

	return (
		<div className="w-full max-h-[calc(100svh-4rem)] relative flex overflow-hidden">
			<SidebarProvider className="h-full w-fit">
				<LeftWorkspaceSidebar />
			</SidebarProvider>

			<ReactFlowProvider>
				<FlowCanvas rightSidebarWidth={rightSidebarWidth} />
			</ReactFlowProvider>

			<SidebarProvider className="h-full w-fit">
				<RightSidebar onWidthChange={handleRightSidebarWidthChange} />
			</SidebarProvider>
		</div>
	);
}
