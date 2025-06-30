import { Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogItem from "./log-item";

interface LogsPanelProps {
	logs: string[];
}

export default function LogsPanel({ logs }: LogsPanelProps) {
	return (
		<div className="h-full bg-slate-950 rounded-lg border border-slate-800 shadow-lg">
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
							<span>No logs available</span>
						</div>
					) : (
						logs.map((log, i) => (
							<LogItem key={i} log={log} index={i} />
						))
					)}
				</div>
			</ScrollArea>
		</div>
	);
} 