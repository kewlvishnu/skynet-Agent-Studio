import {
	CheckCircle,
	Folder,
	Info,
	Link,
	Loader2,
	Upload,
	XCircle,
	Zap,
} from "lucide-react";

interface LogItemProps {
	log: string;
	index: number;
}

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

export default function LogItem({ log, index }: LogItemProps) {
	return (
		<div className="flex items-start gap-2 py-1 group hover:bg-slate-900/30 rounded px-2 -mx-2 transition-colors">
			<div className="flex-shrink-0 mt-1">{getLogIcon(log)}</div>
			<div className="flex-1 min-w-0">
				<span
					className={`text-xs font-mono leading-relaxed ${getLogColor(
						log
					)} whitespace-pre-wrap break-words flex items-center`}
				>
					{cleanLogMessage(log)}
				</span>
			</div>
			<span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
				{String(index + 1).padStart(2, "0")}
			</span>
		</div>
	);
}
