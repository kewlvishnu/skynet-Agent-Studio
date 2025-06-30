import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Terminal } from "lucide-react";

interface NavigationItem {
	name: string;
	value: string;
	icon: React.ReactNode;
}

interface TabNavigationProps {
	items?: NavigationItem[];
}

const defaultNavigationItems: NavigationItem[] = [
	{
		name: "Response",
		value: "response",
		icon: <FileText className="h-4 w-4" />,
	},
	{ name: "Logs", value: "logs", icon: <Terminal className="h-4 w-4" /> },
];

export default function TabNavigation({
	items = defaultNavigationItems,
}: TabNavigationProps) {
	return (
		<div className="w-full border-b border-gray relative h-10">
			<TabsList className="w-fit bg-transparent py-0 my-0 absolute left-3 top-[7px] flex items-center gap-x-6">
				{items.map((item) => (
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
	);
}
