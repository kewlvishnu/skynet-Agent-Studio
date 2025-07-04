"use client";

import React, {
	useState,
	useRef,
	useCallback,
	useEffect,
	useMemo,
} from "react";
import { Button } from "@/components/ui/button";
import { Position, useReactFlow, Node, useStore } from "@xyflow/react";
import { Bot, Trash, Maximize2, Minimize2 } from "lucide-react";
import { CustomHandle } from "@/components/handle/custom-handle";
import { getSubnetById } from "@/controllers/subnets/subnets.queries";
import { useExecutionStatus } from "@/providers/ExecutionStatusProvider";

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

export default function AgentContainer({
	id,
	data,
	selected,
}: AgentContainerProps) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [containerSize, setContainerSize] = useState({
		width: 400,
		height: 300,
	});
	const [isTransitioning, setIsTransitioning] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const { getNodes, setNodes, setEdges } = useReactFlow();
	const { executionStatus } = useExecutionStatus();

	// Use React Flow's store to subscribe to node changes more efficiently
	const childNodes = useStore((state) =>
		state.nodes.filter((node) => node.parentId === id)
	);

	// Update edge animations when execution status changes
	useEffect(() => {
		// Update edges based on current execution status
		setEdges((edges) =>
			edges.map((edge) => {
				// Only update edges that are connected to child nodes of this container
				const isChildEdge = childNodes.some(
					(node) => node.id === edge.source || node.id === edge.target
				);

				if (!isChildEdge) return edge;

				// Determine if this edge should be animated based on subnet status
				let shouldAnimate = false;
				let isCompleted = false;

				// Check both source and target nodes for their execution status
				const sourceNode = childNodes.find(
					(node) => node.id === edge.source
				);
				const targetNode = childNodes.find(
					(node) => node.id === edge.target
				);

				// Check if the source node has completed (which means this edge should be blue)
				if (
					sourceNode &&
					sourceNode.data &&
					typeof sourceNode.data === "object" &&
					"itemID" in sourceNode.data
				) {
					const sourceItemID = String(sourceNode.data.itemID);
					const sourceStatus =
						executionStatus.subnetStatuses?.[sourceItemID];

					if (sourceStatus === "completed") {
						isCompleted = true;
					}
				}

				// Check if the target node is currently processing
				if (
					targetNode &&
					targetNode.data &&
					typeof targetNode.data === "object" &&
					"itemID" in targetNode.data
				) {
					const targetItemID = String(targetNode.data.itemID);
					const targetStatus =
						executionStatus.subnetStatuses?.[targetItemID];

					if (targetStatus === "processing") {
						shouldAnimate = true;
						isCompleted = false; // Override completed if currently processing
					}
				}

				// Special case for start node - check if it's connected and execution has started
				if (sourceNode && sourceNode.type === "start") {
					// If any subnet has been processed, the start node's edges should be blue
					const hasAnyCompleted = Object.values(
						executionStatus.subnetStatuses || {}
					).some(
						(status) =>
							status === "completed" || status === "processing"
					);
					if (hasAnyCompleted) {
						isCompleted = true;
					}
				}

				// Only update if state has changed
				if (
					edge.data?.processing !== shouldAnimate ||
					edge.data?.completed !== isCompleted
				) {
					return {
						...edge,
						data: {
							...edge.data,
							processing: shouldAnimate,
							completed: isCompleted,
							executionStatus: executionStatus,
						},
					};
				}

				return edge;
			})
		);
	}, [
		executionStatus.isRunning,
		executionStatus.subnetStatuses,
		childNodes.length,
		id,
		setEdges,
	]);

	const toggleExpanded = () => {
		const newExpandedState = !isExpanded;
		setIsExpanded(newExpandedState);
		setIsTransitioning(true);

		// Hide/show child nodes when container is collapsed/expanded
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
				setIsTransitioning(false);
			}, 300);
		} else {
			setIsTransitioning(false);
		}
	};

	const handleDelete = () => {
		data.onDelete?.(id);
	};

	const agentName = data.agentName || data.label || "Agent Container";

	const updateContainerSize = useCallback(() => {
		if (!isExpanded) {
			const minSize = { width: 350, height: 150 };
			if (
				containerSize.width !== minSize.width ||
				containerSize.height !== minSize.height
			) {
				setContainerSize(minSize);
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
			// More compact default size when empty
			const emptySize = { width: 400, height: 300 };
			if (
				containerSize.width !== emptySize.width ||
				containerSize.height !== emptySize.height
			) {
				setContainerSize(emptySize);
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

		const sizeChanged =
			Math.abs(newSize.width - containerSize.width) > 5 ||
			Math.abs(newSize.height - containerSize.height) > 5;

		const needsShift = leftShift > 0 || topShift > 0;

		if (sizeChanged || needsShift) {
			setContainerSize(newSize);

			setNodes((nodes) => {
				const updates = nodes.map((node) => {
					if (node.id === id) {
						return {
							...node,
							position: needsShift
								? {
										x: containerNode.position.x - leftShift,
										y: containerNode.position.y - topShift,
								  }
								: node.position,
							style: {
								...node.style,
								width: newSize.width,
								height: newSize.height,
							},
						};
					} else if (node.parentId === id && needsShift) {
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
		}
	}, [id, setNodes, getNodes, containerSize, isExpanded, childNodes]);

	const debouncedUpdateContainerSize = useMemo(
		() => debounce(updateContainerSize, 100),
		[updateContainerSize]
	);

	useEffect(() => {
		debouncedUpdateContainerSize();
	}, [childNodes, debouncedUpdateContainerSize]);

	useEffect(() => {
		if (!isTransitioning) {
			updateContainerSize();
		}
	}, [isExpanded, updateContainerSize, isTransitioning]);

	return (
		<div
			ref={containerRef}
			className="group relative w-full h-full rounded-xl border-2 border-dashed border-royal-blue/60"
			style={{
				width: `${containerSize.width}px`,
				height: `${containerSize.height}px`,
				transition:
					isTransitioning || !isExpanded
						? "width 0.3s ease-out, height 0.3s ease-out"
						: "width 0.2s ease-out, height 0.2s ease-out",
			}}
		>
			<div className="w-full h-full rounded-xl relative hover:border-royal-blue transition-all duration-300">
				<div
					className={`absolute -top-8 z-10 ${
						isExpanded ? "left-5" : "left-1/2 -translate-x-1/2"
					}`}
				>
					<div
						className={`bg-theme border-2 border-dashed border-royal-blue/60 rounded-lg p-4 flex items-center [border-spacing:1px] ${
							isExpanded ? "gap-8" : "gap-6"
						}`}
					>
						<div className="flex items-center gap-2">
							<div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
								<Bot className="w-4 h-4 text-white" />
							</div>
							<span className="text-sm font-medium text-foreground whitespace-nowrap">
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
							{childNodes.length === 0 && (
								<div className="flex-1 border border-dashed border-border/50 rounded-lg bg-background/20 flex items-center justify-center hover:bg-background/30 hover:border-brand-blue/30 transition-all duration-200">
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

							{childNodes.length > 0 && (
								<div className="flex-1 rounded-lg bg-background/10"></div>
							)}

							{data.description && (
								<div className="mt-4 p-3 bg-background/30 rounded text-sm text-muted-foreground">
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
