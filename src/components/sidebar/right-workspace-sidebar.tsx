"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
	PromptInputSection,
	TabNavigation,
	ResponsePanel,
	LogsPanel,
} from "./test-flow-components";
import { MoveHorizontal } from "lucide-react";

// Mock data - in a real app, this would come from props or state
const logs = [
	"✅ Connection established successfully",
	"🔄 Initializing test environment...",
	"📁 Loading configuration files",
	"🔗 Connecting to external API",
	"📤 Uploading test data",
	"🔌 Plugin activated",
	"❌ Authentication failed - invalid credentials",
	"🔄 Retrying connection...",
	"✅ Test completed successfully",
	"This is a regular log message without an icon",
	"This is a regular log message without an icon",
	"This is a regular log message without an icon",
	"This is a regular log message without an icon",
];

const mockTestResults = Array.from({ length: 10 }).map((_, index) => ({
	id: index + 1,
	testId: "1234",
	response: "lorem",
	hasImage: true,
	fileName: "image.png",
	responseData:
		"lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
}));

interface RightWorkspaceSidebarProps {
	onWidthChange?: (width: number) => void;
}

export default function RightWorkspaceSidebar({
	onWidthChange,
}: RightWorkspaceSidebarProps) {
	const [isSubmitted, setIsSubmitted] = useState(true);
	const { state } = useSidebar();
	const sidebarRef = useRef<HTMLDivElement>(null);
	const [sidebarWidth, setSidebarWidth] = useState(352); // 22rem = 352px
	const [isResizing, setIsResizing] = useState(false);
	const resizeRef = useRef<HTMLDivElement>(null);
	const startXRef = useRef<number>(0);
	const startWidthRef = useRef<number>(352);

	const minWidth = 280; // Minimum width
	const maxWidth = 600; // Maximum width

	const handleMouseMove = useCallback((e: MouseEvent) => {
		if (!isResizing) return;

		const deltaX = startXRef.current - e.clientX;
		const newWidth = startWidthRef.current + deltaX;
		const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
		
		setSidebarWidth(clampedWidth);
		onWidthChange?.(state === "collapsed" ? 0 : clampedWidth);
	}, [isResizing, onWidthChange, state, minWidth, maxWidth]);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
		document.body.style.userSelect = "";
		document.body.style.cursor = "";
	}, []);

	useEffect(() => {
		if (isResizing) {
			document.body.style.userSelect = "none";
			document.body.style.cursor = "col-resize";
			document.addEventListener("mousemove", handleMouseMove, { passive: false });
			document.addEventListener("mouseup", handleMouseUp, { passive: false });
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing, handleMouseMove, handleMouseUp]);

	// Notify parent of width changes when sidebar state or width changes
	useEffect(() => {
		onWidthChange?.(state === "collapsed" ? 0 : sidebarWidth);
	}, [state, sidebarWidth, onWidthChange]);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		startXRef.current = e.clientX;
		startWidthRef.current = sidebarWidth;
		setIsResizing(true);
	}, [sidebarWidth]);

	return (
		<div>
			<Sidebar
				side="right"
				className={`border-r border-gray absolute top-0 right-0 h-full bg-background z-20 ${
					state === "collapsed" ? "w-0" : ""
				}`}
				style={{
					width: state === "collapsed" ? 0 : sidebarWidth,
				}}
				collapsible="icon"
				ref={sidebarRef}
			>
				{state !== "collapsed" && (
					<div
						ref={resizeRef}
						className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500/20 transition-colors z-30"
						onMouseDown={handleMouseDown}
					>
						<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-r opacity-0 hover:opacity-100 transition-opacity" />
					</div>
				)}

				<SidebarHeader className="p-4 border-b border-gray">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold">Test Flow</h2>
					</div>
				</SidebarHeader>
				<SidebarContent className="overflow-hidden flex flex-col">
					<PromptInputSection />

					{!!isSubmitted && (
						<div className="flex-1 overflow-hidden">
							<Tabs
								defaultValue="response"
								className="h-full flex flex-col gap-y-6"
							>
								<TabNavigation />

								<div className="flex-1 overflow-hidden">
									<TabsContent
										value="response"
										className="h-full m-0"
									>
										<ResponsePanel
											status="Running..."
											progress={10}
											currentStep="Step 1"
											testResults={mockTestResults}
										/>
									</TabsContent>

									<TabsContent
										value="logs"
										className="h-full m-0 px-4 pb-4"
									>
										<LogsPanel logs={logs} />
									</TabsContent>
								</div>
							</Tabs>
						</div>
					)}
				</SidebarContent>
				<SidebarFooter className="h-16 border-t border-gray z-50">
					<SidebarTrigger className="ml-auto size-8 z-50 absolute right-3 bottom-5" />
				</SidebarFooter>
			</Sidebar>
		</div>
	);
}
