"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Position, NodeResizer, useReactFlow, Node } from "@xyflow/react";
import { Bot, Trash, Maximize2, Minimize2 } from "lucide-react";
import { CustomHandle } from "@/components/handle/custom-handle";
import { getSubnetById } from "@/controllers/subnets/subnets.queries";

interface AgentContainerProps {
	id: string;
	data: {
		label?: string;
		agentName?: string;
		description?: string;
		onDelete?: (nodeId: string) => void;
		childNodes?: string[];
		childNodeCount?: number;
		backgroundColor?: string;
	};
	selected?: boolean;
}

export default function AgentContainer({
	id,
	data,
	selected,
}: AgentContainerProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [containerSize, setContainerSize] = useState({
		width: 1200,
		height: 800,
	});
	const [isManuallyResized, setIsManuallyResized] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const { getNodes, setNodes } = useReactFlow();

	const toggleExpanded = () => {
		const newExpandedState = !isExpanded;
		setIsExpanded(newExpandedState);

		// Hide/show child nodes when container is collapsed/expanded
		const nodes = getNodes();
		const childNodes = nodes.filter((node) => node.parentId === id);

		if (childNodes.length > 0) {
			setNodes((nodes) =>
				nodes.map((node) => {
					if (node.parentId === id) {
						return {
							...node,
							hidden: !newExpandedState,
						};
					}
					return node;
				})
			);
		}

		// Force size recalculation when expanding
		if (newExpandedState) {
			setTimeout(() => {
				updateContainerSize();
			}, 100);
		}
	};

	const handleDelete = () => {
		data.onDelete?.(id);
	};

	const agentName = data.agentName || data.label || "Agent Container";

	// Handle drag over - COMMENTED OUT to disable ondrop functionality
	// const handleDragOver = useCallback((e: React.DragEvent) => {
	// 	e.preventDefault();
	// 	e.stopPropagation();
	// 	e.dataTransfer.dropEffect = "move";
	// }, []);

	// Handle drop of tools into container - COMMENTED OUT to disable ondrop functionality
	// const handleDrop = useCallback(
	// 	async (e: React.DragEvent) => {
	// 		e.preventDefault();
	// 		e.stopPropagation();

	// 		if (!isExpanded) return; // Don't allow drops on collapsed containers

	// 		try {
	// 			const droppedData = JSON.parse(
	// 				e.dataTransfer.getData("application/reactflow")
	// 			);

	// 			// Only handle tools (subnets) for now
	// 			if (droppedData.unique_id && droppedData.subnet_name) {
	// 				const rect = containerRef.current?.getBoundingClientRect();
	// 				if (!rect) return;

	// 				// Calculate position relative to container
	// 				const containerPosition = {
	// 					x: e.clientX - rect.left - 50, // Adjust for padding
	// 					y: e.clientY - rect.top - 80, // Adjust for header
	// 				};

	// 				const nodeId = `tool-${Date.now()}`;
	// 				const timestamp = Date.now();

	// 				// Create tool node as child of this container
	// 				const toolNode: Node = {
	// 					id: nodeId,
	// 					type: "tool",
	// 					position: containerPosition,
	// 					data: {
	// 						...droppedData,
	// 						onDelete: data.onDelete,
	// 						defaultExpanded: false, // Tools dropped into containers are collapsed
	// 					},
	// 					parentId: id,
	// 					extent: "parent" as const,
	// 				} as Node;

	// 				setNodes((prev) => [...prev, toolNode]);

	// 				// Update container's child count
	// 				const currentChildCount = data.childNodeCount || 0;
	// 				setNodes((prev) =>
	// 					prev.map((node) =>
	// 						node.id === id
	// 							? {
	// 									...node,
	// 									data: {
	// 										...node.data,
	// 										childNodeCount:
	// 											currentChildCount + 1,
	// 									},
	// 							  }
	// 							: node
	// 					)
	// 				);

	// 				// Fetch detailed tool information
	// 				try {
	// 					const detailedResponse = await getSubnetById(
	// 						droppedData.unique_id
	// 					);
	// 					if (detailedResponse.success) {
	// 						const toolDetail = detailedResponse.data;
	// 						setNodes((prev) =>
	// 							prev.map((node) =>
	// 								node.id === nodeId
	// 									? {
	// 											...node,
	// 											data: {
	// 												...node.data,
	// 												...toolDetail,
	// 												onDelete: data.onDelete,
	// 												defaultExpanded: false,
	// 											},
	// 									  }
	// 									: node
	// 							)
	// 						);
	// 					}
	// 				} catch (error) {
	// 					console.error("Error fetching tool details:", error);
	// 				}
	// 			}
	// 		} catch (error) {
	// 			console.error("Error parsing dropped data:", error);
	// 		}
	// 	},
	// 	[id, data.onDelete, data.childNodeCount, setNodes, isExpanded]
	// );

	const updateContainerSize = useCallback(() => {
		// Don't auto-resize if user has manually resized
		if (isManuallyResized && isExpanded) {
			return;
		}

		const nodes = getNodes();
		const childNodes = nodes.filter((node) => node.parentId === id);

		if (!isExpanded) {
			const minSize = { width: 400, height: 200 };
			if (
				containerSize.width !== minSize.width ||
				containerSize.height !== minSize.height
			) {
				setContainerSize(minSize);
				setIsManuallyResized(false); // Reset manual resize flag when collapsing
				setNodes((nodes) =>
					nodes.map((node) =>
						node.id === id
							? {
									...node,
									style: {
										...node.style,
										width: minSize.width,
										height: minSize.height,
									},
							  }
							: node
					)
				);
			}
			return;
		}

		if (childNodes.length === 0) {
			const minExpandedSize = { width: 1200, height: 800 };
			if (
				containerSize.width !== minExpandedSize.width ||
				containerSize.height !== minExpandedSize.height
			) {
				setContainerSize(minExpandedSize);
				setNodes((nodes) =>
					nodes.map((node) =>
						node.id === id
							? {
									...node,
									style: {
										...node.style,
										width: minExpandedSize.width,
										height: minExpandedSize.height,
									},
							  }
							: node
					)
				);
			}
			return;
		}

		// Calculate minimum width for 2-column grid layout
		const nodeWidth = 400;
		const nodeSpacing = 20;
		const padding = 100;
		const minGridWidth = 2 * nodeWidth + nodeSpacing + padding;

		let maxX = Math.max(1200, minGridWidth);
		let maxY = 800;

		childNodes.forEach((node) => {
			let nodeWidth = node.measured?.width || 400;
			let nodeHeight = node.measured?.height || 200;

			// Adjust dimensions based on node type and state
			if (node.type === "tool") {
				nodeWidth = node.measured?.width || 384;
				nodeHeight =
					node.measured?.height ||
					(node.data?.defaultExpanded === false ? 120 : 300);
			} else if (node.type === "start") {
				nodeWidth = node.measured?.width || 320;
				nodeHeight = node.measured?.height || 200;
			}

			const nodeRight = node.position.x + nodeWidth;
			const nodeBottom = node.position.y + nodeHeight;

			maxX = Math.max(maxX, nodeRight + 80);
			maxY = Math.max(maxY, nodeBottom + 80);
		});

		const newSize = { width: maxX, height: maxY };

		// Only update if size actually changed
		if (
			newSize.width !== containerSize.width ||
			newSize.height !== containerSize.height
		) {
			setContainerSize(newSize);
			setNodes((nodes) =>
				nodes.map((node) =>
					node.id === id
						? {
								...node,
								style: {
									...node.style,
									width: newSize.width,
									height: newSize.height,
								},
						  }
						: node
				)
			);
		}
	}, [id, getNodes, setNodes, containerSize, isExpanded, isManuallyResized]);

	useEffect(() => {
		updateContainerSize();
	}, [data.childNodeCount, isExpanded, updateContainerSize]);

	// Periodic check for node movements
	useEffect(() => {
		const interval = setInterval(() => {
			updateContainerSize();
		}, 500);

		return () => clearInterval(interval);
	}, [updateContainerSize]);

	return (
		<div
			ref={containerRef}
			className="group relative w-full h-full"
			style={{
				minWidth: isExpanded ? "1200px" : "400px",
				minHeight: isExpanded ? "800px" : "200px",
				width: `${containerSize.width}px`,
				height: `${containerSize.height}px`,
			}}
		>
			<NodeResizer
				color="rgb(59, 130, 246)"
				handleClassName="!rounded-[2px] !size-3"
				lineClassName="!border-dashed !border-[1.5px]"
				isVisible={true}
				minWidth={isExpanded ? 1200 : 400}
				minHeight={isExpanded ? 800 : 200}
				onResize={(event, data) => {
					const newSize = {
						width: data.width,
						height: data.height,
					};
					setContainerSize(newSize);
					setIsManuallyResized(true);

					setNodes((nodes) =>
						nodes.map((node) =>
							node.id === id
								? {
										...node,
										style: {
											...node.style,
											width: newSize.width,
											height: newSize.height,
										},
								  }
								: node
						)
					);
				}}
			/>

			<div
				className="w-full h-full rounded-xl relative hover:border-royal-blue transition-all duration-300"
				// ondrop functionality disabled for agent container
			>
				<div className="absolute -top-8 left-5 z-10">
					<div
						className={`bg-theme border-2 border-dashed border-royal-blue/60 rounded-lg p-4 flex items-center [border-spacing:1px] ${
							isExpanded ? "gap-8" : "gap-6"
						}`}
					>
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
								<Bot className="w-4 h-4 text-white" />
							</div>
							<span className="text-sm font-medium text-foreground">
								{agentName}
							</span>
						</div>

						<div
							className={`flex items-center gap-2 ${
								isExpanded ? "ml-2" : "ml-1"
							}`}
						>
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleExpanded}
								className="h-6 w-6 text-muted-foreground hover:text-royal-blue hover:bg-royal-blue/10"
							>
								{isExpanded ? (
									<Minimize2 className="w-3 h-3" />
								) : (
									<Maximize2 className="w-3 h-3" />
								)}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleDelete}
								className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
							>
								<Trash className="w-3 h-3" />
							</Button>
						</div>
					</div>
				</div>

				<div className="w-full h-full p-4 pt-8">
					{isExpanded ? (
						<div className="w-full h-full flex flex-col">
							{/* Show placeholder when empty */}
							{(!data.childNodeCount ||
								data.childNodeCount === 0) && (
								<div
									className="flex-1 border border-dashed border-border/50 rounded-lg bg-background/20 flex items-center justify-center hover:bg-background/30 hover:border-brand-blue/30 transition-all duration-200"
									// ondrop functionality disabled for agent container
								>
									<div className="text-center text-muted-foreground">
										<Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
										<p className="text-sm">
											Drop tools here to organize them
										</p>
										<p className="text-xs mt-1 opacity-75">
											Tools will be added as child nodes
										</p>
									</div>
								</div>
							)}

							{data.childNodeCount && data.childNodeCount > 0 && (
								<div className="flex-1 rounded-lg bg-background/10"></div>
							)}

							{data.description && (
								<div className="mt-2 p-2 bg-background/30 rounded text-xs text-muted-foreground">
									{data.description}
								</div>
							)}
						</div>
					) : (
						<div className="w-full h-full flex items-center justify-center">
							<div className="text-center text-muted-foreground">
								<Bot className="w-8 h-8 mx-auto mb-1 opacity-50" />
								<p className="text-xs">Container collapsed</p>
							</div>
						</div>
					)}
				</div>

				<CustomHandle
					type="target"
					position={Position.Left}
					id={`${id}-target`}
					className={`!bg-royal-blue !border-royal-blue ${
						!isExpanded ? "!h-8" : ""
					}`}
				/>
				<CustomHandle
					type="source"
					position={Position.Right}
					id={`${id}-source`}
					className={`!bg-royal-blue !border-royal-blue ${
						!isExpanded ? "!h-8" : ""
					}`}
				/>
			</div>
		</div>
	);
}
