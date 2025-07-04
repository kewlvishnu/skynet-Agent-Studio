// Network Configuration
export const NETWORK_CONFIG = {
	SKYNET: {
		CHAIN_ID: 619,
		CHAIN_ID_HEX: "0x26B",
		RPC_URL: "https://rpc.skynet.io",
		EXPLORER_URL: "https://explorer.skynet.io",
		TICKER: "sUSD",
		TICKER_NAME: "sUSD",
		DISPLAY_NAME: "Skynet",
	},
} as const;

// API Configuration
export const API_CONFIG = {
	STORAGE_API: "https://appstorage-c0n33.stackos.io/api/lighthouse",
	SKYINTEL_API: "https://skyintel-c0n1.stackos.io/natural-request",
	BATCH_SIZE: 20,
	MAX_RETRIES: 3,
	RETRY_DELAY: 2000,
} as const;

// UI Configuration
export const UI_CONFIG = {
	SIDEBAR: {
		MIN_WIDTH: 280,
		MAX_WIDTH: 600,
		DEFAULT_WIDTH: 352,
	},
	TOAST: {
		POSITION: "top-right" as const,
	},
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
	TYPE: "CACHE" as const,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
	NFTS: (address: string) => `nfts-${address}`,
	SELECTED_NFT: (address: string) => `selectedNftId-${address}`,
} as const;
