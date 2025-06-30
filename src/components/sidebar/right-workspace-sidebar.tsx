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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
	CheckCheck,
	CheckCircle,
	Download,
	Expand,
	File,
	FileCode,
	FileText,
	Folder,
	Image,
	Info,
	Link,
	Loader2,
	Maximize2,
	Play,
	Terminal,
	Upload,
	Zap,
	XCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

const navigationItems = [
	{
		name: "Response",
		value: "response",
		icon: <FileText className="h-4 w-4" />,
	},
	{ name: "Logs", value: "logs", icon: <Terminal className="h-4 w-4" /> },
];

const getLogIcon = (log: string) => {
	if (log.startsWith("✅"))
		return <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />;
	if (log.startsWith("❌"))
		return <XCircle className="h-3 w-3 text-red-400 flex-shrink-0" />;
	if (log.startsWith("🔄"))
		return (
			<Loader2 className="h-3 w-3 text-blue-400 flex-shrink-0 animate-spin" />
		);
	if (log.startsWith("📁"))
		return <Folder className="h-3 w-3 text-purple-400 flex-shrink-0" />;
	if (log.startsWith("🔗"))
		return <Link className="h-3 w-3 text-cyan-400 flex-shrink-0" />;
	if (log.startsWith("📤"))
		return <Upload className="h-3 w-3 text-yellow-400 flex-shrink-0" />;
	if (log.startsWith("🔌"))
		return <Zap className="h-3 w-3 text-orange-400 flex-shrink-0" />;
	return <Info className="h-3 w-3 text-gray-400 flex-shrink-0" />;
};

const getLogColor = (log: string) => {
	if (log.startsWith("✅")) return "text-green-300";
	if (log.startsWith("❌")) return "text-red-300";
	if (log.startsWith("🔄")) return "text-blue-300";
	if (log.startsWith("📁")) return "text-purple-300";
	if (log.startsWith("🔗")) return "text-cyan-300";
	if (log.startsWith("📤")) return "text-yellow-300";
	if (log.startsWith("🔌")) return "text-orange-300";
	return "text-gray-300";
};

