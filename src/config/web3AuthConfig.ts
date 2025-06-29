import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3AuthOptions } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

export type ChainType = 'mainnet';

interface ChainConfig {
    chainId: string;
    rpcTarget: string;
    displayName: string;
    blockExplorerUrl: string;
    ticker: string;
    tickerName: string;
}

// Chain configuration for Skynet
const CHAIN_CONFIG: ChainConfig = {
    chainId: "0x26B", // Chain ID 619 in hex
    rpcTarget: "https://rpc.skynet.io",
    displayName: "Skynet",
    blockExplorerUrl: "https://explorer.skynet.io",
    ticker: "sUSD",
    tickerName: "sUSD"
};

const clientId = "BFMHaURTzER--ksK8FwGk3Dv242l-YmrkErFJwnsjl4i4-NiHOqNow8WgjnZQi4QegSt7u9pURyRs9ptwImZqy0";

// EVM Chain Config
const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    ...CHAIN_CONFIG
};

// Web3Auth Options
const web3AuthOptions: Web3AuthOptions = {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
    chainConfig,
    privateKeyProvider: new EthereumPrivateKeyProvider({
        config: { chainConfig }
    })
};

export const web3AuthConfig = {
    web3AuthOptions,
    clientId,
    chainConfig
}; 