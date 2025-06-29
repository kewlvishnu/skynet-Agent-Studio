/** @type {import('next').NextConfig} */

const nextConfig = {
	webpack: (config: any) => {
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
};

module.exports = nextConfig;
