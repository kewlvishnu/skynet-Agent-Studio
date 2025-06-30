import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	webpack: (config, { isServer }) => {
		// Enable WebAssembly
		config.experiments = {
			asyncWebAssembly: true,
			layers: true,
		};

		// Handle .wasm files
		config.module.rules.push({
			test: /\.wasm$/,
			type: "webassembly/async",
		});

		return config;
	},
	// Enable standalone output for Docker
	output: "standalone",
	// Ensure proper module resolution
	transpilePackages: [],
	experimental: {
		esmExternals: "loose",
	},
};

export default nextConfig;
