"use client";
import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";
import { ethers } from "ethers";
import { CONNECT_STATES, Web3Context } from "./Web3ContextProvider";
import SkyMainBrowser from "@decloudlabs/skynet/lib/services/SkyMainBrowser";
import SkyBrowserSigner from "@decloudlabs/skynet/lib/services/SkyBrowserSigner";
import SkyEtherContractService from "@decloudlabs/skynet/lib/services/SkyEtherContractService";
import toast from "react-hot-toast";
import { SkyEnvConfigBrowser } from "@decloudlabs/skynet/lib/types/types";
import { useWeb3Auth } from "@web3auth/modal-react-hooks";

interface AppCryptoConfig {
	skyBrowser: SkyMainBrowser | null;
	initAppCrypto: ((address: string) => Promise<void>) | null;
}

export const AppCryptoContext = createContext<AppCryptoConfig>({
	skyBrowser: null,
	initAppCrypto: null,
});

interface Props {
	children: ReactNode;
}

export function AppCryptoContextProvider({ children }: Props) {
	const [skyBrowser, setSkyBrowser] = useState<SkyMainBrowser | null>(null);
	const web3Context = useContext(Web3Context);
	const { provider } = useWeb3Auth();

	const initAppCrypto = useCallback(async () => {
		try {
			console.log("initAppCrypto - starting initialization");

			if (!provider) {
				throw new Error("No provider available for initialization");
			}

			const ethersProvider = new ethers.BrowserProvider(provider!);
			const signer = await ethersProvider.getSigner();
			const selectedAccount = signer.address;
			console.log("selectedAccount", selectedAccount);

			// Validate that we're on the correct chain (619 for Skynet)
			const network = await ethersProvider.getNetwork();
			console.log("Current network:", network.chainId);

			if (network.chainId !== 619n) {
				console.warn(
					`Wrong network detected: ${network.chainId}, expected: 619`
				);
				toast.error("Please switch to Skynet network (Chain ID: 619)", {
					position: "top-right",
				});
				return;
			}

			const contractInstance = new SkyEtherContractService(
				provider! as never,
				signer,
				selectedAccount,
				619
			);

			const defaultEnvConfig: SkyEnvConfigBrowser = {
				STORAGE_API:
					"https://appstorage-c0n33.stackos.io/api/lighthouse",
				CACHE: {
					TYPE: "CACHE",
				},
			};

			console.log("Creating skyMainBrowser instance...");
			const skyMainBrowser = new SkyMainBrowser(
				contractInstance!,
				contractInstance.selectedAccount,
				new SkyBrowserSigner(
					contractInstance.selectedAccount,
					contractInstance.signer
				),
				defaultEnvConfig
			);

			console.log("Initializing skyMainBrowser...");
			await skyMainBrowser.init(true);

			console.log("SkyMainBrowser initialized successfully:", {
				account: skyMainBrowser.contractService.selectedAccount,
				chainId: network.chainId.toString(),
			});

			setSkyBrowser(skyMainBrowser);
			toast.success("Wallet connected successfully!", {
				position: "top-right",
			});
		} catch (err: unknown) {
			const error: Error = err as Error;
			console.error("AppCrypto initialization error:", error);

			let errorMessage = "Failed to initialize wallet connection";

			if (error.message.includes("user rejected")) {
				errorMessage = "Connection was rejected. Please try again.";
			} else if (error.message.includes("network")) {
				errorMessage =
					"Network error. Please check your connection and try again.";
			} else if (error.message.includes("Chain")) {
				errorMessage = "Please switch to the Skynet network.";
			}

			toast.error(errorMessage, {
				position: "top-right",
			});
		}
	}, [provider]);

	useEffect(() => {
		if (
			web3Context.status !== CONNECT_STATES.CONNECTED ||
			!provider ||
			!("address" in web3Context)
		)
			return;
		initAppCrypto();
	}, [web3Context, provider, initAppCrypto]);

	return (
		<AppCryptoContext.Provider value={{ skyBrowser, initAppCrypto }}>
			{children}
		</AppCryptoContext.Provider>
	);
}
