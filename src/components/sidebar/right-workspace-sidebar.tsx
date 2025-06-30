"use client";
import { useState } from "react";
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

const mockTestResults = Array.from({ length: 10 }).map(
	(_, index) => ({
		id: index + 1,
		testId: "1234",
		response: "lorem",
		hasImage: true,
		fileName: "image.png",
		responseData:
			"lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
	})
);

export default function RightWorkspaceSidebar() {
	const [isSubmitted, setIsSubmitted] = useState(true);
	const { state } = useSidebar();
	return (
		<Sidebar
			side="right"
			className={`w-96 border-r border-gray absolute top-0 right-0 h-full bg-background z-20 ${
				state === "collapsed" ? "w-0" : "w-[22rem]"
			}`}
			collapsible="offcanvas"
		>
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
	);
}
