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
	ResponsePanel,
	LogsPanel,
} from "./test-flow-components";
import { MoveHorizontal, Plus } from "lucide-react";
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

// Interface for subnet response data
interface SubnetResponseData {
	itemID: string;
	subnetName: string;
	status: string;
	responseMessage?: string;
	responseData?: Record<string, unknown>;
	files?: { name: string; data: string; type: string }[];
	fileData?: string;
	contentType?: string;
}

// Helper function to safely format image sources
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
	selectedAgent?: {
		id: string;
		agentName: string;
		subnets: Subnet[];
	} | null;
}

export default function RightWorkspaceSidebar({
	onWidthChange,
	selectedAgent,
}: RightWorkspaceSidebarProps) {
	const { open, state } = useSidebar();
	const [prompt, setPrompt] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [testStatus, setTestStatus] = useState<AgentTestStatus>({
		isRunning: false,
		status: "idle",
		progress: 0,
		logs: [],
	});
	const [subnetResponses, setSubnetResponses] = useState<
		SubnetResponseData[]
	>([]);
	const socketRef = useRef<Socket | null>(null);
	const {
		executionStatus,
		updateExecutionStatus,
		resetExecutionStatus,
		stopExecution,
	} = useExecutionStatus();
	const sidebarRef = useRef<HTMLDivElement>(null);
	const [sidebarWidth, setSidebarWidth] = useState(352);
	const [isResizing, setIsResizing] = useState(false);
	const resizeRef = useRef<HTMLDivElement>(null);
	const startXRef = useRef<number>(0);
	const startWidthRef = useRef<number>(352);

	const [nfts, setNfts] = useState<number[]>([]);
	const [selectedNft, setSelectedNft] = useState<string | null>(null);
	const [isMinting, setIsMinting] = useState(false);
	const [showInsufficientFundsModal, setShowInsufficientFundsModal] =
		useState(false);

	const { skyBrowser } = useContext(AppCryptoContext);
	const web3Context = useContext(Web3Context);
	const { provider, web3Auth } = useWeb3Auth();

	const minWidth = 280;
	const maxWidth = 600;

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
		onWidthChange?.(state === "collapsed" ? 0 : sidebarWidth);
	}, [state, sidebarWidth, onWidthChange]);

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

	const handleRunTest = async (prompt: string) => {
		if (!selectedAgent) {
			toast.error("Please select an agent on the canvas first");
			return;
		}

		if (!skyBrowser || !isConnectedState(web3Context)) {
			toast.error("Please connect your wallet first");
			return;
		}

		if (!prompt.trim()) {
			toast.error("Please enter a prompt for the test");
			return;
		}

		setPrompt(prompt);
		setIsSubmitted(true);

		// Initialize execution status
		resetExecutionStatus();

		let nftId: string | null = null;
		if (selectedNft) {
			// Verify the selected NFT is still valid
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

		// If no valid NFT is selected, try to get one
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
			status: "initializing",
			progress: 0,
			message: "Initializing test run...",
			logs: ["🔗 Connecting to Skynet User Agent..."],
		});

		setSubnetResponses([]);

		try {
			console.log("Getting authentication with retry logic...");
			const signature = await getAuthWithRetry(skyBrowser, 3);
			if (!signature.data) {
				throw new Error("Authentication response missing data");
			}

			const authData = signature.data;
			if (
				!authData.userAddress ||
				!authData.signature ||
				!authData.message
			) {
				console.error("Invalid auth payload structure:", authData);
				throw new Error(
					`Invalid authentication payload structure. Missing: ${
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

			console.log("Selected agent subnets:", selectedAgent.subnets);
			const validatedSubnets = selectedAgent.subnets.map(
				(subnet: any) => {
					const cleanedSubnet = { ...subnet };

					if (!cleanedSubnet.itemID) {
						console.warn(`Subnet missing itemID:`, cleanedSubnet);
					}

					if (!cleanedSubnet.subnetName) {
						console.warn(
							`Subnet missing subnetName:`,
							cleanedSubnet
						);
					}

					// Validate subnetURL field
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
				}
			);

			const trimmedPrompt = prompt.trim();
			if (!trimmedPrompt) {
				throw new Error("Prompt cannot be empty after trimming");
			}

			if (trimmedPrompt.length > 10000) {
				throw new Error("Prompt is too long (max 10000 characters)");
			}

			if (!nftId) {
				throw new Error("No NFT ID available for testing");
			}

			try {
				const nftOwner =
					await skyBrowser.contractService.AgentNFT.ownerOf(nftId);
				const userAddress = web3Context.address.toLowerCase();

				if (nftOwner.toLowerCase() !== userAddress) {
					console.error(
						`NFT ownership mismatch: NFT ${nftId} is owned by ${nftOwner}, but user is ${userAddress}`
					);
					throw new Error(
						"Selected NFT is not owned by the current user"
					);
				}

				console.log("Using validated NFT ID for testing:", nftId);
			} catch (nftError) {
				console.error("Error verifying NFT ownership:", nftError);
				throw new Error(
					`NFT validation failed: ${
						nftError instanceof Error
							? nftError.message
							: "Unknown NFT error"
					}`
				);
			}

			const validatedNftId = nftId as string;

			const workflow = validatedSubnets.map(
				(subnet: any, index: number) => {
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
						inputItemID: Array.isArray(subnet.inputItemID)
							? subnet.inputItemID
							: Array.isArray(subnet.input_item_id)
							? subnet.input_item_id
							: [],
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

					return workflowItem;
				}
			);

			if (workflow.length === 0) {
				throw new Error(
					"Workflow cannot be empty - please add at least one subnet to your agent"
				);
			}

			const payload = {
				prompt: trimmedPrompt,
				userAuthPayload: signature.data,
				accountNFT: {
					collectionID: "0",
					nftID: validatedNftId,
				},
				workflow: workflow,
			};

			logAPICall("Skynet User Agent Socket", payload, null, null);

			console.log("Sending payload to socket:", {
				prompt: trimmedPrompt,
				userAuthPayload: signature.data,
				accountNFT: {
					collectionID: "0",
					nftID: validatedNftId,
				},
				workflow: workflow,
			});

			if (socketRef.current) {
				socketRef.current.disconnect();
			}

			socketRef.current = io("https://skynetuseragent-c0n1.stackos.io", {
				transports: ["websocket"],
				timeout: 600000,
				reconnection: true,
				reconnectionAttempts: 3,
				reconnectionDelay: 2000,
			});

			socketRef.current.on("connect_error", (error) => {
				console.error("Socket connection error:", error);
				setTestStatus((prev) => ({
					...prev,
					status: "failed",
					isRunning: false,
					message: "Failed to connect to Skynet User Agent",
					logs: [
						...(prev.logs || []),
						"❌ Connection failed - please check your internet connection and try again",
					],
				}));
			});

			socketRef.current.on("connect", () => {
				setTestStatus((prev) => ({
					...prev,
					logs: [
						...(prev.logs || []),
						"✅ Connected to Skynet User Agent",
					],
				}));

				console.log("Emitting process-request event with payload");
				socketRef.current?.emit("process-request", payload);

				setTestStatus((prev) => ({
					...prev,
					logs: [
						...(prev.logs || []),
						"📤 Sent test request to Skynet User Agent",
						`🔧 Workflow contains ${workflow.length} subnet(s)`,
						`🎯 Using NFT #${validatedNftId} for execution`,
					],
				}));
			});

			socketRef.current.on("status", (data) => {
				console.log("Received status update:", data);

				let statusData = data;
				if (
					Array.isArray(data) &&
					data.length > 1 &&
					data[0] === "status"
				) {
					statusData = data[1];
				}

				const statusValue = statusData?.status || "unknown";
				const subnet = statusData?.subnet || "unknown";
				const itemID = statusData?.itemID || "unknown";

				const subnetInfo = workflow.find((s: any) => {
					return (
						s.itemID?.toString() === itemID?.toString() ||
						s.subnetName === subnet ||
						s.id === itemID?.toString()
					);
				});

				const subnetName = subnetInfo
					? subnetInfo.subnetName
					: typeof subnet === "object"
					? subnet.subnetName || "Unknown Subnet"
					: subnet;
				const totalSubnets = workflow.length;
				let progress = 0;

				console.log(
					`Status: ${statusValue} | Subnet: ${subnetName} | ItemID: ${itemID}`
				);

				if (statusValue === "starting") {
					progress = 10;
					// Update execution status context
					updateExecutionStatus({
						isRunning: true,
						currentSubnet: subnetName,
						subnetStatuses: {
							...executionStatus.subnetStatuses,
							[String(itemID)]: "processing",
						},
					});
					setTestStatus((prev) => ({
						...prev,
						status: "initializing",
						progress: 10,
						message: "Starting subnet processing...",
						logs: [
							...(prev.logs || []),
							`🚀 Starting ${subnetName} [ID:${itemID}]...`,
						],
					}));
				} else if (statusValue === "processing") {
					const currentIndex = workflow.findIndex((s: any) => {
						return (
							s.itemID?.toString() === itemID?.toString() ||
							s.subnetName === subnet ||
							s.id === itemID?.toString()
						);
					});
					progress = Math.floor((currentIndex / totalSubnets) * 100);

					// Update execution status context
					updateExecutionStatus({
						isRunning: true,
						currentSubnet: subnetName,
						subnetStatuses: {
							...executionStatus.subnetStatuses,
							[String(itemID)]: "processing",
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
							status: "processing",
							progress: progress,
							currentSubnet: subnetName,
							message: `Processing ${subnetName}...`,
							logs: [
								...logs,
								`🔄 Processing ${subnetName} [ID:${itemID}]...`,
							],
						};
					});
				} else if (statusValue === "done") {
					const currentIndex = workflow.findIndex((s: any) => {
						return (
							s.itemID?.toString() === itemID?.toString() ||
							s.subnetName === subnet ||
							s.id === itemID?.toString()
						);
					});
					progress = Math.floor(
						((currentIndex + 1) / totalSubnets) * 100
					);

					// Update execution status context - mark subnet as completed
					updateExecutionStatus({
						isRunning: true,
						currentSubnet: undefined,
						completedSubnets: [
							...(executionStatus.completedSubnets || []),
							String(itemID),
						],
						subnetStatuses: {
							...executionStatus.subnetStatuses,
							[String(itemID)]: "completed",
						},
					});

					let responseMessage = "";
					let responseData: Record<string, unknown> | null = null;

					if (statusData.response) {
						if (typeof statusData.response === "string") {
							responseMessage = statusData.response;
						} else if (statusData.response.message) {
							responseMessage = statusData.response.message;
							responseData = statusData.response as Record<
								string,
								unknown
							>;
						} else {
							responseData = statusData.response as Record<
								string,
								unknown
							>;
						}
					}

					let fileData = null;
					if (statusData.fileData && statusData.contentType) {
						const fileName =
							statusData.fileName ||
							`file-${Date.now()}.${
								statusData.contentType.split("/")[1] || "bin"
							}`;
						const fileDataString =
							typeof statusData.fileData === "string"
								? statusData.fileData
								: "";

						fileData = {
							name: fileName,
							data: fileDataString,
							type: statusData.contentType,
						};

						setTestStatus((prev) => ({
							...prev,
							logs: [
								...(prev.logs || []),
								`📁 ${subnetName} [ID:${itemID}] generated file: ${fileName}`,
							],
						}));
					}

					setSubnetResponses((prev) => {
						const existingIndex = prev.findIndex(
							(r) => r.itemID === itemID
						);
						if (existingIndex >= 0) {
							const updated = [...prev];
							updated[existingIndex] = {
								...updated[existingIndex],
								status: "completed",
								responseMessage:
									responseMessage ||
									updated[existingIndex].responseMessage,
								responseData:
									responseData ||
									updated[existingIndex].responseData,
								files: fileData
									? [
											...(updated[existingIndex].files ||
												[]),
											fileData,
									  ]
									: updated[existingIndex].files,
								fileData:
									statusData.fileData ||
									updated[existingIndex].fileData,
								contentType:
									statusData.contentType ||
									updated[existingIndex].contentType,
							};
							return updated;
						} else {
							return [
								...prev,
								{
									itemID,
									subnetName,
									status: "completed",
									responseMessage,
									responseData: responseData || undefined,
									files: fileData ? [fileData] : undefined,
									fileData: statusData.fileData,
									contentType: statusData.contentType,
								},
							];
						}
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
							logs: [
								...logs,
								`✅ ${subnetName} [ID:${itemID}] completed`,
							],
						};
					});
				} else if (statusValue === "completed") {
					progress = 100;

					// Stop execution but keep completed states
					stopExecution();

					setTestStatus((prev) => ({
						...prev,
						status: "test completed",
						progress: 100,
						isRunning: false,
						message: "Test completed successfully",
						logs: [
							...(prev.logs || []),
							`✅ Test completed successfully`,
						],
					}));

					socketRef.current?.disconnect();
				}

				if (statusValue === "completed") {
					setTestStatus((prev) => ({
						...prev,
						progress: 100,
						status: "test completed",
						isRunning: false,
						message: "Test completed successfully",
					}));
				}
			});

			socketRef.current.on("error", (error) => {
				console.error("Socket error:", error);

				// Stop execution on error
				stopExecution();

				let errorMessage = "An error occurred";
				let errorDetails = "";

				if (Array.isArray(error) && error.length > 1 && error[1]) {
					const errorData = error[1];
					errorMessage = errorData.message || errorMessage;
					errorDetails = errorData.error || "";

					console.error("Detailed error:", errorData);

					if (errorData.subnet) {
						const subnetName =
							errorData.subnet.subnetName || "unknown";
						errorDetails += ` (Subnet: ${subnetName})`;

						if (
							errorData.error &&
							errorData.error.includes("Invalid URL")
						) {
							errorDetails += " - Check subnet URL configuration";
						}
					}

					if (
						errorMessage.includes("auth") ||
						errorMessage.includes("unauthorized")
					) {
						errorDetails +=
							" - Try refreshing your wallet connection";
					}

					if (
						errorData.workflow ||
						errorMessage.includes("workflow")
					) {
						errorDetails += " - Check agent subnet configuration";
					}
				} else if (typeof error === "string") {
					errorMessage = error;
				}

				setTestStatus((prev) => ({
					...prev,
					status: "failed",
					isRunning: false,
					message: errorMessage,
					logs: [
						...(prev.logs || []),
						`❌ Error: ${errorMessage}${
							errorDetails ? ` - ${errorDetails}` : ""
						}`,
					],
				}));
			});

			socketRef.current.on("disconnect", (reason) => {
				console.log("Socket disconnected:", reason);
				const disconnectMessage =
					reason === "io server disconnect"
						? "Server disconnected the connection"
						: reason === "io client disconnect"
						? "Client disconnected"
						: `Connection lost: ${reason}`;

				setTestStatus((prev) => {
					if (prev.status !== "test completed") {
						return {
							...prev,
							logs: [
								...(prev.logs || []),
								`🔌 Disconnected from Skynet User Agent - ${disconnectMessage}`,
							],
						};
					}
					return prev;
				});
			});
		} catch (error) {
			console.error("Error testing agent:", error);
			setTestStatus({
				isRunning: false,
				status: "failed",
				progress: 0,
				message:
					error instanceof Error
						? error.message
						: "Failed to test agent",
				logs: [
					...(testStatus.logs || []),
					`❌ Error: ${
						error instanceof Error ? error.message : "Unknown error"
					}`,
				],
			});
		}
	};

	const testResults = subnetResponses.map((response, index) => ({
		id: index + 1,
		testId: response.itemID,
		subnetName: response.subnetName,
		response: response.responseMessage || "No response message",
		hasImage: Boolean(
			(response.files &&
				response.files.some((f) => f.type.startsWith("image/"))) ||
				(response.contentType &&
					response.contentType.startsWith("image/"))
		),
		fileName:
			response.files?.[0]?.name ||
			`file-${response.itemID}.${
				response.contentType?.split("/")[1] || "bin"
			}`,
		responseData:
			JSON.stringify(response.responseData, null, 2) || undefined,
		fileData: response.fileData,
		contentType: response.contentType,
	}));

	const InsufficientFundsModal = () => {
		if (!showInsufficientFundsModal) return null;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
				<div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
					<h3 className="text-lg font-semibold mb-4">
						No NFT Available
					</h3>
					<p className="text-gray-600 dark:text-gray-300 mb-6">
						You need an NFT to run tests. Would you like to mint one
						now?
					</p>
					<div className="flex gap-3 justify-end">
						<Button
							variant="outline"
							onClick={() => setShowInsufficientFundsModal(false)}
							disabled={isMinting}
						>
							Cancel
						</Button>
						<Button onClick={handleMintNFT} disabled={isMinting}>
							{isMinting ? "Minting..." : "Mint NFT"}
						</Button>
					</div>
				</div>
			</div>
		);
	};

	const currentStepToShow = (() => {
		if (!testStatus.currentSubnet) return undefined;
		const found = subnetResponses.find(
			(r) => r.subnetName === testStatus.currentSubnet
		);
		if (found && found.status === "completed") return undefined;
		return testStatus.currentSubnet;
	})();

	return (
		<div>
			<InsufficientFundsModal />
			<Sidebar
				side="right"
				className={`border-r border-gray absolute top-0 right-0 h-full bg-background z-20 ${
					state === "collapsed" ? "w-0" : ""
				}`}
				style={{
					width: state === "collapsed" ? 0 : sidebarWidth,
				}}
				collapsible="icon"
				ref={sidebarRef}
			>
				{state !== "collapsed" && (
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
							{selectedAgent?.agentName || "Test Agent"}
						</h2>
						<p className="text-xs text-muted-foreground">
							NFTs: {nfts.length}
							{selectedNft && ` | #${selectedNft}`}
						</p>
					</div>
				</SidebarHeader>
				<SidebarContent className="overflow-hidden flex flex-col">
					{!selectedAgent ? (
						<div className="p-4 text-center text-muted-foreground">
							<p className="text-sm">
								Drag an agent from the left sidebar to the
								canvas to start testing
							</p>
						</div>
					) : (
						<PromptInputSection
							onRunTest={handleRunTest}
							placeholder={`Test ${selectedAgent.agentName}...`}
							buttonText="Run Test"
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
											status={testStatus.status}
											progress={testStatus.progress}
											currentStep={currentStepToShow}
											testResults={testResults}
											isLoading={
												testStatus.isRunning
													? true
													: false
											}
											subnetResponses={subnetResponses}
											workflow={
												selectedAgent?.subnets?.map(
													(subnet, index) => ({
														id:
															subnet.unique_id ||
															`subnet-${index}`,
														itemID: subnet.itemID,
														subnetName:
															subnet.subnetName,
													})
												) || []
											}
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
