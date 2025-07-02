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
	const [nodes, setNodes] = useState<Node[]>([]);

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

	const deleteNode = useCallback(
		(nodeId: string) => {
			setEdges((currentEdges) => {
				// Find incoming and outgoing edges
				const incomingEdges = currentEdges.filter(
					(edge) => edge.target === nodeId
				);
				const outgoingEdges = currentEdges.filter(
					(edge) => edge.source === nodeId
				);

				// Create new connecting edges (reconnect the flow)
				const newEdges = [];
				for (const incomingEdge of incomingEdges) {
					for (const outgoingEdge of outgoingEdges) {
						// Avoid self-loops
						if (incomingEdge.source !== outgoingEdge.target) {
							newEdges.push({
								id: `reconnect-${incomingEdge.source}-${
									outgoingEdge.target
								}-${Date.now()}-${Math.random()
									.toString(36)
									.substr(2, 9)}`,
								source: incomingEdge.source,
								target: outgoingEdge.target,
								type: "custom",
								data: {
									processing: isProcessing,
								},
							});
						}
					}
				}

				// Remove edges connected to the deleted node
				const filteredEdges = currentEdges.filter(
					(edge) => edge.source !== nodeId && edge.target !== nodeId
				);

				// Return filtered edges plus new reconnecting edges
				return [...filteredEdges, ...newEdges];
			});

			// Remove the node
			setNodes((nds) => nds.filter((node) => node.id !== nodeId));
		},
		[isProcessing]
	);

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
					// Fetch detailed information first to create flow
					try {
						const detailedResponse = await getAgentById(
							droppedData.id
						);
						if (detailedResponse.success) {
							const agentDetail = detailedResponse.data;
							const timestamp = Date.now();

							// Create flow from agent's subnet_list and layout
							if (agentDetail.subnet_list && agentDetail.layout) {
								const flowNodes: Node[] = [];
								const flowEdges: Edge[] = [];

								// Create start node
								if (agentDetail.layout.startPosition) {
									const startNodeId = `start-${timestamp}`;
									flowNodes.push({
										id: startNodeId,
										type: "start",
										position:
											agentDetail.layout.startPosition,
										data: {
											label: "Start",
											description: "Start",
											icon: "🚀",
											color: "bg-blue-500",
											onDelete: deleteNode,
										},
									});
								}

								// Create tool nodes for each subnet
								const subnetNodeMapping: Record<
									number,
									string
								> = {};
								agentDetail.subnet_list.forEach(
									(subnet: SubnetItem) => {
										const nodeId = `tool-${subnet.itemID}-${timestamp}`;
										subnetNodeMapping[subnet.itemID] =
											nodeId;

										// Get position from layout or use default
										const nodePosition = agentDetail.layout
											.subnetPositions?.[
											`item-${subnet.itemID}`
										] || {
											x: 300 + (subnet.itemID - 1) * 200,
											y: 200,
										};

										flowNodes.push({
											id: nodeId,
											type: "tool",
											position: nodePosition,
											data: {
												label: subnet.subnetName,
												subnet_name: subnet.subnetName,
												system_prompt:
													subnet.systemPrompt,
												prompt_example:
													subnet.promptExample,
												expected_input:
													subnet.expectedInput,
												expected_output:
													subnet.expectedOutput,
												file_upload: subnet.fileUpload,
												file_download:
													subnet.fileDownload,
												subnet_url: subnet.subnetURL,
												subnet_id: subnet.subnetID,
												onDelete: deleteNode,
												// Include all subnet properties
												...subnet,
											},
										});
									}
								);

								// Create edges based on inputItemID connections
								agentDetail.subnet_list.forEach(
									(subnet: SubnetItem) => {
										if (
											subnet.inputItemID &&
											Array.isArray(subnet.inputItemID)
										) {
											subnet.inputItemID.forEach(
												(inputId: number) => {
													const sourceNodeId =
														subnetNodeMapping[
															inputId
														];
													const targetNodeId =
														subnetNodeMapping[
															subnet.itemID
														];

													if (
														sourceNodeId &&
														targetNodeId
													) {
														flowEdges.push({
															id: `edge-${inputId}-${subnet.itemID}-${timestamp}`,
															source: sourceNodeId,
															target: targetNodeId,
															type: "custom",
															data: {
																processing:
																	isProcessing,
															},
														});
													}
												}
											);
										}
									}
								);

								// Connect start node to first nodes (nodes with no input)
								const startNodeId = `start-${timestamp}`;
								const firstNodes =
									agentDetail.subnet_list.filter(
										(subnet: SubnetItem) =>
											!subnet.inputItemID ||
											subnet.inputItemID.length === 0
									);

								firstNodes.forEach((subnet: SubnetItem) => {
									const targetNodeId =
										subnetNodeMapping[subnet.itemID];
									if (targetNodeId) {
										flowEdges.push({
											id: `edge-start-${subnet.itemID}-${timestamp}`,
											source: startNodeId,
											target: targetNodeId,
											type: "custom",
											data: {
												processing: isProcessing,
											},
										});
									}
								});

								// Add all nodes and edges to the flow
								setNodes((prev) => [...prev, ...flowNodes]);
								setEdges((prev) => [...prev, ...flowEdges]);
							} else {
								// Fallback: create single agent node if no layout/subnet_list
								const nodeId = `agent-${timestamp}`;
								const agentNode: Node = {
									id: nodeId,
									type: "agent",
									position,
									data: {
										label: agentDetail.name,
										description: agentDetail.description,
										onDelete: deleteNode,
									},
								};
								setNodes((prev) => [...prev, agentNode]);
							}
						} else {
							// Handle API error - create simple agent node
							const nodeId = `agent-${Date.now()}`;
							const errorNode: Node = {
								id: nodeId,
								type: "agent",
								position,
								data: {
									label: droppedData.name,
									description: "Failed to load agent details",
									error: true,
									onDelete: deleteNode,
								},
							};
							setNodes((prev) => [...prev, errorNode]);
						}
					} catch (error) {
						console.error("Error fetching agent details:", error);
						// Create error node
						const nodeId = `agent-${Date.now()}`;
						const errorNode: Node = {
							id: nodeId,
							type: "agent",
							position,
							data: {
								label: droppedData.name,
								description: "Failed to load agent details",
								error: true,
								onDelete: deleteNode,
							},
						};
						setNodes((prev) => [...prev, errorNode]);
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
					right:
						rightSidebarWidth > 0
							? `${rightSidebarWidth - 200}px`
							: "20px",
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
