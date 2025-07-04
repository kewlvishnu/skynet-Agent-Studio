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
import { Copy, RotateCcw } from "lucide-react";
import CustomEdge from "@/components/edge/custom-edge";
import RightWorkspaceSidebar from "@/components/sidebar/right-workspace-sidebar";
import WorkspaceSidebar from "@/components/sidebar/workspace-sidebar";
import { getSubnetById } from "@/controllers/subnets/subnets.queries";
import { getAgentById } from "@/controllers/agents/agents.queries";
import toast from "react-hot-toast";

const edgeTypes = {
	custom: CustomEdge,
};

function LeftWorkspaceSidebar() {
	return <WorkspaceSidebar />;
}

function RightSidebar({
	onWidthChange,
	selectedAgent,
}: {
	onWidthChange?: (width: number) => void;
	selectedAgent: any;
}) {
	return (
		<>
			<RightWorkspaceSidebar
				onWidthChange={onWidthChange}
				selectedAgent={selectedAgent}
			/>
		</>
	);
}

function FlowCanvas({
	rightSidebarWidth,
	selectedAgent,
	setSelectedAgent,
}: {
	rightSidebarWidth: number;
	selectedAgent: any;
	setSelectedAgent: (agent: any) => void;
}) {
	const { screenToFlowPosition, setViewport } = useReactFlow();
	const { open } = useSidebar();
	const [nodes, setNodes] = useState<Node[]>([]);

	const [edges, setEdges] = useState<Edge[]>([]);

	// Function to update selected agent's subnet data when tool nodes are modified
	const updateSelectedAgentSubnet = useCallback(
		(nodeId: string, newData: any) => {
			if (!selectedAgent) return;

			setSelectedAgent((prevAgent: any) => {
				if (!prevAgent) return prevAgent;

				// Find the subnet in the agent's subnet list that corresponds to this node
				const updatedSubnets = prevAgent.subnets.map((subnet: any) => {
					// Match by unique_id, itemID, or subnet_name
					if (
						subnet.unique_id === newData.unique_id ||
						subnet.itemID === newData.itemID ||
						subnet.subnet_name === newData.subnet_name
					) {
						return {
							...subnet,
							...newData,
						};
					}
					return subnet;
				});

				return {
					...prevAgent,
					subnets: updatedSubnets,
				};
			});
		},
		[selectedAgent]
	);

	const deleteNode = useCallback(
		(nodeId: string) => {
			setNodes((currentNodes) => {
				const nodeToDelete = currentNodes.find(
					(node) => node.id === nodeId
				);

				// If it's a container node, also delete all child nodes
				if (nodeToDelete?.type === "agentContainer") {
					const childNodes = currentNodes.filter(
						(node) => node.parentId === nodeId
					);
					const childNodeIds = childNodes.map((child) => child.id);

					// Remove edges connected to child nodes
					setEdges((currentEdges) => {
						return currentEdges.filter(
							(edge) =>
								!childNodeIds.includes(edge.source) &&
								!childNodeIds.includes(edge.target) &&
								edge.source !== nodeId &&
								edge.target !== nodeId
						);
					});

					// Clear selected agent if the deleted container was the selected agent
					if (selectedAgent && selectedAgent.id === nodeToDelete.id) {
						setSelectedAgent(null);
					}

					// Remove container and all child nodes
					return currentNodes.filter(
						(node) => node.id !== nodeId && node.parentId !== nodeId
					);
				}

				// Check if this is a child node (has a parent)
				const parentId = nodeToDelete?.parentId;

				// Handle regular node deletion
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
									data: {},
								});
							}
						}
					}

					// Remove edges connected to the deleted node
					const filteredEdges = currentEdges.filter(
						(edge) =>
							edge.source !== nodeId && edge.target !== nodeId
					);

					// Return filtered edges plus new reconnecting edges
					return [...filteredEdges, ...newEdges];
				});

				// Remove the node and update parent container if needed
				const updatedNodes = currentNodes.filter(
					(node) => node.id !== nodeId
				);

				// If this was a child node, update the parent container's child count
				if (parentId) {
					const remainingChildNodes = updatedNodes.filter(
						(node) => node.parentId === parentId
					);
					return updatedNodes.map((node) =>
						node.id === parentId
							? {
									...node,
									data: {
										...node.data,
										childNodeCount:
											remainingChildNodes.length,
									},
							  }
							: node
					);
				}

				return updatedNodes;
			});
		},
		[selectedAgent, setSelectedAgent]
	);

	const onNodesChange: OnNodesChange = useCallback(
		(changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
		[]
	);

	const onEdgesChange: OnEdgesChange = useCallback(
		(changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[]
	);

	const onConnect: OnConnect = useCallback((connection) => {
		const newEdge = {
			...connection,
			type: "custom",
			data: {},
		};
		setEdges((eds) => addEdge(newEdge, eds));
	}, []);

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
													onDataChange:
														updateSelectedAgentSubnet,
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
					const existingAgentContainer = nodes.find(
						(node) => node.type === "agentContainer"
					);
					if (existingAgentContainer) {
						toast.error(
							"Remove existing agent first - only one allowed per flow."
						);
						return;
					}

					try {
						const detailedResponse = await getAgentById(
							droppedData.id
						);

						const timestamp = Date.now();
						const containerId = `agent-container-${timestamp}`;

						if (detailedResponse.success) {
							const agentDetail = detailedResponse.data;

							// Create the container node
							const containerNode: Node = {
								id: containerId,
								type: "agentContainer",
								position,
								data: {
									agentName: agentDetail.name,
									label: agentDetail.name,
									description: agentDetail.description,
									onDelete: deleteNode,
									childNodes: [],
									childNodeCount: 0,
								},
								// Set initial container size
								style: {
									width: 1200,
									height: 800,
								},
							};

							setNodes((prev) => [...prev, containerNode]);

							// Set this agent as the selected agent for testing
							setSelectedAgent({
								id: containerId,
								agentName: agentDetail.name,
								subnets: agentDetail.subnet_list, // Keep the full subnet data
							});

							// If agent has subnet_list, create child nodes inside the container
							if (agentDetail.subnet_list && agentDetail.layout) {
								const childNodes: Node[] = [];
								const childEdges: Edge[] = [];

								// Create start node inside container
								if (agentDetail.layout.startPosition) {
									const startNodeId = `start-${timestamp}`;
									childNodes.push({
										id: startNodeId,
										type: "start",
										position: {
											x: 50,
											y: 50,
										},
										data: {
											label: "Start",
											description: "Start",
											icon: "🚀",
											color: "bg-blue-500",
											onDelete: deleteNode,
										},
										parentId: containerId,
										extent: "parent",
									});
								}

								// Create tool nodes inside container
								const subnetNodeMapping: Record<
									number,
									string
								> = {};
								agentDetail.subnet_list.forEach(
									(subnet: SubnetItem, index: number) => {
										const nodeId = `tool-${subnet.itemID}-${timestamp}`;
										subnetNodeMapping[subnet.itemID] =
											nodeId;

										// Arrange tools in a grid layout (2 columns max)
										const nodesPerRow = 2;
										const nodeWidth = 400; // Tool node width
										const nodeSpacing = 20; // Spacing between nodes

										const row = Math.floor(
											index / nodesPerRow
										);
										const col = index % nodesPerRow;

										const nodePosition = {
											x:
												50 +
												col * (nodeWidth + nodeSpacing),
											y: 200 + row * 150, // 150px between rows (collapsed height + spacing)
										};

										childNodes.push({
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
												onDataChange:
													updateSelectedAgentSubnet,
												defaultExpanded: false,
												...subnet,
											},
											parentId: containerId,
											extent: "parent",
										});
									}
								);

								// Create edges between child nodes
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
														childEdges.push({
															id: `edge-${inputId}-${subnet.itemID}-${timestamp}`,
															source: sourceNodeId,
															target: targetNodeId,
															type: "custom",
															data: {},
														});
													}
												}
											);
										}
									}
								);

								// Connect start node to first nodes
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
										childEdges.push({
											id: `edge-start-${subnet.itemID}-${timestamp}`,
											source: startNodeId,
											target: targetNodeId,
											type: "custom",
											data: {},
										});
									}
								});

								// Add child nodes and edges
								setNodes((prev) => [...prev, ...childNodes]);
								setEdges((prev) => [...prev, ...childEdges]);

								// Update container with child node count and trigger auto-resize
								setTimeout(() => {
									setNodes((prev) =>
										prev.map((node) =>
											node.id === containerId
												? {
														...node,
														data: {
															...node.data,
															childNodeCount:
																childNodes.length,
														},
												  }
												: node
										)
									);
								}, 100); // Small delay to ensure child nodes are positioned first
							}
						} else {
							// Handle API error - create container with error state
							const errorContainer: Node = {
								id: containerId,
								type: "agentContainer",
								position,
								data: {
									agentName: droppedData.name,
									label: droppedData.name,
									description: "Failed to load agent details",
									onDelete: deleteNode,
									childNodes: [],
									childNodeCount: 0,
								},
								style: {
									width: 1000,
									height: 800,
								},
							};
							setNodes((prev) => [...prev, errorContainer]);
						}
					} catch (error) {
						console.error("Error fetching agent details:", error);
						// Create error container
						const containerId = `agent-container-${Date.now()}`;
						const errorContainer: Node = {
							id: containerId,
							type: "agentContainer",
							position,
							data: {
								agentName: droppedData.name,
								label: droppedData.name,
								description: "Failed to load agent details",
								onDelete: deleteNode,
								childNodes: [],
								childNodeCount: 0,
							},
							style: {
								width: 1000,
								height: 800,
							},
						};
						setNodes((prev) => [...prev, errorContainer]);
					}
					return; // Early return to avoid creating newNode below
				}
				// Handle loop block specifically
				else if (droppedData.type === "loop") {
					const containerId = `loop-${Date.now()}`;
					const loopNode: Node = {
						id: containerId,
						type: "loop",
						position,
						data: {
							loopName: droppedData.title,
							label: droppedData.title,
							description: droppedData.description,
							loopType: "count",
							maxIterations: 3,
							currentIteration: 0,
							isRunning: false,
							childNodeCount: 0,
							onDelete: deleteNode,
							onDataChange: updateSelectedAgentSubnet,
						},
						// Set initial container size
						style: {
							width: 1200,
							height: 900,
						},
					};

					setNodes((prev) => [...prev, loopNode]);
				}
				// Otherwise it's a regular block
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
		[screenToFlowPosition, deleteNode, nodes]
	);

	const resetFlow = useCallback(() => {
		setViewport({ x: 200, y: 100, zoom: 0.8 });
	}, [setViewport]);

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
				minZoom={0.1}
				maxZoom={3}
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
					onClick={resetFlow}
					className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
					size="sm"
					title="Reset view to default position and zoom"
				>
					<RotateCcw className="w-4 h-4" />
					Reset View
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
	const [selectedAgent, setSelectedAgent] = useState<{
		id: string;
		agentName: string;
		subnets: any[];
	} | null>(null);

	const handleRightSidebarWidthChange = useCallback((width: number) => {
		setRightSidebarWidth(width);
	}, []);

	return (
		<div className="w-full max-h-[calc(100svh-4rem)] relative flex overflow-hidden">
			<SidebarProvider className="h-full w-fit">
				<LeftWorkspaceSidebar />
			</SidebarProvider>

			<ReactFlowProvider>
				<FlowCanvas
					rightSidebarWidth={rightSidebarWidth}
					selectedAgent={selectedAgent}
					setSelectedAgent={setSelectedAgent}
				/>
			</ReactFlowProvider>

			<SidebarProvider className="h-full w-fit">
				<RightSidebar
					onWidthChange={handleRightSidebarWidthChange}
					selectedAgent={selectedAgent}
				/>
			</SidebarProvider>
		</div>
	);
}
