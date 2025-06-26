import { nodeTypes } from "@/components/nodes";
import {
	GitForkIcon,
	PackageSearchIcon,
	RepeatIcon,
} from "lucide-react";

export type Block = {
	id: number;
	type: keyof typeof nodeTypes;
	title: string;
	description: string;
	icon: React.ElementType;
	color: string;
};

export const blocks: Block[] = [
	// {
	// 	id: 1,
	// 	type: "agent",
	// 	title: "Agent",
	// 	description: "Build an agent",
	// 	icon: BotIcon,
	// 	color: "bg-purple-500",
	// },
	// {
	// 	id: 2,
	// 	type: "api",
	// 	title: "API",
	// 	description: "Use any API",
	// 	icon: UnplugIcon,
	// 	color: "bg-blue-500",
	// },
	{
		id: 3,
		type: "condition",
		title: "Condition",
		description: "Add a condition",
		icon: GitForkIcon,
		color: "bg-orange-500",
	},
	// {
	// 	id: 4,
	// 	type: "function",
	// 	title: "Function",
	// 	description: "Run custom logic",
	// 	icon: Code2Icon,
	// 	color: "bg-red-500",
	// },
	// {
	// 	id: 5,
	// 	type: "router",
	// 	title: "Router",
	// 	description: "Route workflow",
	// 	icon: RouteIcon,
	// 	color: "bg-green-500",
	// },
	// {
	// 	id: 6,
	// 	type: "memory",
	// 	title: "Memory",
	// 	description: "Add memory store",
	// 	icon: BrainIcon,
	// 	color: "bg-pink-500",
	// },
	{
		id: 7,
		type: "knowledge",
		title: "Knowledge",
		description: "Use vector search",
		icon: PackageSearchIcon,
		color: "bg-teal-500",
	},
	// {
	// 	id: 8,
	// 	type: "workflow",
	// 	title: "Workflow",
	// 	description: "Execute another workflow",
	// 	icon: NetworkIcon,
	// 	color: "bg-amber-500",
	// },
	{
		id: 9,
		type: "loop",
		title: "Loop",
		description: "Create a Loop",
		icon: RepeatIcon,
		color: "bg-cyan-500",
	},
	// {
	// 	id: 10,
	// 	type: "parallel",
	// 	title: "Parallel",
	// 	description: "Create a Parallel",
	// 	icon: SplitIcon,
	// 	color: "bg-yellow-500",
	// },
];
