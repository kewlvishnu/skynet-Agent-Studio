"use client";
import { AppSidebar } from "@/components/sidebar/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AuthButton from "@/components/common/auth-button";
import { CONNECT_STATES, Web3Context } from "@/providers/Web3ContextProvider";
import React, { useContext } from "react";
import Navbar from "@/components/sidebar/navbar";
import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
	const web3Context = useContext(Web3Context);

	return (
		<SidebarProvider
			defaultOpen={false}
			className="flex h-screen overflow-hidden bg-background text-foreground"
		>
			{web3Context.status === CONNECT_STATES.CONNECTED ? (
				<>
					<div className="flex w-fit max-w-48">
						<AppSidebar />
					</div>
					<>{children}</>
				</>
			) : (
				<div className="flex flex-col w-full h-full items-center justify-center">
					<Navbar />
					<div className="flex flex-col gap-4 w-full h-full items-center justify-center -mt-16">
						<Image
							src="https://illustrations.popsy.co/blue/surreal-flying-bulbs.svg"
							alt="Skynet logo"
							width={1000}
							height={1000}
							className="w-auto h-60 dark:invert"
						/>
						<AuthButton className="w-full h-10 max-w-40" />
					</div>
				</div>
			)}
		</SidebarProvider>
	);
}
