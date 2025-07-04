import SkyMainBrowser from "@decloudlabs/skynet/lib/services/SkyMainBrowser";
import SkyBrowserSigner from "@decloudlabs/skynet/lib/services/SkyBrowserSigner";
import SkyEtherContractService from "@decloudlabs/skynet/lib/services/SkyEtherContractService";
import { SkyEnvConfigBrowser } from "@decloudlabs/skynet/lib/types/types";
import { ethers } from "ethers";
import axios, { AxiosError } from "axios";

export const fetchNfts = async (
	address: string,
	skyBrowser: SkyMainBrowser
) => {
	let storedNfts = JSON.parse(
		localStorage.getItem(`nfts-${address}`) || "[]"
	);
	let selectedNftId = localStorage.getItem(`selectedNftId-${address}`);

	const BATCH_SIZE = 20; // Number of NFTs to fetch in each batch

	try {
		const nftCount = await skyBrowser?.contractService.AgentNFT.balanceOf(
			address
		);
		if (nftCount) {
			const totalCount = parseInt(nftCount.toString());
			let currentIndex = storedNfts.length;

			while (currentIndex < totalCount) {
				const batchPromises = [];
				const endIndex = Math.min(
					currentIndex + BATCH_SIZE,
					totalCount
				);

				// Create batch of promises
				for (let i = currentIndex; i < endIndex; i++) {
					batchPromises.push(
						skyBrowser?.contractService.AgentNFT.tokenOfOwnerByIndex(
							address,
							i
						)
					);
				}

				// Execute batch
				const batchResults = await Promise.all(batchPromises);
				const newNftIds = batchResults
					.filter((nft) => nft)
					.map((nft) => nft.toString());

				// Update state and localStorage with new batch
				const updatedNfts = [...storedNfts, ...newNftIds].sort(
					(a, b) => parseInt(b) - parseInt(a)
				);
				storedNfts = updatedNfts;
				localStorage.setItem(
					`nfts-${address}`,
					JSON.stringify(updatedNfts)
				);

				currentIndex += BATCH_SIZE;
			}

			// Handle selected NFT after all NFTs are loaded
			if (
				!selectedNftId ||
				!(await isValidOwner(selectedNftId, address, skyBrowser))
			) {
				selectedNftId = storedNfts[0];
				localStorage.setItem(
					`selectedNftId-${address}`,
					selectedNftId!
				);
			}

			return storedNfts; // Return the NFTs array
		}
		return []; // Return empty array if no NFTs found
	} catch (error) {
		console.error("Error fetching NFTs:", error);
		return []; // Return empty array on error
	}
};

export const mintNft = async (skyBrowser: SkyMainBrowser) => {
	try {
		const registeredNFT =
			await skyBrowser.contractService.NFTMinter.getRegisteredNFTs(
				skyBrowser.contractService.AgentNFT
			);
		console.log(registeredNFT);

		const response = await skyBrowser.contractService.callContractWrite(
			skyBrowser.contractService.NFTMinter.mint(
				skyBrowser.contractService.selectedAccount,
				skyBrowser.contractService.AgentNFT,
				{
					value: registeredNFT.mintPrice,
				}
			)
		);

		if (response.success) {
			await fetchNfts(
				skyBrowser.contractService.selectedAccount,
				skyBrowser
			);
			return true;
		}
		return false;
	} catch (error) {
		console.error("Error minting NFT:", error);
		return false;
	}
};