const cleanLogMessage = (log: string) => {
	// Remove emoji from the beginning of the message
	return log.replace(/^[✅❌🔄📁🔗📤🔌]\s*/u, "").trim();
};

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
				<div className="p-4 space-y-4 flex-shrink-0">
					<div className="space-y-1">
						<h5 className="text-sm font-medium">Enter Prompt</h5>
						<Textarea
							id="request-input"
							placeholder="Enter your prompt here..."
							className="resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
							rows={4}
						/>
					</div>

					<Button className="w-full">
						<Play className="h-4 w-4" />
						Run Test
					</Button>
				</div>

				{!!isSubmitted && (
					<div className="flex-1 overflow-hidden">
						<Tabs
							defaultValue="response"
							className="h-full flex flex-col gap-y-6"
						>
							<div className="w-full border-b border-gray relative h-10">
								<TabsList className="w-fit bg-transparent py-0 my-0 absolute left-3 top-[7px] flex items-center gap-x-6">
									{navigationItems.map((item) => (
										<TabsTrigger
											key={item.name}
											value={item.value}
											className="w-fit text-sm flex items-center gap-2 border-b-4 px-4 pb-1 border-transparent bg-transparent rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-eerie-black/70 transition-all duration-200 ease-in-out"
										>
											{item.icon}
											{item.name}
										</TabsTrigger>
									))}
								</TabsList>
							</div>

							<div className="flex-1 overflow-hidden">
								<TabsContent
									value="response"
									className="h-full m-0 "
								>
									<div className="border border-gray rounded-lg mx-4 p-2.5 space-y-1.5">
										<div>
											<div className="flex justify-between items-center mb-1">
												<span className="text-sm font-medium text-gray-800">
													{/* {testStatus.status === */}
													Running...
													{/* ? "Test in progress..."
														: testStatus.status ===
														  "completed"
														? "Test completed"
														: "Test failed"} */}
												</span>
												<span className="text-xs text-gray-600">
													10%
												</span>
											</div>
											<Progress
												value={10}
												className="h-2"
											/>
										</div>

										{/* {testStatus.currentSubnet && ( */}
										<div className="text-sm bg-gray-50 rounded-md py-1">
											<span className="font-medium text-gray-800">
												Current step:
											</span>{" "}
											<span className="text-gray-700">
												Step 1
												{/* {testStatus.currentSubnet} */}
											</span>
										</div>
										{/* )} */}
									</div>
									<ScrollArea className="h-[calc(100%-5.2rem)] py-3 px-4">
										<div className="space-y-2">
											<Accordion
												type="single"
												collapsible
												className="space-y-2"
											>
												{Array.from({ length: 10 }).map(
													(_, index) => (
														<AccordionItem
															value={`item-${index}`}
															className="border border-gray rounded-lg overflow-hidden data-[state=open]:border"
														>
															<AccordionTrigger className="bg-sidebar-accent px-2 py-4 w-full flex items-center hover:underline-none data-[state=open]:border-b data-[state=open]:border-b-gray">
																<div className="flex items-center gap-2">
																	<CheckCheck className="h-4 w-4 text-green-500" />
																	<h6 className="text-base font-medium">
																		Test{" "}
																		{index +
																			1}
																	</h6>
																	<div className="text-[14px] text-muted-foreground">
																		[ID:
																		1234]
																	</div>
																</div>
															</AccordionTrigger>
															<AccordionContent className="px-2 py-4">
																<div className="space-y-6">
																	<div className="space-y-1">
																		<div className="flex items-center gap-2 justify-between">
																			<h4 className="text-sm font-medium text-foreground">
																				Response
																			</h4>
																			<Button
																				variant="ghost"
																				size="sm"
																				className="h-6 px-2"
																			>
																				<Maximize2 className="h-3 w-3" />
																			</Button>
																		</div>
																		<>
																			<Textarea
																				className="text-muted-foreground text-sm px-2"
																				rows={
																					4
																				}
																			>
																				{`lorem`}
																			</Textarea>
																		</>
																	</div>

																	<div className="space-y-2">
																		<h4 className="text-sm font-medium text-foreground">
																			Generated
																			Files
																		</h4>
																		<div className="flex items-center gap-2 justify-between">
																			<div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
																				{true ? (
																					<Image className="h-4 w-4 text-green-500" />
																				) : (
																					<FileText className="h-4 w-4 text-blue-500" />
																				)}

																				<span className="text-sm ">
																					image.png
																				</span>
																			</div>
																			<Button
																				variant="ghost"
																				size="icon"
																			>
																				<Download className="h-4 w-4" />
																			</Button>
																		</div>
																	</div>

																	<div className="space-y-2">
																		<div className="flex items-center gap-2 justify-between">
																			<h4 className="text-sm font-medium text-foreground">
																				Response
																				Data
																			</h4>
																			<Button
																				variant="ghost"
																				size="sm"
																				className="h-6 px-2"
																			>
																				<Maximize2 className="h-3 w-3" />
																			</Button>
																		</div>
																		<Textarea
																			className="text-xs text-muted-foreground overflow-x-auto px-2"
																			rows={
																				4
																			}
																		>
																			{`lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.`}
																		</Textarea>
																	</div>
																</div>
															</AccordionContent>
														</AccordionItem>
													)
												)}
											</Accordion>
										</div>
									</ScrollArea>
								</TabsContent>

								<TabsContent
									value="logs"
									className="h-full m-0 px-4 pb-4"
								>
										<div className="h-full bg-slate-950 rounded-lg border border-slate-800 shadow-lg ">
											<div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-900/50 rounded-t-lg">
												<div className="flex items-center gap-2">
													<div className="flex gap-1">
														<div className="w-2 h-2 rounded-full bg-red-500"></div>
														<div className="w-2 h-2 rounded-full bg-yellow-500"></div>
														<div className="w-2 h-2 rounded-full bg-green-500"></div>
													</div>
													<span className="text-xs font-medium text-slate-400">
														Console Output
													</span>
												</div>
												<span className="text-xs text-slate-500">
													{logs.length} entries
												</span>
											</div>

											<ScrollArea className="h-[calc(100%-2.5rem)]">
												<div className="px-3 space-y-1">
													{logs.length === 0 ? (
														<div className="flex items-center gap-2 text-slate-500 text-xs">
															<Info className="h-3 w-3" />
															<span>
																No logs
																available
															</span>
														</div>
													) : (
														logs.map((log, i) => (
															<div
																key={i}
																className="flex items-start gap-2 py-1 group hover:bg-slate-900/30 rounded px-2 -mx-2 transition-colors"
															>
																<div className="flex-shrink-0 mt-1">
																	{getLogIcon(
																		log
																	)}
																</div>
																<div className="flex-1 min-w-0">
																	<span
																		className={`text-xs font-mono leading-relaxed ${getLogColor(
																			log
																		)} whitespace-pre-wrap break-words flex items-center`}
																	>
																		{cleanLogMessage(
																			log
																		)}
																	</span>
																</div>
																<span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
																	{String(
																		i + 1
																	).padStart(
																		2,
																		"0"
																	)}
																</span>
															</div>
														))
													)}
												</div>
											</ScrollArea>
										</div>
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
