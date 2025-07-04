import { useState, useEffect, useCallback } from "react";
import { fetchNfts, mintSkynetNFT, getNftId } from "@/utils/skynetHelper";
import { useWeb3Auth } from "@/providers/Web3AuthProvider";
import { AppCryptoContext } from "@/providers/AppCryptoProvider";
import { useContext } from "react";
import toast from "react-hot-toast";
import { UI_CONFIG } from "@/config/constants";

export const useNFTManagement = () => {
	const [nfts, setNfts] = useState<number[]>([]);
	const [selectedNft, setSelectedNft] = useState<string | null>(null);
	const [isMinting, setIsMinting] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { skyBrowser } = useContext(AppCryptoContext);
	const { provider, web3Auth } = useWeb3Auth();

	const fetchNFTs = useCallback(async () => {
		if (!skyBrowser || !provider) return;

		try {
			setIsLoading(true);
			const ethersProvider = new (await import("ethers")).BrowserProvider(
				provider
			);
			const signer = await ethersProvider.getSigner();
			const address = await signer.getAddress();

			const nftList = await fetchNfts(address, skyBrowser);
			const nftNumbers = nftList.map((nft: string) => parseInt(nft));

			setNfts(nftNumbers);

			// Handle selected NFT
			const storedNftId = localStorage.getItem(
				`selectedNftId-${address}`
			);
			if (storedNftId && nftNumbers.includes(parseInt(storedNftId))) {
				setSelectedNft(storedNftId);
			} else if (nftNumbers.length > 0) {
				const newSelectedNft = nftNumbers[0].toString();
				setSelectedNft(newSelectedNft);
				localStorage.setItem(
					`selectedNftId-${address}`,
					newSelectedNft
				);
			}
		} catch (error) {
			console.error("Error fetching NFTs:", error);
			toast.error("Failed to fetch NFTs", {
				position: UI_CONFIG.TOAST.POSITION,
			});
		} finally {
			setIsLoading(false);
		}
	}, [skyBrowser, provider]);

	const mintNFT = useCallback(async () => {
		if (!skyBrowser || !provider) {
			toast.error("Wallet not connected", {
				position: UI_CONFIG.TOAST.POSITION,
			});
			return;
		}

		try {
			setIsMinting(true);
			const ethersProvider = new (await import("ethers")).BrowserProvider(
				provider
			);
			const signer = await ethersProvider.getSigner();
			const address = await signer.getAddress();

			const result = await mintSkynetNFT(skyBrowser, address, web3Auth);

			if (result.success) {
				toast.success("NFT minted successfully!", {
					position: UI_CONFIG.TOAST.POSITION,
				});
				await fetchNFTs(); // Refresh NFT list
			} else {
				toast.error(result.error || "Failed to mint NFT", {
					position: UI_CONFIG.TOAST.POSITION,
				});
			}
		} catch (error) {
			console.error("Error minting NFT:", error);
			toast.error("Failed to mint NFT", {
				position: UI_CONFIG.TOAST.POSITION,
			});
		} finally {
			setIsMinting(false);
		}
	}, [skyBrowser, provider, fetchNFTs]);

	const selectNFT = useCallback(
		(nftId: string) => {
			if (!provider) return;

			setSelectedNft(nftId);
			// Store selection in localStorage
			(async () => {
				const ethersProvider = new (
					await import("ethers")
				).BrowserProvider(provider);
				const signer = await ethersProvider.getSigner();
				const address = await signer.getAddress();
				localStorage.setItem(`selectedNftId-${address}`, nftId);
			})();
		},
		[provider]
	);

	const clearNFTs = useCallback(() => {
		if (!provider) return;

		(async () => {
			const ethersProvider = new (await import("ethers")).BrowserProvider(
				provider
			);
			const signer = await ethersProvider.getSigner();
			const address = await signer.getAddress();
			localStorage.removeItem(`nfts-${address}`);
			localStorage.removeItem(`selectedNftId-${address}`);
		})();

		setNfts([]);
		setSelectedNft(null);
	}, [provider]);

	// Auto-fetch NFTs when skyBrowser is available
	useEffect(() => {
		if (skyBrowser && provider) {
			fetchNFTs();
		}
	}, [skyBrowser, provider, fetchNFTs]);

	return {
		nfts,
		selectedNft,
		isMinting,
		isLoading,
		fetchNFTs,
		mintNFT,
		selectNFT,
		clearNFTs,
	};
};
