import React, { useState } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import AuthButton from "../common/auth-button";

interface NavbarProps {
	className?: string;
}

export default function Navbar({ className }: NavbarProps) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const navigationItems = [
		{ name: "Ecosystem", href: "#ecosystem" },
		{ name: "Add tools", href: "#add-tools" },
		{ name: "Build", href: "#build" },
		{ name: "Developer Grants", href: "#developer-grants" },
		{ name: "Blogs/News", href: "#blogs-news" },
	];

	return (
		<div className="flex w-full max-w-7xl mx-auto h-16 bg-bg">
			<div className="-mr-[1px]">
				<svg
					width="57"
					height="54"
					viewBox="0 0 57 54"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M0.367188 0.567871H56.092V53.5917C50.3839 12.48 21.1423 3.60023 0.367188 0.567871Z"
						fill="white"
					/>
				</svg>
			</div>
			<nav
				className={cn(
					"flex items-center justify-between p-4 bg-white w-full rounded-b-lg",
					className
				)}
			>
				<div className="flex items-center gap-6 ">
					<div className="flex items-center gap-2">
						<Image
							src="/logo/full-logo-light.svg"
							alt="Skynet logo"
							width={1000}
							height={1000}
							className="w-auto h-6 dark:hidden"
						/>
						<Image
							src="/logo/full-logo-dark.svg"
							alt="Skynet logo"
							width={1000}
							height={1000}
							className="w-auto h-6 hidden dark:block"
						/>
					</div>
				</div>

				{/* Navigation Items - Hidden on mobile */}
				<div className="hidden md:flex items-center gap-6">
					{navigationItems.map((item) => (
						<a
							key={item.name}
							href={item.href}
							className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
						>
							{item.name}
						</a>
					))}
				</div>

				{/* Right Side - Actions */}
				<div className="flex items-center gap-3">
					{/* Auth Button */}
					<div className="hidden sm:block w-auto">
						<AuthButton />
					</div>

					{/* Mobile Menu Toggle */}
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						aria-label="Toggle mobile menu"
					>
						<svg
							className="h-5 w-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							{isMobileMenuOpen ? (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							) : (
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 6h16M4 12h16M4 18h16"
								/>
							)}
						</svg>
					</Button>
				</div>
			</nav>
			<div className="-ml-[1px]">
				<svg
					width="57"
					height="54"
					viewBox="0 0 57 54"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M56.0938 0.567871H0.368935V53.5917C6.07703 12.48 35.3186 3.60023 56.0938 0.567871Z"
						fill="white"
					/>
				</svg>
			</div>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden bg-background border-b border-border">
					<div className="px-4 py-3 space-y-3">
						{navigationItems.map((item) => (
							<a
								key={item.name}
								href={item.href}
								className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								{item.name}
							</a>
						))}
						<div className="pt-3 space-y-2 border-t border-border">
							<Button
								variant="default"
								size="sm"
								className="w-full bg-royal-blue hover:bg-royal-blue-hover text-white"
							>
								Get Started
							</Button>
							<AuthButton className="w-full" />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
