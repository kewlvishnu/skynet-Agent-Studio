import React, { useContext } from "react";
import { Button } from "../ui/button";
import { CONNECT_STATES, Web3Context } from "@/providers/Web3ContextProvider";
import { cn } from "@/lib/utils";

interface AuthButtonProps {
	className?: string;
}

export default function AuthButton({ className }: AuthButtonProps) {
	const web3Context = useContext(Web3Context);

	const truncatedAddress =
		web3Context.status === CONNECT_STATES.CONNECTED
			? `${web3Context.address.slice(0, 6)}...${web3Context.address.slice(
					-4
			  )}`
			: "";

	if (web3Context.status === CONNECT_STATES.CONNECTED) {
		return (
			<Button
				variant="ghost"
				size="sm"
				className="flex items-center gap-2 px-3 py-2 rounded-full bg-none"
			>
				<div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
					<svg
						className="w-3 h-3 text-white"
						fill="currentColor"
						viewBox="0 0 20 20"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
				<span className="text-xs font-medium text-muted-foreground">
					{truncatedAddress}
				</span>
			</Button>
		);
	}

	return (
		<Button
			onClick={() => web3Context.login()}
			disabled={web3Context.status === CONNECT_STATES.CONNECTING}
			variant="default"
			size="sm"
			className={cn(
				"bg-royal-blue hover:bg-royal-blue-hover text-white transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed",
				className
			)}
		>
			{web3Context.status === CONNECT_STATES.CONNECTING ? (
				<div className="flex items-center gap-2">
					<svg
						className="animate-spin h-4 w-4 text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						></circle>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Connecting...
				</div>
			) : (
				"Connect Wallet"
			)}
		</Button>
	);
}
