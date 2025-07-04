"use client";

import React, {
	useState,
	useRef,
	useCallback,
	useEffect,
	useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Position, useReactFlow, Node, useStore } from "@xyflow/react";
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

interface LoopNodeProps {
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
		onDataChange?: (nodeId: string, newData: any) => void;
	};
}

// Debounce function to limit update frequency
function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export default function LoopNode({ id, data }: LoopNodeProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
	const [isExpanded, setIsExpanded] = useState(true);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [containerSize, setContainerSize] = useState({
		width: 600,
		height: 400,
	});

	// Track if we're currently updating to prevent loops
	const isUpdatingRef = useRef(false);
	const lastUpdateRef = useRef({ width: 600, height: 400, x: 0, y: 0 });

	// Use React Flow's store to subscribe to node changes more efficiently
	const childNodes = useStore((state) =>
		state.nodes.filter((node) => node.parentId === id)
	);

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

	const handleDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (!isExpanded) return; // Don't allow drops on collapsed containers

			try {
				const droppedData = JSON.parse(
					e.dataTransfer.getData("application/reactflow")
				);

				// Calculate relative position based on where the user dropped
				const calculateRelativePosition = () => {
					if (!containerRef.current) {
						console.log(
							"Container ref not found, using fallback position"
						);
						return { x: 50, y: 50 };
					}

					// Get the container element's bounding rect
					const containerRect =
						containerRef.current.getBoundingClientRect();

					// Get the parent node from React Flow
					const parentNode = getNodes().find((n) => n.id === id);
					if (!parentNode) {
						console.log("Parent node not found");
						return { x: 50, y: 50 };
					}

					// Convert screen coordinates to flow coordinates
					const flowPosition = screenToFlowPosition({
						x: e.clientX,
						y: e.clientY,
					});

					// Calculate the relative position within the parent node
					// The child position is relative to the parent's top-left corner
					const relativeX = flowPosition.x - parentNode.position.x;
					const relativeY = flowPosition.y - parentNode.position.y;

					console.log("Drop calculation:", {
						screenPos: { x: e.clientX, y: e.clientY },
						flowPos: flowPosition,
						parentPos: parentNode.position,
						relativePos: { x: relativeX, y: relativeY },
					});

					// Define node dimensions
					const nodeWidth = 350;
					const nodeHeight = 120;

					// Center the node on the drop point
					const centeredX = relativeX - nodeWidth / 2;
					const centeredY = relativeY - nodeHeight / 2;

					// Account for container padding and ensure node stays within bounds
					const padding = 24; // p-6
					const topPadding = 64; // pt-16
					const minX = padding;
					const minY = topPadding;
					const maxX = containerSize.width - nodeWidth - padding;
					const maxY = containerSize.height - nodeHeight - padding;

					const finalPosition = {
						x: Math.max(minX, Math.min(centeredX, maxX)),
						y: Math.max(minY, Math.min(centeredY, maxY)),
					};

					console.log("Final position:", finalPosition);

					return finalPosition;
				};

				const newPosition = calculateRelativePosition();
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
							onDataChange: data.onDataChange,
							defaultExpanded: false,
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
													onDataChange:
														data.onDataChange,
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
				// Handle block drops
				else if (droppedData.type) {
					const nodeId = `${droppedData.type}-${timestamp}`;

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
			} catch (error) {
				console.error("Error parsing dropped data:", error);
			}
		},
		[
			id,
			data.onDelete,
			data.childNodeCount,
			setNodes,
			getNodes,
			screenToFlowPosition,
			isExpanded,
			containerSize,
		]
	);

	const updateContainerSize = useCallback(() => {
		// Prevent recursive updates
		if (isUpdatingRef.current) return;

		if (!isExpanded) {
			const minSize = { width: 350, height: 150 };
			if (
				containerSize.width !== minSize.width ||
				containerSize.height !== minSize.height
			) {
				setContainerSize(minSize);
				isUpdatingRef.current = true;
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
				setTimeout(() => {
					isUpdatingRef.current = false;
				}, 100);
			}
			return;
		}

		if (childNodes.length === 0) {
			const emptySize = { width: 600, height: 400 };
			if (
				containerSize.width !== emptySize.width ||
				containerSize.height !== emptySize.height
			) {
				setContainerSize(emptySize);
				isUpdatingRef.current = true;
				setNodes((nodes) =>
					nodes.map((node) =>
						node.id === id
							? {
									...node,
									style: {
										...node.style,
										width: emptySize.width,
										height: emptySize.height,
									},
							  }
							: node
					)
				);
				setTimeout(() => {
					isUpdatingRef.current = false;
				}, 100);
			}
			return;
		}

		// Get current container position
		const containerNode = getNodes().find((n) => n.id === id);
		if (!containerNode) return;

		// Find the bounds of all child nodes
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		childNodes.forEach((node) => {
			let nodeWidth = node.measured?.width || 400;
			let nodeHeight = node.measured?.height || 200;

			if (node.type === "tool") {
				nodeWidth = node.measured?.width || 384;
				nodeHeight =
					node.measured?.height ||
					(node.data?.defaultExpanded === false ? 120 : 300);
			} else if (node.type === "start") {
				nodeWidth = node.measured?.width || 320;
				nodeHeight = node.measured?.height || 200;
			}

			const nodeLeft = node.position.x;
			const nodeTop = node.position.y;
			const nodeRight = node.position.x + nodeWidth;
			const nodeBottom = node.position.y + nodeHeight;

			minX = Math.min(minX, nodeLeft);
			minY = Math.min(minY, nodeTop);
			maxX = Math.max(maxX, nodeRight);
			maxY = Math.max(maxY, nodeBottom);
		});

		const padding = 60;
		const topPadding = 50;
		const bottomPadding = 120;

		const leftShift = minX < padding ? padding - minX : 0;
		const topShift = minY < topPadding ? topPadding - minY : 0;

		const width = Math.max(maxX + padding + leftShift, 400);
		const height = Math.max(maxY + bottomPadding + topShift, 300);

		const newSize = {
			width: width,
			height: height,
		};

		// Check if update is actually needed
		const sizeChanged =
			Math.abs(newSize.width - lastUpdateRef.current.width) > 5 ||
			Math.abs(newSize.height - lastUpdateRef.current.height) > 5;

		const positionChanged =
			Math.abs(leftShift - lastUpdateRef.current.x) > 5 ||
			Math.abs(topShift - lastUpdateRef.current.y) > 5;

		const needsUpdate = sizeChanged || positionChanged;

		if (needsUpdate) {
			// Update our tracking refs
			lastUpdateRef.current = {
				width: newSize.width,
				height: newSize.height,
				x: leftShift,
				y: topShift,
			};

			setContainerSize(newSize);
			isUpdatingRef.current = true;

			setNodes((nodes) => {
				const updates = nodes.map((node) => {
					if (node.id === id) {
						return {
							...node,
							position:
								leftShift > 0 || topShift > 0
									? {
											x:
												containerNode.position.x -
												leftShift,
											y:
												containerNode.position.y -
												topShift,
									  }
									: node.position,
							style: {
								...node.style,
								width: newSize.width,
								height: newSize.height,
							},
						};
					} else if (
						node.parentId === id &&
						(leftShift > 0 || topShift > 0)
					) {
						return {
							...node,
							position: {
								x: node.position.x + leftShift,
								y: node.position.y + topShift,
							},
						};
					}
					return node;
				});

				return updates;
			});

			// Reset the updating flag after a delay
			setTimeout(() => {
				isUpdatingRef.current = false;
			}, 100);
		}
	}, [id, setNodes, getNodes, containerSize, isExpanded, childNodes]);

	const debouncedUpdateContainerSize = useMemo(
		() => debounce(updateContainerSize, 150),
		[updateContainerSize]
	);

	useEffect(() => {
		if (!isUpdatingRef.current) {
			debouncedUpdateContainerSize();
		}
	}, [childNodes.length, debouncedUpdateContainerSize]);

	useEffect(() => {
		if (!isTransitioning && !isUpdatingRef.current) {
			updateContainerSize();
		}
	}, [isExpanded, updateContainerSize, isTransitioning]);

	const toggleExpanded = () => {
		const newExpandedState = !isExpanded;
		setIsExpanded(newExpandedState);
		setIsTransitioning(true);

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

		if (newExpandedState) {
			setTimeout(() => {
				updateContainerSize();
				setIsTransitioning(false);
			}, 300);
		} else {
			setIsTransitioning(false);
		}
	};

	const handleDelete = useCallback(() => {
		const childNodeIds = childNodes.map((node) => node.id);

		setNodes((prev) =>
			prev.filter(
				(node) => node.id !== id && !childNodeIds.includes(node.id)
			)
		);

		data.onDelete?.(id);
	}, [id, data.onDelete, childNodes, setNodes]);

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
				width: `${containerSize.width}px`,
				height: `${containerSize.height}px`,
				transition:
					isTransitioning || !isExpanded
						? "width 0.3s ease-out, height 0.3s ease-out"
						: "width 0.2s ease-out, height 0.2s ease-out",
			}}
		>
			{/* Removed NodeResizer - no manual resizing allowed */}

			<div
				className="w-full h-full rounded-xl relative transition-all duration-300 border-2 border-dashed border-orange-500/80"
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<div
					className={`absolute -top-8 z-10 ${
						isExpanded ? "left-5" : "left-1/2 -translate-x-1/2"
					}`}
				>
					<div
						className={`bg-theme border-2 border-dashed border-orange-500 rounded-lg p-4 flex items-center [border-spacing:1px] w-auto`}
					>
						<div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg mr-3">
							<RotateCcw className="size-4 text-white" />
						</div>
						<div className="flex-1">
							<h2 className="text-lg font-medium text-foreground whitespace-nowrap">
								{loopName}
							</h2>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<span className="whitespace-nowrap">
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
							data-droppable="true"
							onDragOver={handleDragOver}
							onDrop={handleDrop}
						>
							{childNodes.length === 0 && (
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

				{!isExpanded && (
					<div className="w-full h-full flex items-center justify-center">
						<div className="text-center text-muted-foreground">
							<RotateCcw className="w-8 h-8 mx-auto mb-1 opacity-50" />
							<p className="text-xs">Loop collapsed</p>
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
