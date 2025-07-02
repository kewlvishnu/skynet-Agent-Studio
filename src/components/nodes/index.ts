import AgentNode from "./blocks/agent";
import AgentContainer from "./blocks/agent-container";
import LoopContainer from "./blocks/loop-container";
import ApiNode from "./blocks/api";
import ConditionNode from "./blocks/condition";
import FunctionNode from "./blocks/function";
import RouterNode from "./blocks/router";
import MemoryNode from "./blocks/memory";
import KnowledgeNode from "./blocks/knowledge";
import WorkflowNode from "./blocks/workflow";
import LoopNode from "./blocks/loop";
import ParallelNode from "./blocks/parallel";
import StartNode from "./blocks/start";
import ToolNode from "./blocks/tool";

export const nodeTypes = {
	start: StartNode,
	agent: AgentNode,
	agentContainer: AgentContainer,
	loopContainer: LoopContainer,
	api: ApiNode,
	condition: ConditionNode,
	function: FunctionNode,
	router: RouterNode,
	memory: MemoryNode,
	knowledge: KnowledgeNode,
	workflow: WorkflowNode,
	loop: LoopNode,
	parallel: ParallelNode,
	tool: ToolNode,
};
