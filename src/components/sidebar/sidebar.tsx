"use client";
import { Bot, LibraryBig, Plus, ScrollText, Settings } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle-simple";

const workflows = [
	{ color: "bg-pink-500", name: "Workflow 1" },
	{ color: "bg-blue-500", name: "Workflow 2" },
];

const navigationItems = [
	{
		icon: ScrollText,
		name: "Logs",
		url: "#",
	},
	{
		icon: LibraryBig,
		name: "Knowledge",
		url: "#",
	},
	{
		icon: Settings,
		name: "Settings",
		url: "#",
	},
];

export function AppSidebar() {
	return (
		<Sidebar className="border-gray-800" collapsible="icon">
			<SidebarHeader>
				<div className="flex items-center gap-2.5 px-2">
					<div className="size-6 rounded bg-purple-800 flex items-center justify-center">
						<Bot className="size-5 text-white" />
					</div>
					<h1 className="truncate max-w-[120px] text-sm font-medium text-sidebar-foreground">
						Chandra Bose
					</h1>
				</div>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup className="group-data-[collapsible=icon]:hidden">
					<div className="flex items-center justify-between">
						<SidebarGroupLabel className="text-sidebar-foreground/70">
							Workflows
						</SidebarGroupLabel>
						<SidebarGroupAction>
							<Plus className="size-4" />
							<span className="sr-only">Add Workflow</span>
						</SidebarGroupAction>
					</div>
					<SidebarGroupContent>
						<div className="flex flex-col gap-2">
							{workflows.map((workflow, index) => (
								<div
									key={index}
									className="flex items-center gap-2.5 w-full rounded-none p-2 px-3 bg-sidebar-accent"
								>
									<div
										className={`size-4 ${workflow.color} rounded`}
									/>
									<h4 className="text-sm font-medium text-sidebar-foreground">
										{workflow.name}
									</h4>
								</div>
							))}
						</div>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.name}>
									<SidebarMenuButton
										asChild
										className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
										tooltip={item.name}
									>
										<a href={item.url}>
											<item.icon className="w-4 h-4" />
											<span>{item.name}</span>
										</a>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<div className="flex items-center justify-between p-2 group-data-[collapsible=icon]:hidden">
					<SidebarTrigger />
					<ThemeToggleSimple />
				</div>
				<div className="hidden group-data-[collapsible=icon]:flex flex-col-reverse items-center gap-2 p-2">
					<SidebarTrigger />
					<ThemeToggleSimple />
				</div>
			</SidebarFooter>
		</Sidebar>
	);
}
