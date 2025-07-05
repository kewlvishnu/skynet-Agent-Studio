"use client";
import { useEffect, useRef, useState, useCallback, useContext } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
	PromptInputSection,
	TabNavigation,
	LogsPanel,
} from "./test-flow-components";
import { MoveHorizontal, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { AgentTestStatus, Subnet } from "@/types/workflow";
import { AppCryptoContext } from "@/providers/AppCryptoProvider";
import { Web3Context, isConnectedState } from "@/providers/Web3ContextProvider";
import { useWeb3Auth } from "@/providers/Web3AuthProvider";
import {
	fetchNfts,
	fetchUserNfts,
	mintSkynetNFT,
	getNftId,
	getAuthWithRetry,
	logAPICall,
	validateAPIPayload,
} from "@/utils/skynetHelper";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import { useExecutionStatus } from "@/providers/ExecutionStatusProvider";
import { normalizeWorkflowItemIDs } from "@/utils/workflowNormalizer";
import { useUnifiedWorkflowManager } from "@/hooks/use-unified-workflow-manager";
import {
	calculateWorkflowProgress,
	generateWorkflowItems,
} from "@/utils/workflow-helpers";
import { Skeleton } from "@/components/ui/skeleton";
import {
	STATUS,
	TEXT,
	SOCKET_CONFIG,
	VALIDATION,
	UI_CONFIG,
} from "@/config/constants";
import { ResponsePanel } from "./test-flow-components/response-panel";
import {
	clearStoredOutputs,
	getStoredOutput,
} from "@/utils/normalizeWorkflowResponse";

const getImageSrc = (data: string, contentType: string): string => {
	if (data.startsWith("data:")) {
		return data;
	}

	if (contentType.startsWith("image/")) {
		return `data:${contentType};base64,${data}`;
	}

	return `data:${contentType};base64,${data}`;
};

interface RightWorkspaceSidebarProps {
	onWidthChange?: (width: number) => void;
	selectedAgents?: {
		[id: string]: {
			id: string;
			agentName: string;
			subnets: Subnet[];
		};
	};
	edges?: any[];
}

export default function RightWorkspaceSidebar({
	onWidthChange,
	selectedAgents,
	edges,
}: RightWorkspaceSidebarProps) {
	const { open, state, setOpen, toggleSidebar } = useSidebar();
	const [prompt, setPrompt] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [testStatus, setTestStatus] = useState<AgentTestStatus>({
		isRunning: false,
		status: STATUS.IDLE,
		progress: 0,
		logs: [],
	});
	const workflowManager = useUnifiedWorkflowManager();
	const socketRef = useRef<Socket | null>(null);
	const {
		executionStatus,
		updateExecutionStatus,
		resetExecutionStatus,
		stopExecution,
	} = useExecutionStatus();
	const sidebarRef = useRef<HTMLDivElement>(null);
	const [sidebarWidth, setSidebarWidth] = useState<number>(
		UI_CONFIG.SIDEBAR.DEFAULT_WIDTH
	);
	const [isResizing, setIsResizing] = useState(false);
	const resizeRef = useRef<HTMLDivElement>(null);
	const startXRef = useRef<number>(0);
	const startWidthRef = useRef<number>(UI_CONFIG.SIDEBAR.DEFAULT_WIDTH);

	const [nfts, setNfts] = useState<number[]>([]);
	const [selectedNft, setSelectedNft] = useState<string | null>(null);
	const [isMinting, setIsMinting] = useState(false);
	const [showInsufficientFundsModal, setShowInsufficientFundsModal] =
		useState(false);

	const { skyBrowser } = useContext(AppCryptoContext);
	const web3Context = useContext(Web3Context);
	const { provider, web3Auth } = useWeb3Auth();

	const minWidth = UI_CONFIG.SIDEBAR.MIN_WIDTH;
	const maxWidth = UI_CONFIG.SIDEBAR.MAX_WIDTH;

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			if (!isResizing) return;

			const deltaX = startXRef.current - e.clientX;
			const newWidth = startWidthRef.current + deltaX;
			const clampedWidth = Math.min(
				Math.max(newWidth, minWidth),
				maxWidth
			);

			setSidebarWidth(clampedWidth);
			onWidthChange?.(open === false ? 0 : clampedWidth);
		},
		[isResizing, onWidthChange, open, minWidth, maxWidth]
	);

	const handleMouseUp = useCallback(() => {
		setIsResizing(false);
		document.body.style.userSelect = "";
		document.body.style.cursor = "";
	}, []);

	useEffect(() => {
		if (isResizing) {
			document.body.style.userSelect = "none";
			document.body.style.cursor = "col-resize";
			document.addEventListener("mousemove", handleMouseMove, {
				passive: false,
			});
			document.addEventListener("mouseup", handleMouseUp, {
				passive: false,
			});
		}

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isResizing, handleMouseMove, handleMouseUp]);

	useEffect(() => {
		onWidthChange?.(open ? sidebarWidth : 0);
	}, [open, sidebarWidth, onWidthChange]);

	useEffect(() => {
		const hasAgents =
			selectedAgents && Object.keys(selectedAgents).length > 0;
		if (!hasAgents) {
			setOpen(false);
		} else {
			setOpen(true);
		}
	}, [selectedAgents, setOpen]);

	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			startXRef.current = e.clientX;
			startWidthRef.current = sidebarWidth;
			setIsResizing(true);
		},
		[sidebarWidth]
	);

	useEffect(() => {
		if (skyBrowser && isConnectedState(web3Context)) {
			const fetchNFTList = async () => {
				try {
					const nftList = await fetchNfts(
						skyBrowser.contractService.selectedAccount,
						skyBrowser
					);
					const nftNumbers = nftList.map((nft: string) =>
						parseInt(nft)
					);
					setNfts(nftNumbers);
					const storedNftId = localStorage.getItem(
						`selectedNftId-${web3Context.address}`
					);
					if (
						storedNftId &&
						nftNumbers.includes(parseInt(storedNftId))
					) {
						setSelectedNft(storedNftId);
					} else if (nftNumbers.length > 0) {
						setSelectedNft(nftNumbers[0].toString());
					}
				} catch (error) {
					console.error("Error fetching NFTs:", error);
				}
			};
			fetchNFTList();
		}
	}, [skyBrowser, web3Context]);

	useEffect(() => {
		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
			}
		};
	}, []);
	const handleMintNFT = async () => {
		if (!skyBrowser || !isConnectedState(web3Context) || !web3Auth) {
			toast.error("Please connect your wallet first");
			return;
		}

		setIsMinting(true);
		try {
			const mintResult = await mintSkynetNFT(
				skyBrowser,
				web3Context.address,
				web3Auth
			);

			if (mintResult.success && mintResult.nftId) {
				toast.success(`NFT #${mintResult.nftId} minted successfully!`);

				const updatedNfts = await fetchNfts(
					skyBrowser.contractService.selectedAccount,
					skyBrowser
				);
				const nftNumbers = updatedNfts.map((nft: string) =>
					parseInt(nft)
				);
				setNfts(nftNumbers);
				setSelectedNft(mintResult.nftId);
				setShowInsufficientFundsModal(false);
			} else {
				toast.error(mintResult.error || "Failed to mint NFT");
			}
		} catch (error) {
			console.error("Error minting NFT:", error);
			toast.error("Failed to mint NFT");
		} finally {
			setIsMinting(false);
		}
	};

	const analyzeAgentConnections = (edges: any[], agents: any) => {
		const connections: { from: string; to: string }[] = [];

		edges.forEach((edge) => {
			let sourceAgent: string | undefined;
			let targetAgent: string | undefined;

			if (
				edge.source?.includes("agent-container") &&
				edge.target?.includes("agent-container")
			) {
				sourceAgent = edge.source;
				targetAgent = edge.target;
			} else {
				Object.keys(agents).forEach((agentId) => {
					const agent = agents[agentId];

					if (
						agent.subnets.some((subnet: any) => {
							const nodeId = `tool-${subnet.itemID}-`;
							return (
								edge.source?.includes(nodeId) ||
								edge.source?.includes(agentId)
							);
						})
					) {
						sourceAgent = agentId;
					}

					if (
						agent.subnets.some((subnet: any) => {
							const nodeId = `tool-${subnet.itemID}-`;
							return (
								edge.target?.includes(nodeId) ||
								edge.target?.includes(agentId)
							);
						})
					) {
						targetAgent = agentId;
					}
				});
			}

			if (sourceAgent && targetAgent && sourceAgent !== targetAgent) {
				connections.push({ from: sourceAgent, to: targetAgent });
				console.log(
					`Found connection: ${sourceAgent} -> ${targetAgent}`
				);
			}
		});

		return connections;
	};

	const reorderSubnetsByConnections = (
		subnets: any[],
		connections: any[],
		agentMapping: any
	) => {
		if (connections.length === 0) {
			return subnets;
		}

		const agentDependencies: { [agentId: string]: string[] } = {};
		Object.keys(selectedAgents || {}).forEach((agentId) => {
			agentDependencies[agentId] = [];
		});

		connections.forEach((conn) => {
			if (!agentDependencies[conn.to]) {
				agentDependencies[conn.to] = [];
			}
			agentDependencies[conn.to].push(conn.from);
		});

		const visited = new Set<string>();
		const temp = new Set<string>();
		const agentOrder: string[] = [];

		const visit = (agentId: string) => {
			if (temp.has(agentId)) {
				throw new Error(TEXT.ERRORS.CIRCULAR_DEPENDENCY);
			}
			if (visited.has(agentId)) return;

			temp.add(agentId);

			agentDependencies[agentId]?.forEach((dep) => {
				visit(dep);
			});

			temp.delete(agentId);
			visited.add(agentId);
			agentOrder.push(agentId);
		};

		Object.keys(agentDependencies).forEach((agentId) => {
			if (!visited.has(agentId)) {
				visit(agentId);
			}
		});

		const orderedSubnets: any[] = [];
		console.log("Agent order from topological sort:", agentOrder);
		agentOrder.forEach((agentId) => {
			const agentSubnets = subnets.filter(
				(subnet) => subnet.agentId === agentId
			);
			console.log(
				`Adding subnets for agent ${agentId}:`,
				agentSubnets.map((s) => s.subnetName)
			);
			orderedSubnets.push(...agentSubnets);
		});

		const remainingSubnets = subnets.filter((subnet) => !subnet.agentId);
		if (remainingSubnets.length > 0) {
			console.log(
				"Adding remaining subnets without agentId:",
				remainingSubnets.map((s) => s.subnetName)
			);
		}
		orderedSubnets.push(...remainingSubnets);

		console.log(
			"Final ordered subnets:",
			orderedSubnets.map((s) => ({
				agentId: s.agentId,
				subnetName: s.subnetName,
				itemID: s.itemID,
			}))
		);
		return orderedSubnets;
	};

	const handleRunTest = async (prompt: string) => {
		if (!selectedAgents || Object.keys(selectedAgents).length === 0) {
			toast.error(TEXT.PLEASE_SELECT_AGENT);
			return;
		}

		if (!skyBrowser || !isConnectedState(web3Context)) {
			toast.error(TEXT.PLEASE_CONNECT_WALLET);
			return;
		}

		if (!prompt.trim()) {
			toast.error(TEXT.PLEASE_ENTER_PROMPT);
			return;
		}

		setPrompt(prompt);
		setIsSubmitted(true);

		if (socketRef.current && socketRef.current.connected) {
			socketRef.current.disconnect();
			socketRef.current = null;
		}

		resetExecutionStatus();
		workflowManager.reset();

		let nftId: string | null = null;
		if (selectedNft) {
			try {
				const nftOwner =
					await skyBrowser.contractService.AgentNFT.ownerOf(
						selectedNft
					);
				if (
					nftOwner.toLowerCase() === web3Context.address.toLowerCase()
				) {
					nftId = selectedNft;
					console.log("Using previously selected NFT:", nftId);
				} else {
					console.log(
						"Previously selected NFT is no longer owned by user, will select new one"
					);
					setSelectedNft(null);
				}
			} catch (error) {
				console.warn(
					"Error verifying selected NFT, will select new one:",
					error
				);
				setSelectedNft(null);
			}
		}

		if (!nftId) {
			console.log("No valid NFT selected, attempting to get one...");
			const _selectedNft: string | false = await getNftId(
				fetchUserNfts,
				web3Context,
				nfts,
				skyBrowser!
			);
			if (!_selectedNft) {
				setShowInsufficientFundsModal(true);
				return;
			}
			setSelectedNft(_selectedNft);
			nftId = _selectedNft;
			console.log("Selected new NFT:", nftId);
		}

		setTestStatus({
			isRunning: true,
			status: STATUS.INITIALIZING,
			progress: 0,
			message: "Initializing test run...",
			logs: [TEXT.CONNECTING_TO_SKYNET],
		});

		try {
			console.log("Getting authentication with retry logic...");
			const signature = await getAuthWithRetry(skyBrowser, 3);
			if (!signature.data) {
				throw new Error(TEXT.ERRORS.AUTH_MISSING_DATA);
			}

			const authData = signature.data;
			if (
				!authData.userAddress ||
				!authData.signature ||
				!authData.message
			) {
				console.error("Invalid auth payload structure:", authData);
				throw new Error(
					`${TEXT.ERRORS.INVALID_AUTH_PAYLOAD}. Missing: ${
						!authData.userAddress ? "userAddress " : ""
					}${!authData.signature ? "signature " : ""}${
						!authData.message ? "message" : ""
					}`
				);
			}

			console.log("Validated auth payload:", {
				userAddress: authData.userAddress,
				hasSignature: !!authData.signature,
				hasMessage: !!authData.message,
				messageLength: authData.message?.length,
			});

			const allSubnets: any[] = [];
			let itemIdOffset = 0;
			const agentSubnetMapping: {
				[agentId: string]: { [originalItemId: number]: number };
			} = {};

			Object.entries(selectedAgents).forEach(([agentId, agent]) => {
				console.log(
					`Processing agent: ${agent.agentName} with ${agent.subnets.length} subnets`
				);
				agentSubnetMapping[agentId] = {};

				agent.subnets.forEach((subnet: any) => {
					const originalItemId = subnet.itemID || 0;
					const adjustedItemId = originalItemId + itemIdOffset;

					agentSubnetMapping[agentId][originalItemId] =
						adjustedItemId;

					const adjustedSubnet = {
						...subnet,
						itemID: adjustedItemId,
						originalItemID: originalItemId,
						agentId: agentId,
					};
					allSubnets.push(adjustedSubnet);
				});

				const maxItemId = Math.max(
					...agent.subnets.map((s: any) => s.itemID || 0)
				);
				itemIdOffset += maxItemId + 100;
			});

			const agentConnections = analyzeAgentConnections(
				edges || [],
				selectedAgents
			);
			console.log("Agent connections:", agentConnections);
			console.log("Edges:", edges);
			console.log("Selected agents:", Object.keys(selectedAgents || {}));

			const orderedSubnets = reorderSubnetsByConnections(
				allSubnets,
				agentConnections,
				agentSubnetMapping
			);

			const agentIds = Object.keys(selectedAgents);
			console.log("Agent IDs from selectedAgents:", agentIds);

			const itemIdMappings = new Map();

			Object.entries(selectedAgents).forEach(([agentId, agent]) => {
				const agentSubnets = orderedSubnets.filter(
					(s) => s.agentId === agentId
				);
				agentSubnets.forEach((subnet, index) => {
					const originalItemId =
						subnet.originalItemID || subnet.itemID;
					itemIdMappings.set(
						`${agentId}-${originalItemId}`,
						subnet.itemID
					);
				});
			});

			console.log("ItemID mappings:", itemIdMappings);

			orderedSubnets.forEach((subnet) => {
				if (subnet.inputItemID && subnet.inputItemID.length > 0) {
					const originalInputIds = [...subnet.inputItemID];

					subnet.inputItemID = originalInputIds.map((inputId) => {
						const sameAgentSubnet = orderedSubnets.find(
							(s) =>
								s.agentId === subnet.agentId &&
								(s.originalItemID === inputId ||
									s.itemID === inputId)
						);

						if (sameAgentSubnet) {
							return sameAgentSubnet.itemID;
						}

						return inputId;
					});

					console.log(
						`Remapped ${subnet.subnetName} inputItemID: ${originalInputIds} → ${subnet.inputItemID}`
					);
				}
			});

			for (let i = 1; i < agentIds.length; i++) {
				const prevAgentId = agentIds[i - 1];
				const currAgentId = agentIds[i];

				const prevAgentSubnets = orderedSubnets.filter(
					(s) => s.agentId === prevAgentId
				);
				const currAgentSubnets = orderedSubnets.filter(
					(s) => s.agentId === currAgentId
				);

				const lastSubnetOfPrevAgent =
					prevAgentSubnets[prevAgentSubnets.length - 1];
				const firstSubnetOfCurrAgent = currAgentSubnets[0];

				console.log(`Chaining agents: ${prevAgentId} → ${currAgentId}`);
				console.log(
					`Last subnet of prev agent: ${lastSubnetOfPrevAgent?.subnetName} (itemID: ${lastSubnetOfPrevAgent?.itemID})`
				);
				console.log(
					`First subnet of curr agent: ${firstSubnetOfCurrAgent?.subnetName} (itemID: ${firstSubnetOfCurrAgent?.itemID})`
				);

				if (lastSubnetOfPrevAgent && firstSubnetOfCurrAgent) {
					const existingInputs =
						firstSubnetOfCurrAgent.inputItemID || [];

					if (existingInputs.length === 0) {
						firstSubnetOfCurrAgent.inputItemID = [
							lastSubnetOfPrevAgent.itemID,
						];
						console.log(
							`✓ Connected: ${lastSubnetOfPrevAgent.subnetName} (${lastSubnetOfPrevAgent.itemID}) → ${firstSubnetOfCurrAgent.subnetName} (${firstSubnetOfCurrAgent.itemID})`
						);
					} else {
						console.log(
							`ℹ First subnet ${
								firstSubnetOfCurrAgent.subnetName
							} already has dependencies: [${existingInputs.join(
								", "
							)}] - keeping as is`
						);
					}
				}
			}

			console.log("Final workflow after correct agent chaining:");
			agentIds.forEach((agentId, index) => {
				const agentSubnets = orderedSubnets.filter(
					(s) => s.agentId === agentId
				);
				console.log(`Agent ${index + 1} (${agentId}):`);
				agentSubnets.forEach((subnet) => {
					console.log(
						`  - ${subnet.subnetName} (itemID: ${
							subnet.itemID
						}): inputItemID = [${
							subnet.inputItemID?.join(", ") || ""
						}]`
					);
				});
			});

			console.log(
				"Combined subnets from all agents (ordered):",
				orderedSubnets
			);
			console.log("Agent subnet mapping:", agentSubnetMapping);
			const validatedSubnets = orderedSubnets.map((subnet: any) => {
				const cleanedSubnet = { ...subnet };

				if (!cleanedSubnet.itemID) {
					console.warn(`Subnet missing itemID:`, cleanedSubnet);
				}

				if (!cleanedSubnet.subnetName) {
					console.warn(`Subnet missing subnetName:`, cleanedSubnet);
				}

				if (cleanedSubnet.subnetURL) {
					if (typeof cleanedSubnet.subnetURL === "string") {
						let url = cleanedSubnet.subnetURL.trim();

						url = url.replace(/\s+/g, "");

						if (
							url &&
							!url.startsWith("http://") &&
							!url.startsWith("https://")
						) {
							if (url.includes(".") && !url.includes(" ")) {
								url = "https://" + url;
							}
						}

						try {
							new URL(url);
							cleanedSubnet.subnetURL = url;
						} catch (e) {
							console.warn(
								`Invalid subnetURL for ${cleanedSubnet.subnetName}:`,
								cleanedSubnet.subnetURL,
								"-> setting to empty string"
							);
							cleanedSubnet.subnetURL = "";
						}
					} else {
						console.warn(
							`subnetURL is not a string for ${cleanedSubnet.subnetName}:`,
							typeof cleanedSubnet.subnetURL
						);
						cleanedSubnet.subnetURL = "";
					}
				}

				["subnet_url"].forEach((field) => {
					if (
						cleanedSubnet[field] &&
						typeof cleanedSubnet[field] === "string"
					) {
						try {
							new URL(cleanedSubnet[field]);
						} catch (e) {
							console.warn(
								`Invalid ${field} for ${cleanedSubnet.subnetName}:`,
								cleanedSubnet[field]
							);
							cleanedSubnet[field] = "";
						}
					}
				});

				return cleanedSubnet;
			});

			const trimmedPrompt = prompt.trim();
			if (!trimmedPrompt) {
				throw new Error(TEXT.ERRORS.PROMPT_EMPTY);
			}

			if (trimmedPrompt.length > VALIDATION.MAX_PROMPT_LENGTH) {
				throw new Error(TEXT.ERRORS.PROMPT_TOO_LONG);
			}

			if (!nftId) {
				throw new Error(TEXT.ERRORS.NO_NFT_AVAILABLE);
			}

			try {
				const nftOwner =
					await skyBrowser.contractService.AgentNFT.ownerOf(nftId);
				const userAddress = web3Context.address.toLowerCase();

				if (nftOwner.toLowerCase() !== userAddress) {
					console.error(
						`NFT ownership mismatch: NFT ${nftId} is owned by ${nftOwner}, but user is ${userAddress}`
					);
					throw new Error(TEXT.ERRORS.NFT_NOT_OWNED);
				}

				console.log("Using validated NFT ID for testing:", nftId);
			} catch (nftError) {
				console.error("Error verifying NFT ownership:", nftError);
				throw new Error(
					`${TEXT.ERRORS.NFT_VALIDATION_FAILED}: ${
						nftError instanceof Error
							? nftError.message
							: TEXT.UNKNOWN_ERROR
					}`
				);
			}

			const validatedNftId = nftId as string;

			const workflow = validatedSubnets.map(
				(subnet: any, index: number) => {
					const originalInputIds = Array.isArray(subnet.inputItemID)
						? subnet.inputItemID
						: Array.isArray(subnet.input_item_id)
						? subnet.input_item_id
						: [];

					console.log(
						`Processing subnet ${subnet.subnetName} (itemID: ${subnet.itemID}):`,
						{
							originalInputIds,
							subnetInputItemID: subnet.inputItemID,
							subnetInputItemId: subnet.input_item_id,
						}
					);

					const workflowItem = {
						id: subnet.id || `subnet-${index}`,
						tags: subnet.tags || [],
						hints: subnet.hints || [],
						input:
							subnet.expectedInput ||
							subnet.input ||
							"text prompt",
						doubts: subnet.doubts || [],
						itemID:
							subnet.itemID !== undefined ? subnet.itemID : index,
						output:
							subnet.expectedOutput ||
							subnet.output ||
							"processed result",
						prompt:
							subnet.prompt ||
							subnet.promptExample ||
							subnet.prompt_example ||
							"",
						subnetID:
							subnet.subnetID ||
							subnet.unique_id ||
							subnet.id ||
							`subnet-${index}`,
						inputType: subnet.inputType || "text",
						reasoning: subnet.reasoning || "",
						subnetURL: subnet.subnetURL || subnet.subnet_url || "",
						fileUpload: Boolean(
							subnet.fileUpload || subnet.file_upload
						),
						outputType: subnet.outputType || "text",
						subnetName:
							subnet.subnetName ||
							subnet.subnet_name ||
							`Subnet ${index + 1}`,
						description: subnet.description || "",
						inputItemID: (() => {
							const originalInputIds = Array.isArray(
								subnet.inputItemID
							)
								? subnet.inputItemID
								: Array.isArray(subnet.input_item_id)
								? subnet.input_item_id
								: [];

							console.log(
								`Processing inputItemID for ${subnet.subnetName}:`,
								originalInputIds
							);

							return originalInputIds.map((inputId: number) => {
								const correspondingSubnet = orderedSubnets.find(
									(s: any) => s.originalItemID === inputId
								);

								if (correspondingSubnet) {
									console.log(
										`Mapped inputItemID ${inputId} -> ${correspondingSubnet.itemID} (by originalItemID)`
									);
									return correspondingSubnet.itemID;
								}

								const subnetByCurrentId = orderedSubnets.find(
									(s: any) => s.itemID === inputId
								);

								if (subnetByCurrentId) {
									console.log(
										`Mapped inputItemID ${inputId} -> ${subnetByCurrentId.itemID} (by current itemID)`
									);
									return subnetByCurrentId.itemID;
								}

								console.warn(
									`Could not map inputItemID ${inputId} for subnet ${subnet.subnetName} (itemID: ${subnet.itemID})`
								);
								return inputId;
							});
						})(),
						authRequired: Boolean(subnet.authRequired),
						capabilities: subnet.capabilities || [],
						fileDownload: Boolean(
							subnet.fileDownload || subnet.file_download
						),
						systemPrompt:
							subnet.systemPrompt || subnet.system_prompt || "",
						expectedInput: subnet.expectedInput || "",
						promptExample: subnet.promptExample || "",
						expectedOutput: subnet.expectedOutput || "",
						associatedSubnets: subnet.associatedSubnets || [],
					};

					if (!workflowItem.subnetName) {
						console.warn(
							`Workflow item ${index} missing subnetName, using fallback`
						);
					}
					if (!workflowItem.subnetURL) {
						console.warn(
							`Workflow item ${index} (${workflowItem.subnetName}) missing subnetURL`
						);
					}

					console.log(
						`Final workflow item ${workflowItem.subnetName}:`,
						{
							itemID: workflowItem.itemID,
							inputItemID: workflowItem.inputItemID,
							agentId: subnet.agentId,
						}
					);

					return workflowItem;
				}
			);

			if (workflow.length === 0) {
				throw new Error(TEXT.ERRORS.WORKFLOW_EMPTY);
			}

			console.log(
				"Workflow before normalization:",
				workflow.map((w) => ({
					subnetName: w.subnetName,
					itemID: w.itemID,
					inputItemID: w.inputItemID,
				}))
			);

			const normalizedWorkflow = normalizeWorkflowItemIDs([...workflow]);

			const payload = {
				prompt: trimmedPrompt,
				userAuthPayload: signature.data,
				accountNFT: {
					collectionID: "0",
					nftID: validatedNftId,
				},
				workflow: normalizedWorkflow,
			};

			logAPICall("Skynet User Agent Socket", payload, null, null);

			console.log("Sending payload to socket:", {
				prompt: trimmedPrompt,
				userAuthPayload: signature.data,
				accountNFT: {
					collectionID: "0",
					nftID: validatedNftId,
				},
				workflow: normalizedWorkflow,
			});

			if (socketRef.current) {
				socketRef.current.disconnect();
			}

			socketRef.current = io(SOCKET_CONFIG.URL, {
				transports: ["websocket"],
				timeout: SOCKET_CONFIG.TIMEOUT,
				reconnection: SOCKET_CONFIG.RECONNECTION,
				reconnectionAttempts: SOCKET_CONFIG.RECONNECTION_ATTEMPTS,
				reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
			});

			socketRef.current.on(STATUS.SOCKET_EVENTS.ERROR, (error) => {
				console.error("Socket connection error:", error);
				workflowManager.markError();
				setTestStatus((prev) => ({
					...prev,
					status: STATUS.FAILED,
					isRunning: false,
					message: TEXT.ERRORS.CONNECTION_FAILED,
					logs: [...(prev.logs || []), TEXT.CONNECTION_FAILED],
				}));
			});

			socketRef.current.on(STATUS.SOCKET_EVENTS.CONNECT, () => {
				setTestStatus((prev) => ({
					...prev,
					logs: [...(prev.logs || []), TEXT.CONNECTED_TO_SKYNET],
				}));

				console.log("Emitting process-request event with payload");
				socketRef.current?.emit(
					STATUS.SOCKET_EVENTS.PROCESS_REQUEST,
					payload
				);

				setTestStatus((prev) => ({
					...prev,
					logs: [
						...(prev.logs || []),
						TEXT.SENT_TEST_REQUEST,
						TEXT.LOGS.WORKFLOW_CONTAINS(normalizedWorkflow.length),
						TEXT.LOGS.USING_NFT(validatedNftId),
					],
				}));
			});

			clearStoredOutputs();

			socketRef.current.on(STATUS.SOCKET_EVENTS.STATUS, (data) => {
				console.log("Received status update:", data);

				const normalizedResponse = workflowManager.updateResponse(data);

				let statusData = data;
				if (
					Array.isArray(data) &&
					data.length > 1 &&
					data[0] === STATUS.SOCKET_EVENTS.STATUS
				) {
					statusData = data[1];
				}

				const statusValue = statusData?.status || STATUS.UNKNOWN;
				const subnet = statusData?.subnet || STATUS.UNKNOWN;
				const itemID = statusData?.itemID || STATUS.UNKNOWN;

				const subnetInfo = normalizedWorkflow.find((s: any) => {
					return (
						s.itemID?.toString() === itemID?.toString() ||
						s.subnetName === subnet ||
						s.id === itemID?.toString()
					);
				});

				const subnetName = subnetInfo
					? subnetInfo.subnetName
					: typeof subnet === "object"
					? subnet.subnetName || STATUS.UNKNOWN_SUBNET
					: subnet;

				console.log(
					`Status: ${statusValue} | Subnet: ${subnetName} | ItemID: ${itemID}`
				);

				if (statusValue === STATUS.STARTING && subnetInfo) {
					const hasInputItemID =
						subnetInfo.inputItemID &&
						subnetInfo.inputItemID.length > 0;

					if (hasInputItemID) {
						const inputItemID = subnetInfo.inputItemID[0];
						const previousOutput = getStoredOutput(inputItemID);

						if (previousOutput) {
							console.log(
								`Chaining: Passing output from itemID ${inputItemID} to ${subnetName}`
							);
							console.log(
								`Previous output (first 200 chars): ${previousOutput.substring(
									0,
									200
								)}...`
							);

							socketRef.current?.emit("chain-data", {
								targetItemID: itemID,
								sourceItemID: inputItemID,
								chainedData: previousOutput,
							});
						} else {
							console.warn(
								`No stored output found for inputItemID ${inputItemID}`
							);
						}
					}
				}

				if (statusValue === STATUS.STARTING) {
					updateExecutionStatus({
						isRunning: true,
						currentSubnet: subnetName,
						subnetStatuses: {
							...executionStatus.subnetStatuses,
							[String(itemID)]: STATUS.PROCESSING,
						},
					});

					if (
						subnetName &&
						itemID &&
						subnetName !== STATUS.UNKNOWN &&
						itemID !== STATUS.UNKNOWN
					) {
						setTestStatus((prev) => ({
							...prev,
							status: STATUS.INITIALIZING,
							progress: 10,
							message: "Starting subnet processing...",
							logs: [
								...(prev.logs || []),
								TEXT.LOGS.STARTING_SUBNET(subnetName, itemID),
							],
						}));
					}
				} else if (statusValue === STATUS.PROCESSING) {
					updateExecutionStatus({
						isRunning: true,
						currentSubnet: subnetName,
						subnetStatuses: {
							...executionStatus.subnetStatuses,
							[String(itemID)]: STATUS.PROCESSING,
						},
					});

					setTestStatus((prev) => {
						const logs = (prev.logs || []).filter(
							(log) =>
								!log.includes(
									`Processing ${subnetName} [ID:${itemID}]`
								)
						);
						return {
							...prev,
							status: STATUS.PROCESSING,
							currentSubnet: subnetName,
							message: `Processing ${subnetName}...`,
							logs: [
								...logs,
								TEXT.LOGS.PROCESSING_SUBNET(subnetName, itemID),
							],
						};
					});
				} else if (
					statusValue === STATUS.DONE ||
					statusValue === STATUS.COMPLETED
				) {
					updateExecutionStatus({
						isRunning: statusValue !== STATUS.COMPLETED,
						currentSubnet:
							statusValue === STATUS.COMPLETED
								? undefined
								: undefined,
						completedSubnets: [
							...(executionStatus.completedSubnets || []),
							String(itemID),
						],
						subnetStatuses: {
							...executionStatus.subnetStatuses,
							[String(itemID)]: STATUS.COMPLETED,
						},
					});

					const logMessage =
						statusValue === STATUS.COMPLETED
							? TEXT.TEST_COMPLETED_SUCCESS
							: TEXT.LOGS.SUBNET_COMPLETED(subnetName, itemID);

					setTestStatus((prev) => {
						const logs = (prev.logs || []).filter(
							(log) =>
								!log.includes(
									`Processing ${subnetName} [ID:${itemID}]`
								)
						);
						return {
							...prev,
							status:
								statusValue === STATUS.COMPLETED
									? STATUS.TEST_COMPLETED
									: prev.status,
							isRunning: statusValue !== STATUS.COMPLETED,
							progress:
								statusValue === STATUS.COMPLETED
									? 100
									: prev.progress,
							message:
								statusValue === STATUS.COMPLETED
									? TEXT.TEST_COMPLETED_SUCCESS
									: prev.message,
							logs: [...logs, logMessage],
						};
					});

					if (statusValue === STATUS.COMPLETED) {
						workflowManager.markCompleted();
						stopExecution();
						socketRef.current?.disconnect();
					}
				}
			});

			socketRef.current.on(STATUS.SOCKET_EVENTS.ERROR, (error) => {
				console.error("Socket error:", error);

				workflowManager.updateResponse(error);
				workflowManager.markError();

				stopExecution();

				let errorMessage: string = TEXT.AN_ERROR_OCCURRED;
				let errorDetails = "";

				if (Array.isArray(error) && error.length > 1 && error[1]) {
					const errorData = error[1];
					errorMessage = errorData.message || errorMessage;
					errorDetails = errorData.error || "";

					console.error("Detailed error:", errorData);

					if (errorData.subnet) {
						const subnetName =
							errorData.subnet.subnetName || STATUS.UNKNOWN;
						errorDetails += ` (Subnet: ${subnetName})`;

						if (
							errorData.error &&
							errorData.error.includes(TEXT.ERRORS.INVALID_URL)
						) {
							errorDetails += ` - ${TEXT.ERRORS.CHECK_SUBNET_URL}`;
						}
					}

					if (
						errorMessage.includes("auth") ||
						errorMessage.includes("unauthorized")
					) {
						errorDetails += ` - ${TEXT.ERRORS.REFRESH_WALLET}`;
					}

					if (
						errorData.workflow ||
						errorMessage.includes("workflow")
					) {
						errorDetails += ` - ${TEXT.ERRORS.CHECK_AGENT_CONFIG}`;
					}
				} else if (typeof error === "string") {
					errorMessage = error;
				}

				setTestStatus((prev) => ({
					...prev,
					status: STATUS.FAILED,
					isRunning: false,
					message: errorMessage,
					logs: [
						...(prev.logs || []),
						TEXT.LOGS.ERROR_OCCURRED(
							errorMessage +
								(errorDetails ? ` - ${errorDetails}` : "")
						),
					],
				}));
			});

			socketRef.current.on(STATUS.SOCKET_EVENTS.DISCONNECT, (reason) => {
				console.log("Socket disconnected:", reason);
				const disconnectMessage =
					reason === "io server disconnect"
						? "Server disconnected the connection"
						: reason === "io client disconnect"
						? "Client disconnected"
						: `Connection lost: ${reason}`;

				setTestStatus((prev) => {
					if (prev.status !== STATUS.TEST_COMPLETED) {
						return {
							...prev,
							logs: [
								...(prev.logs || []),
								TEXT.LOGS.DISCONNECTED(disconnectMessage),
							],
						};
					}
					return prev;
				});
			});
		} catch (error) {
			console.error("Error testing agent:", error);
			workflowManager.markError();
			setTestStatus({
				isRunning: false,
				status: STATUS.FAILED,
				progress: 0,
				message:
					error instanceof Error
						? error.message
						: TEXT.FAILED_TO_TEST_AGENT,
				logs: [
					...(testStatus.logs || []),
					TEXT.LOGS.ERROR_OCCURRED(
						error instanceof Error
							? error.message
							: TEXT.UNKNOWN_ERROR
					),
				],
			});
		}
	};

	const progress = calculateWorkflowProgress(
		workflowManager.responses,
		workflowManager.overallStatus
	);
	const workflowItems = generateWorkflowItems(selectedAgents);

	const InsufficientFundsModal = () => {
		if (!showInsufficientFundsModal) return null;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
					<h3 className="text-lg font-semibold mb-4">
						{TEXT.MODAL.NO_NFT_TITLE}
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						{TEXT.MODAL.NO_NFT_DESCRIPTION}
					</p>
					<div className="flex gap-3 justify-end">
						<Button
							variant="outline"
							onClick={() => setShowInsufficientFundsModal(false)}
							disabled={isMinting}
						>
							{TEXT.MODAL.CANCEL}
						</Button>
						<Button onClick={handleMintNFT} disabled={isMinting}>
							{isMinting
								? TEXT.MODAL.MINTING
								: TEXT.MODAL.MINT_NFT}
						</Button>
					</div>
				</div>
			</div>
		);
	};

	const currentStepToShow = workflowManager.currentStep;

	return (
		<div>
			<InsufficientFundsModal />

			<Sidebar
				side="right"
				className={`border-r border-gray absolute top-0 right-0 h-full bg-background z-20 ${
					!open ? "w-0" : ""
				}`}
				style={{
					width: !open ? 0 : sidebarWidth,
				}}
				collapsible="icon"
				ref={sidebarRef}
			>
				{open && (
					<div
						ref={resizeRef}
						className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500/20 transition-colors z-30"
						onMouseDown={handleMouseDown}
					>
						<div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gray-300 dark:bg-gray-600 rounded-r opacity-0 hover:opacity-100 transition-opacity" />
					</div>
				)}

				<SidebarHeader className="p-4 border-b border-gray">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold">
							{Object.keys(selectedAgents || {}).length > 1
								? "Test Agents"
								: "Test Agent"}
						</h2>
						<p className="text-xs text-muted-foreground">
							{selectedAgents &&
							Object.keys(selectedAgents).length > 0
								? `NFTs: ${nfts.length}${
										selectedNft ? ` | #${selectedNft}` : ""
								  }`
								: TEXT.NO_AGENT_SELECTED}
						</p>
					</div>
				</SidebarHeader>
				<SidebarContent className="overflow-hidden flex flex-col">
					{!selectedAgents ||
					Object.keys(selectedAgents).length === 0 ? (
						<div className="p-4 text-center text-muted-foreground">
							<p className="text-sm">
								{TEXT.PLACEHOLDERS.DRAG_AGENT}
							</p>
						</div>
					) : (
						<PromptInputSection
							onRunTest={handleRunTest}
							placeholder={TEXT.PLACEHOLDERS.TEST_PROMPT}
							buttonText={TEXT.BUTTONS.RUN_TEST}
							isProcessing={testStatus.isRunning}
						/>
					)}

					{!!isSubmitted && (
						<div className="flex-1 overflow-hidden">
							<Tabs
								defaultValue="response"
								className="h-full flex flex-col gap-y-6"
							>
								<TabNavigation />

								<div className="flex-1 overflow-hidden">
									<TabsContent
										value="response"
										className="h-full m-0"
									>
										<ResponsePanel
											status={
												workflowManager.overallStatus
											}
											progress={progress}
											currentStep={
												workflowManager.currentStep ||
												undefined
											}
											responses={
												workflowManager.responses
											}
											isLoading={
												workflowManager.overallStatus ===
												STATUS.RUNNING
											}
											workflow={workflowItems}
										/>
									</TabsContent>

									<TabsContent
										value="logs"
										className="h-full m-0 px-4 pb-4"
									>
										<LogsPanel
											logs={testStatus.logs || []}
										/>
									</TabsContent>
								</div>
							</Tabs>
						</div>
					)}
				</SidebarContent>
				<SidebarFooter className="h-16 border-t border-gray z-50">
					<SidebarTrigger className="ml-auto size-8 z-50 absolute right-3 bottom-5" />
				</SidebarFooter>
			</Sidebar>
		</div>
	);
}
