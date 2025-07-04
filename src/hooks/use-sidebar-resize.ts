import { useState, useCallback, useRef, useEffect } from "react";
import { UI_CONFIG } from "@/config/constants";

interface UseSidebarResizeProps {
	onWidthChange?: (width: number) => void;
	defaultWidth?: number;
	minWidth?: number;
	maxWidth?: number;
}

export const useSidebarResize = ({
	onWidthChange,
	defaultWidth = UI_CONFIG.SIDEBAR.DEFAULT_WIDTH,
	minWidth = UI_CONFIG.SIDEBAR.MIN_WIDTH,
	maxWidth = UI_CONFIG.SIDEBAR.MAX_WIDTH,
}: UseSidebarResizeProps = {}) => {
	const [sidebarWidth, setSidebarWidth] = useState(defaultWidth);
	const [isResizing, setIsResizing] = useState(false);
	const resizeRef = useRef<HTMLDivElement>(null);
	const startXRef = useRef<number>(0);
	const startWidthRef = useRef<number>(defaultWidth);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return;

			const deltaX = startXRef.current - e.clientX;
			const newWidth = startWidthRef.current + deltaX;
			const clampedWidth = Math.min(
				Math.max(newWidth, minWidth),
				maxWidth
			);

			setSidebarWidth(clampedWidth);
			onWidthChange?.(clampedWidth);
		},
		[isResizing, onWidthChange, minWidth, maxWidth]
	);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
		document.body.style.userSelect = "";
		document.body.style.cursor = "";
	}, []);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			startXRef.current = e.clientX;
			startWidthRef.current = sidebarWidth;
			setIsResizing(true);
		},
		[sidebarWidth]
	);

	useEffect(() => {
		if (isResizing) {
			document.body.style.userSelect = "none";
			document.body.style.cursor = "col-resize";
			document.addEventListener("mousemove", handleMouseMove, {
				passive: false,
			});
			document.addEventListener("mouseup", handleMouseUp, {
				passive: false,
			});
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing, handleMouseMove, handleMouseUp]);

	const resetWidth = useCallback(() => {
		setSidebarWidth(defaultWidth);
		onWidthChange?.(defaultWidth);
	}, [defaultWidth, onWidthChange]);

	return {
		sidebarWidth,
		isResizing,
		handleMouseDown,
		resetWidth,
		resizeRef,
	};
};
