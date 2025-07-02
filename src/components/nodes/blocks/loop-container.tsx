"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Position, NodeResizer, useReactFlow, Node } from "@xyflow/react";
import {
	RotateCcw,
	Trash,
	Maximize2,
	Minimize2,
	Play,
	Pause,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { CustomHandle } from "@/components/handle/custom-handle";
import { getSubnetById } from "@/controllers/subnets/subnets.queries";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LoopContainerProps {
	id: string;
	data: {
		label?: string;
		loopName?: string;
		loopType?: "count" | "condition" | "infinite";
		maxIterations?: number;
		currentIteration?: number;
		isRunning?: boolean;
		childNodeCount?: number;
		onDelete?: (nodeId: string) => void;
	};
}

export default function LoopContainer({ id, data }: LoopContainerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { setNodes, getNodes } = useReactFlow();
	const [isExpanded, setIsExpanded] = useState(true);
	const [isManuallyResized, setIsManuallyResized] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [containerSize, setContainerSize] = useState({
		width: 900,
		height: 400,
	});

	const loopName = data.loopName || data.label || "Loop Container";
	const loopType = data.loopType || "count";
	const maxIterations = data.maxIterations || 1;
	const currentIteration = data.currentIteration || 0;
	const isRunning = data.isRunning || false;

	// Handle drag over
	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		e.dataTransfer.dropEffect = "move";
	}, []);

	// Handle drop of tools and blocks into container
	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (!isExpanded) return; // Don't allow drops on collapsed containers

			try {
				const droppedData = JSON.parse(
					e.dataTransfer.getData("application/reactflow")
				);

				// Get existing child nodes to calculate positioning
				const nodes = getNodes();
				const childNodes = nodes.filter((node) => node.parentId === id);

				// Calculate automatic positioning for new node
				const calculatePosition = () => {
					const padding = 50;
					const nodeSpacing = 40; // Increased horizontal spacing between nodes
					const nodeWidth = 350; // Node width
					const nodeHeight = 120; // Height for collapsed nodes

					// Ensure at least 2 nodes per row, adjust container if needed
					const minContainerWidth =
						2 * nodeWidth + 3 * nodeSpacing + 2 * padding;
					const effectiveWidth = Math.max(
						containerSize.width,
						minContainerWidth
					);

					const nodesPerRow = Math.max(
						2,
						Math.floor(
							(effectiveWidth - 2 * padding) /
								(nodeWidth + nodeSpacing)
						)
					);

					const row = Math.floor(childNodes.length / nodesPerRow);
					const col = childNodes.length % nodesPerRow;

					console.log("Position calculation:", {
						childNodesCount: childNodes.length,
						nodesPerRow,
						row,
						col,
						containerWidth: containerSize.width,
						effectiveWidth,
						spacing: nodeSpacing,
					});

					return {
						x: padding + col * (nodeWidth + nodeSpacing),
						y: padding + 80 + row * (nodeHeight + nodeSpacing), // Extra space for header and controls
					};
				};

				const newPosition = calculatePosition();
				const timestamp = Date.now();

				// Handle tool drops (subnets)
				if (droppedData.unique_id && droppedData.subnet_name) {
					const nodeId = `tool-${timestamp}`;

					// Create tool node as child of this container
					const toolNode: Node = {
						id: nodeId,
						type: "tool",
						position: newPosition,
						data: {
							...droppedData,
							onDelete: data.onDelete,
							defaultExpanded: false, // Tools dropped into containers are collapsed
						},
						parentId: id,
						extent: "parent" as const,
					} as Node;

					setNodes((prev) => [...prev, toolNode]);

					// Update container's child count
					const currentChildCount = data.childNodeCount || 0;
					setNodes((prev) =>
						prev.map((node) =>
							node.id === id
								? {
										...node,
										data: {
											...node.data,
											childNodeCount:
												currentChildCount + 1,
										},
								  }
								: node
						)
					);

					// Fetch detailed tool information
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
													onDelete: data.onDelete,
													defaultExpanded: false,
												},
										  }
										: node
								)
							);
						}
					} catch (error) {
						console.error("Error fetching tool details:", error);
					}
				}
				// Handle block drops (start, condition, knowledge, etc.)
				else if (droppedData.type) {
					const nodeId = `${droppedData.type}-${timestamp}`;

					// Create block node as child of this container
					const blockNode: Node = {
						id: nodeId,
						type: droppedData.type,
						position: newPosition,
						data: {
							...droppedData,
							onDelete: data.onDelete,
							defaultExpanded: false,
						},
						parentId: id,
						extent: "parent" as const,
					} as Node;

					setNodes((prev) => [...prev, blockNode]);

					// Update container's child count
					const currentChildCount = data.childNodeCount || 0;
					setNodes((prev) =>
						prev.map((node) =>
							node.id === id
								? {
										...node,
										data: {
											...node.data,
											childNodeCount:
												currentChildCount + 1,
										},
								  }
								: node
						)
					);
				}

				// Trigger container resize after adding node
				setTimeout(() => {
					updateContainerSize();
				}, 100);
			} catch (error) {
				console.error("Error parsing dropped data:", error);
			}
		},
		[
			id,
			data.onDelete,
			data.childNodeCount,
			setNodes,
			isExpanded,
			getNodes,
			containerSize.width,
		]
	);

	const updateContainerSize = useCallback(() => {
		// Don't auto-resize if user has manually resized
		if (isManuallyResized && isExpanded) {
			return;
		}

		const nodes = getNodes();
		const childNodes = nodes.filter((node) => node.parentId === id);

		if (!isExpanded) {
			const minSize = { width: 400, height: 250 };
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
			const minExpandedSize = { width: 900, height: 400 }; // Wider to accommodate 2 nodes per row with better spacing
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

		let maxX = Math.max(900, 900); // Minimum width for loop container to fit 2 nodes per row with better spacing
		let maxY = 400;

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

	const handleDelete = useCallback(() => {
		const nodes = getNodes();
		const childNodeIds = nodes
			.filter((node) => node.parentId === id)
			.map((node) => node.id);

		setNodes((prev) =>
			prev.filter(
				(node) => node.id !== id && !childNodeIds.includes(node.id)
			)
		);

		data.onDelete?.(id);
	}, [id, data.onDelete, getNodes, setNodes]);

	const handleLoopTypeChange = useCallback(
		(newType: string) => {
			setNodes((prev) =>
				prev.map((node) =>
					node.id === id
						? {
								...node,
								data: {
									...node.data,
									loopType: newType as
										| "count"
										| "condition"
										| "infinite",
								},
						  }
						: node
				)
			);
		},
		[id, setNodes]
	);

	const handleMaxIterationsChange = useCallback(
		(value: string) => {
			const numValue = parseInt(value, 10);
			if (!isNaN(numValue) && numValue > 0) {
				setNodes((prev) =>
					prev.map((node) =>
						node.id === id
							? {
									...node,
									data: {
										...node.data,
										maxIterations: numValue,
									},
							  }
							: node
					)
				);
			}
		},
		[id, setNodes]
	);

	return (
		<div
			ref={containerRef}
			className="group relative w-full h-full"
			style={{
				minWidth: isExpanded ? "900px" : "400px",
				minHeight: isExpanded ? "400px" : "250px",
				width: `${containerSize.width}px`,
				height: `${containerSize.height}px`,
			}}
		>
			<NodeResizer
				color="rgb(249, 115, 22)"
				handleClassName="!rounded-[2px] !size-3"
				lineClassName="!border-dashed !border-[1.5px]"
				isVisible={true}
				minWidth={isExpanded ? 900 : 400}
				minHeight={isExpanded ? 400 : 250}
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
				className="w-full h-full rounded-xl relative hover:border-orange-500 transition-all duration-300 border-2 border-dashed border-orange-500/30"
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<div className="absolute -top-8 left-5 z-10">
					<div
						className={`bg-theme border-2 border-dashed border-orange-500 rounded-lg p-4 flex items-center [border-spacing:1px] ${
							isExpanded ? "w-auto" : "w-auto"
						}`}
					>
						<div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg mr-3">
							<RotateCcw className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1">
							<h2 className="text-lg font-semibold text-foreground">
								{loopName}
							</h2>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span>
									{loopType === "infinite"
										? "∞ iterations"
										: `${currentIteration}/${maxIterations} iterations`}
								</span>
								{isRunning && (
									<span className="text-orange-500 font-medium">
										Running
									</span>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2 ml-4">
							<Button
								variant="ghost"
								size="icon"
								onClick={toggleExpanded}
								className="text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10"
							>
								{isExpanded ? (
									<Minimize2 className="w-4 h-4" />
								) : (
									<Maximize2 className="w-4 h-4" />
								)}
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleDelete}
								className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
							>
								<Trash className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>

				{isExpanded && (
					<div className="w-full h-full rounded-xl relative">
						{/* Dropdown positioned outside the droppable area */}
						<div className="absolute -top-6 right-4 z-20">
							<DropdownMenu
								open={isDropdownOpen}
								onOpenChange={setIsDropdownOpen}
							>
								<DropdownMenuTrigger asChild>
									<Button
										variant="outline"
										className="bg-background/90 backdrop-blur-sm"
									>
										<span className="text-sm font-medium text-foreground">
											Iterations: {maxIterations}
										</span>
										{isDropdownOpen ? (
											<ChevronUp className="w-4 h-4 text-muted-foreground ml-2" />
										) : (
											<ChevronDown className="w-4 h-4 text-muted-foreground ml-2" />
										)}
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56 px-2 pb-3 bg-background border-gray">
									<h5 className="text-[13px] font-medium text-muted-foreground">
										Loop Iterations
									</h5>
									<Input
										type="number"
										min="1"
										max="100"
										value={maxIterations}
										onChange={(e) =>
											handleMaxIterationsChange(
												e.target.value
											)
										}
										className="bg-background/50 border border-gray"
									/>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						{/* Full droppable area matching the border */}
						<div
							className="w-full h-full rounded-xl p-6 pt-16"
							onDragOver={handleDragOver}
							onDrop={handleDrop}
						>
							{(!data.childNodeCount ||
								data.childNodeCount === 0) && (
								<div className="w-full h-full rounded-lg bg-background/20 flex items-center justify-center hover:bg-background/30 transition-all duration-200">
									<div className="text-center text-muted-foreground">
										<RotateCcw className="w-12 h-12 mx-auto mb-2 opacity-50" />
										<p className="text-sm">
											Drop tools and blocks here to loop
											them
										</p>
										<p className="text-xs mt-1 opacity-75">
											Nodes will execute repeatedly based
											on loop settings
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
				)}

				<CustomHandle
					type="target"
					position={Position.Left}
					id={`${id}-target`}
					className={`!bg-orange-500 !border-orange-500 ${
						!isExpanded ? "!h-8" : ""
					}`}
				/>
				<CustomHandle
					type="source"
					position={Position.Right}
					id={`${id}-source`}
					className={`!bg-orange-500 !border-orange-500 ${
						!isExpanded ? "!h-8" : ""
					}`}
				/>
			</div>
		</div>
	);
}
