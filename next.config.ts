/** @type {import('next').NextConfig} */

const nextConfig = {
	webpack: (config) => {
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

		// Add path alias configuration
		config.resolve.alias = {
			...config.resolve.alias,
			"@": "./src",
		};

		return config;
	},
	// Enable standalone output for Docker
	output: "standalone",
};

module.exports = nextConfig;
