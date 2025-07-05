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

// Status Constants
export const STATUS = {
	// Workflow Status
	IDLE: "idle",
	INITIALIZING: "initializing",
	PROCESSING: "processing",
	RUNNING: "running",
	COMPLETED: "completed",
	FAILED: "failed",
	ERROR: "error",
	SUCCESS: "success",
	PENDING: "pending",
	DONE: "done",
	STARTING: "starting",
	DISCONNECTED: "disconnected",

	// Test Status
	TEST_COMPLETED: "test completed",

	// Default/Unknown Values
	UNKNOWN: "unknown",
	UNKNOWN_SUBNET: "Unknown Subnet",
	UNKNOWN_AGENT: "Unknown Agent",

	// Socket Events
	SOCKET_EVENTS: {
		CONNECT: "connect",
		DISCONNECT: "disconnect",
		ERROR: "error",
		STATUS: "status",
		PROCESS_REQUEST: "process-request",
	} as const,
} as const;

// Common Text Constants
export const TEXT = {
	// Labels
	AGENT: "Agent",
	AGENTS: "Agents",
	SUBNET: "Subnet",
	SUBNETS: "Subnets",
	TEST: "Test",
	ERROR: "Error",
	FAILED: "Failed",
	SUCCESS: "Success",
	COMPLETED: "Completed",
	PROCESSING: "Processing",
	RUNNING: "Running",
	IDLE: "Idle",
	UNKNOWN: "Unknown",

	// Messages
	NO_AGENT_SELECTED: "No agent selected",
	PLEASE_SELECT_AGENT: "Please select at least one agent on the canvas first",
	PLEASE_CONNECT_WALLET: "Please connect your wallet first",
	PLEASE_ENTER_PROMPT: "Please enter a prompt for the test",
	CONNECTING_TO_SKYNET: "🔗 Connecting to Skynet User Agent...",
	CONNECTED_TO_SKYNET: "✅ Connected to Skynet User Agent",
	SENT_TEST_REQUEST: "📤 Sent test request to Skynet User Agent",
	CONNECTION_FAILED:
		"❌ Connection failed - please check your internet connection and try again",
	TEST_COMPLETED_SUCCESS: "✅ Test completed successfully",
	AN_ERROR_OCCURRED: "An error occurred",
	FAILED_TO_TEST_AGENT: "Failed to test agent",
	UNKNOWN_ERROR: "Unknown error",

	// Log Messages
	LOGS: {
		STARTING_SUBNET: (subnetName: string, itemId: string) =>
			`🚀 Starting ${subnetName} [ID:${itemId}]...`,
		PROCESSING_SUBNET: (subnetName: string, itemId: string) =>
			`🔄 Processing ${subnetName} [ID:${itemId}]...`,
		SUBNET_COMPLETED: (subnetName: string, itemId: string) =>
			`✅ ${subnetName} [ID:${itemId}] completed`,
		WORKFLOW_CONTAINS: (count: number) =>
			`🔧 Workflow contains ${count} subnet(s)`,
		USING_NFT: (nftId: string) => `🎯 Using NFT #${nftId} for execution`,
		ERROR_OCCURRED: (message: string) => `❌ Error: ${message}`,
		DISCONNECTED: (reason: string) =>
			`🔌 Disconnected from Skynet User Agent - ${reason}`,
	} as const,

	// Error Messages
	ERRORS: {
		AUTH_MISSING_DATA: "Authentication response missing data",
		INVALID_AUTH_PAYLOAD: "Invalid authentication payload structure",
		PROMPT_EMPTY: "Prompt cannot be empty after trimming",
		PROMPT_TOO_LONG: "Prompt is too long (max 10000 characters)",
		NO_NFT_AVAILABLE: "No NFT ID available for testing",
		NFT_NOT_OWNED: "Selected NFT is not owned by the current user",
		NFT_VALIDATION_FAILED: "NFT validation failed",
		WORKFLOW_EMPTY:
			"Workflow cannot be empty - please add at least one subnet to your agent",
		CIRCULAR_DEPENDENCY: "Circular dependency detected between agents",
		CONNECTION_FAILED: "Failed to connect to Skynet User Agent",
		INVALID_URL: "Invalid URL",
		CHECK_SUBNET_URL: "Check subnet URL configuration",
		REFRESH_WALLET: "Try refreshing your wallet connection",
		CHECK_AGENT_CONFIG: "Check agent subnet configuration",
	} as const,

	// Modal Messages
	MODAL: {
		NO_NFT_TITLE: "No NFT Available",
		NO_NFT_DESCRIPTION:
			"You need an NFT to run tests. Would you like to mint one now?",
		CANCEL: "Cancel",
		MINT_NFT: "Mint NFT",
		MINTING: "Minting...",
	} as const,

	// Placeholder Text
	PLACEHOLDERS: {
		TEST_PROMPT: "Enter your prompt here...",
		DRAG_AGENT:
			"Drag an agent from the left sidebar to the canvas to start testing",
	} as const,

	// Button Text
	BUTTONS: {
		RUN_TEST: "Run Test",
	} as const,
} as const;

// Socket Configuration
export const SOCKET_CONFIG = {
	URL: "https://skynetuseragent-c0n1.stackos.io",
	TRANSPORTS: ["websocket"] as const,
	TIMEOUT: 600000,
	RECONNECTION: true,
	RECONNECTION_ATTEMPTS: 3,
	RECONNECTION_DELAY: 2000,
} as const;

// Validation Constants
export const VALIDATION = {
	MAX_PROMPT_LENGTH: 10000,
	MIN_PROMPT_LENGTH: 1,
} as const;