export const mintSkynetNFT = async (
	skyBrowser: SkyMainBrowser,
	address: string,
	web3Auth: any
) => {
	try {
		const success = await mintNft(skyBrowser);
		if (success) {
			// Fetch updated NFTs after minting
			const nfts = await fetchNfts(address, skyBrowser);
			const newNftId = nfts[0]; // Get the newest NFT
			return {
				success: true,
				nftId: newNftId,
			};
		}
		return {
			success: false,
			error: "Failed to mint NFT",
		};
	} catch (error) {
		console.error("Error in mintSkynetNFT:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
};

export const fetchUserNfts = async (
	address: string,
	skyBrowser: SkyMainBrowser
) => {
	return await fetchNfts(address, skyBrowser);
};

export const getNftId = async (
	fetchUserNfts: any,
	web3Context: any,
	nfts: any,
	skyBrowser: SkyMainBrowser
) => {
	// Fetch user's NFTs first and get the updated list
	const freshNfts = await fetchUserNfts(web3Context.address, skyBrowser);

	// If user has no NFTs, try to mint one
	if (!freshNfts || freshNfts.length === 0) {
		console.log("[EXECUTE] No NFTs found, attempting to mint one...");
		const mintSuccess = await mintNft(skyBrowser);
		if (!mintSuccess) {
			return false;
		}
		// Fetch NFTs again after minting
		const updatedNfts = await fetchUserNfts(
			web3Context.address,
			skyBrowser
		);
		if (!updatedNfts || updatedNfts.length === 0) {
			console.log("[EXECUTE] Still no NFTs found after minting");
			return false;
		}
	}

	// Get the latest NFTs after potential minting
	const currentNfts = await fetchUserNfts(web3Context.address, skyBrowser);

	if (!currentNfts || currentNfts.length === 0) {
		console.log("[EXECUTE] No NFTs available after all attempts");
		return false;
	}

	// Find the first NFT that the user owns with retry logic
	let selectedNft = null;
	let retryCount = 0;
	const maxRetries = 3; // Reduced from 10 to 3 for better UX
	const retryDelay = 2000; // Reduced from 5 seconds to 2 seconds

	while (!selectedNft && retryCount < maxRetries) {
		// Check each NFT in the current list
		for (const nftId of currentNfts) {
			try {
				const nftOwner =
					await skyBrowser.contractService.AgentNFT.ownerOf(
						nftId.toString() // Ensure nftId is a string
					);
				if (
					nftOwner.toLowerCase() === web3Context.address.toLowerCase()
				) {
					selectedNft = nftId.toString(); // Ensure we return a string
					console.log(`[EXECUTE] Found valid NFT: ${selectedNft}`);
					break;
				}
			} catch (error) {
				console.warn(`[EXECUTE] Error checking NFT ${nftId}:`, error);
				continue;
			}
		}

		if (!selectedNft) {
			retryCount++;
			if (retryCount < maxRetries) {
				console.log(
					`[EXECUTE] No valid NFTs found, retrying in 2 seconds... (Attempt ${retryCount}/${maxRetries})`
				);
				await new Promise((resolve) => setTimeout(resolve, retryDelay));
				// Refresh the NFT list before retrying
				const refreshedNfts = await fetchUserNfts(
					web3Context.address,
					skyBrowser
				);
				if (refreshedNfts && refreshedNfts.length > 0) {
					// Update the current NFTs list
					currentNfts.length = 0;
					currentNfts.push(...refreshedNfts);
				}
			}
		}
	}

	if (!selectedNft) {
		console.log("[EXECUTE] No valid NFTs found after all retries");
		return false;
	}

	// Save the selected NFT to localStorage
	localStorage.setItem(`selectedNftId-${web3Context.address}`, selectedNft);
	console.log(`[EXECUTE] Selected NFT ${selectedNft} saved to localStorage`);

	return selectedNft;
};

const isValidOwner = async (
	tokenId: string,
	address: string,
	skyBrowser: SkyMainBrowser
) => {
	try {
		const owner = await skyBrowser?.contractService.AgentNFT.ownerOf(
			tokenId
		);
		return owner?.toLowerCase() === address.toLowerCase();
	} catch {
		return false;
	}
};

// Enhanced authentication with retry logic
export const getAuthWithRetry = async (
	skyBrowser: SkyMainBrowser,
	maxRetries = 3
) => {
	for (let i = 0; i < maxRetries; i++) {
		try {
			const signatureResp = await skyBrowser.appManager.getUrsulaAuth();

			if (
				signatureResp?.success &&
				signatureResp.data?.userAddress &&
				signatureResp.data?.signature &&
				signatureResp.data?.message
			) {
				return signatureResp;
			}

			console.warn(`Auth attempt ${i + 1} failed:`, signatureResp);

			// Wait before retry
			if (i < maxRetries - 1) {
				await new Promise((resolve) =>
					setTimeout(resolve, 1000 * (i + 1))
				);
			}
		} catch (error) {
			console.error(`Auth attempt ${i + 1} error:`, error);
			if (i === maxRetries - 1) throw error;
		}
	}

	throw new Error("Failed to get authentication after retries");
};

// Enhanced API request wrapper with retry logic using axios
export const makeApiRequest = async (
	url: string,
	payload: any,
	retries = 2
) => {
	for (let i = 0; i <= retries; i++) {
		try {
			console.log(`API Request attempt ${i + 1}:`, { url, payload });

			const response = await axios.post(url, payload, {
				headers: {
					"Content-Type": "application/json",
				},
				timeout: 60000, // 60 second timeout
			});

			console.log(`Response ${i + 1}:`, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});

			console.log(`Success response ${i + 1}:`, response.data);
			return response.data;
		} catch (error) {
			const axiosError = error as AxiosError;
			console.error(`Request attempt ${i + 1} failed:`, axiosError);

			if (axiosError.response) {
				// Server responded with error status
				const status = axiosError.response.status;
				const errorData = axiosError.response.data;

				console.error(`Error response ${i + 1}:`, {
					status,
					data: errorData,
					headers: axiosError.response.headers,
				});

				// Don't retry on 4xx client errors
				if (status >= 400 && status < 500) {
					const errorMessage =
						typeof errorData === "string"
							? errorData
							: (errorData as any)?.message ||
							  JSON.stringify(errorData);
					throw new Error(`Client Error ${status}: ${errorMessage}`);
				}

				// Retry on 5xx server errors
				if (i < retries && status >= 500) {
					await new Promise((resolve) =>
						setTimeout(resolve, 1000 * (i + 1))
					);
					continue;
				}

				const errorMessage =
					typeof errorData === "string"
						? errorData
						: (errorData as any)?.message ||
						  JSON.stringify(errorData);
				throw new Error(`Server Error ${status}: ${errorMessage}`);
			} else if (axiosError.request) {
				// Network error - retry if we have attempts left
				console.error(
					`Network error attempt ${i + 1}:`,
					axiosError.message
				);

				if (i < retries) {
					await new Promise((resolve) =>
						setTimeout(resolve, 1000 * (i + 1))
					);
					continue;
				}

				throw new Error(`Network Error: ${axiosError.message}`);
			} else {
				// Other error
				console.error(
					`Request setup error attempt ${i + 1}:`,
					axiosError.message
				);
				throw new Error(`Request Error: ${axiosError.message}`);
			}
		}
	}
};

// API payload validation
export const validateAPIPayload = (payload: any) => {
	const required = ["prompt", "userAuthPayload", "nftId"];
	const missing = required.filter((field) => !payload[field]);

	if (missing.length > 0) {
		throw new Error(`Missing required fields: ${missing.join(", ")}`);
	}

	if (
		!payload.userAuthPayload.userAddress ||
		!payload.userAuthPayload.signature ||
		!payload.userAuthPayload.message
	) {
		throw new Error("Invalid userAuthPayload structure");
	}

	return true;
};

// Generate agent with enhanced validation
export const generateAgentWithValidation = async (
	prompt: string,
	skyBrowser: SkyMainBrowser
) => {
	// Validate inputs
	if (!prompt?.trim()) throw new Error("Prompt is required");
	if (!skyBrowser) throw new Error("SkyBrowser not initialized");

	// Get authentication with validation
	const auth = await getAuthWithRetry(skyBrowser);

	// Get valid NFT ID
	const nfts = await fetchNfts(
		skyBrowser.contractService.selectedAccount,
		skyBrowser
	);
	const nftId = nfts.length > 0 ? nfts[0] : "0";

	console.log("Using NFT ID for workflow generation:", nftId);

	// Prepare and validate payload
	const payload = {
		prompt: prompt.trim(),
		userAuthPayload: auth.data,
		nftId,
	};

	validateAPIPayload(payload);

	// Make request with proper error handling
	return await makeApiRequest(
		"https://skyintel-c0n1.stackos.io/natural-request",
		payload
	);
};

// API call logging helper
export const logAPICall = (
	endpoint: string,
	payload: any,
	response?: any,
	error?: any
) => {
	console.group(`🔍 API Call: ${endpoint}`);
	console.log("📤 Request Payload:", JSON.stringify(payload, null, 2));
	if (response)
		console.log("📥 Response:", JSON.stringify(response, null, 2));
	if (error) console.error("❌ Error:", error);
	console.groupEnd();
};

// Skynet initialization functions
export const validateNetwork = async (
	provider: ethers.BrowserProvider
): Promise<boolean> => {
	const network = await provider.getNetwork();
	return network.chainId === BigInt(619); // Skynet chain ID
};

export const createContractService = (
	provider: any,
	signer: ethers.Signer,
	address: string
): SkyEtherContractService => {
	return new SkyEtherContractService(
		provider as never,
		signer,
		address,
		619 // Skynet chain ID
	);
};

export const createSkyBrowser = (
	contractService: SkyEtherContractService
): SkyMainBrowser => {
	const envConfig: SkyEnvConfigBrowser = {
		STORAGE_API: "https://appstorage-c0n33.stackos.io/api/lighthouse",
		CACHE: {
			TYPE: "CACHE",
		},
	};

	return new SkyMainBrowser(
		contractService,
		contractService.selectedAccount,
		new SkyBrowserSigner(
			contractService.selectedAccount,
			contractService.signer
		),
		envConfig
	);
};

export const initializeSkynet = async (
	provider: any,
	signer: ethers.Signer
): Promise<SkyMainBrowser> => {
	const ethersProvider = new ethers.BrowserProvider(provider);
	const address = await signer.getAddress();

	// Validate network
	const isValidNetwork = await validateNetwork(ethersProvider);
	if (!isValidNetwork) {
		throw new Error(`Please switch to Skynet network (Chain ID: 619)`);
	}

	// Create contract service
	const contractService = createContractService(provider, signer, address);

	// Create and initialize SkyBrowser
	const skyBrowser = createSkyBrowser(contractService);
	await skyBrowser.init(true);

	return skyBrowser;
};
