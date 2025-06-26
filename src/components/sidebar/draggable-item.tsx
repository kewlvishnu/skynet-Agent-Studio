import { useCallback } from "react";

interface DraggableItemProps {
	item: unknown;
	title: string;
	description: string;
	icon?: React.ComponentType<{ className?: string }>;
	color?: string;
	isLast?: boolean;
	lastElementRef?: (node: HTMLDivElement) => void;
}

export const DraggableItem = ({
	item,
	title,
	description,
	icon: Icon,
	color,
	isLast,
	lastElementRef,
}: DraggableItemProps) => {
	const handleDragStart = useCallback(
		(e: React.DragEvent) => {
			e.dataTransfer.setData(
				"application/reactflow",
				JSON.stringify(item)
			);
		},
		[item]
	);

	return (
		<div
			ref={isLast ? lastElementRef : undefined}
			className="w-full h-fit border border-gray p-3 flex items-center gap-2 rounded-md bg-background hover:bg-accent/50 transition-colors cursor-grab active:cursor-grabbing"
			draggable
			onDragStart={handleDragStart}
		>
			{Icon && color && (
				<div
					className={`${color} size-8 rounded-sm flex items-center justify-center flex-shrink-0`}
				>
					<Icon className="size-5 text-primary-foreground" />
				</div>
			)}
			<div className="flex flex-col min-w-0 flex-1">
				<h6
					className="font-medium text-sm capitalize truncate"
					title={title}
				>
					{title}
				</h6>
				<p className="text-xs text-muted-foreground line-clamp-4 break-words text-ellipsis">
					{description}
				</p>
			</div>
		</div>
	);
};
