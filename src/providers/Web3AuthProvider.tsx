"use client";
import {
	Web3AuthProvider as Web3AuthModalProvider,
	useWeb3Auth as useWeb3AuthModal,
} from "@web3auth/modal-react-hooks";
import { web3AuthConfig } from "@/config/web3AuthConfig";
import { ReactNode, createContext, useContext } from "react";
import { CHAIN_NAMESPACES, type IWeb3Auth } from "@web3auth/base";

interface ChainContextType {
	switchChain: () => Promise<void>;
}

const ChainContext = createContext<ChainContextType>({
	switchChain: async () => {},
});

export const useChainContext = () => useContext(ChainContext);

function ChainProvider({ children }: { children: ReactNode }) {
	const { provider, web3Auth } = useWeb3AuthModal();

	const switchChain = async () => {
		if (!web3Auth || !provider) return;

		try {
			const chainConfig = web3AuthConfig.chainConfig;
			const web3AuthInstance = web3Auth as IWeb3Auth;
			await web3AuthInstance.addChain({
				chainNamespace: CHAIN_NAMESPACES.EIP155,
				chainId: chainConfig.chainId,
				rpcTarget: chainConfig.rpcTarget,
				displayName: chainConfig.displayName,
				blockExplorerUrl: chainConfig.blockExplorerUrl,
				ticker: chainConfig.ticker,
				tickerName: chainConfig.tickerName,
			});
			await web3AuthInstance.switchChain({
				chainId: chainConfig.chainId,
			});
		} catch (error) {
			console.error("Error switching chain:", error);
		}
	};

	return (
		<ChainContext.Provider value={{ switchChain }}>
			{children}
		</ChainContext.Provider>
	);
}

export const useWeb3Auth = useWeb3AuthModal;

export function Web3AuthProvider({ children }: { children: ReactNode }) {
	console.log("chain config", web3AuthConfig);
	return (
		<Web3AuthModalProvider config={web3AuthConfig}>
			<ChainProvider>{children}</ChainProvider>
		</Web3AuthModalProvider>
	);
}
