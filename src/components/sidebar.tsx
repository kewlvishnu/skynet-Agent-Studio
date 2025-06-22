import { Bot, LibraryBig, Plus, ScrollText, Settings } from "lucide-react";
import React from "react";

export default function sidebar() {
	return (
		<aside className="w-64 h-full border-r border-gray-800">
			<div className="flex flex-col gap-8 py-4 px-3">
				<div className="w-full flex items-center gap-2.5">
					<div className="size-6 rounded bg-purple-800 flex items-center justify-center">
						<Bot className="size-5" />
					</div>
					<h1 className="truncate max-w-[120px] text-sm font-medium">
						Chandra Bose
					</h1>
				</div>
				<div className="w-full flex flex-col items-center gap-2.5">
					<div className="flex items-center gap-2.5 justify-between w-full">
						<h3 className="text-sm text-gray-400 font-medium">
							Workflows
						</h3>
						<Plus className="size-4" />
					</div>
					<div className="flex flex-col w-full gap-2">
						{[
							{ color: "bg-pink-500", name: "Workflow 1" },
							{ color: "bg-blue-500", name: "Workflow 2" },
						].map((item, index) => (
							<div
								key={index}
								className="flex items-center gap-2.5 w-full rounded-md p-2 px-3 bg-gray-500/20"
							>
								<div
									className={`size-4 ${item.color} rounded`}
								/>
								<h4 className="text-sm font-medium">
									{item.name}
								</h4>
							</div>
						))}
					</div>
				</div>
				<div className="flex flex-col items-center gap-3 justify-between w-full text-gray-400">
					{[
						{
							icon: <ScrollText className="w-4" />,
							name: "Logs",
						},
						{
							icon: <LibraryBig className="w-4" />,
							name: "Knowledge",
						},
						{
							icon: <Settings className="w-4" />,
							name: "Settings",
						},
					].map((item, index) => (
						<div
							key={index}
							className="flex items-center gap-2.5 w-full"
						>
							{item.icon}
							<h4 className="text-sm font-medium">{item.name}</h4>
						</div>
					))}
				</div>
			</div>
		</aside>
	);
}
