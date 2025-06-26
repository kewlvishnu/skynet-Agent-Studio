"use client";
import { Bot, LibraryBig, ScrollText, Settings } from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle-simple";
import Image from "next/image";

const navigationItems = [
	{
		icon: Bot,
		name: "Agents",
		url: "/agents",
	},
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
		<Sidebar className="border-gray-800 w-full max-w-48" collapsible="icon">
			<SidebarHeader>
					<div className="flex items-center gap-2.5 h-12.5 py-2 px-0.5 w-fit">
						<Image
							src="/logo/logo-light.svg"
							alt="logo"
							width={2000}
							height={2000}
							className="w-10 h-8 hidden group-data-[collapsible=icon]:block"
						/>
						<Image
							src="/logo/full-logo-light.svg"
							alt="logo"
							width={2000}
							height={2000}
							className="w-10/12 ml-2 h-8 block group-data-[collapsible=icon]:hidden"
						/>
					</div>
			</SidebarHeader>

			<SidebarContent>
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
