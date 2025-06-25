import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	safelist: [
		"bg-purple-500",
		"bg-blue-500",
		"bg-orange-500",
		"bg-green-500",
		"bg-pink-500",
		"bg-teal-500",
		"bg-amber-500",
		"bg-cyan-500",
		"bg-yellow-500",
		"bg-red-500",
		// Brand color safelist
		"bg-brand-blue",
		"bg-brand-purple",
		"bg-brand-cyan",
		"bg-brand-indigo",
		"text-brand-blue",
		"text-brand-purple",
		"text-brand-cyan",
		"text-brand-indigo",
		"border-brand-blue",
		"border-brand-purple",
		"border-brand-cyan",
		"border-brand-indigo",
	],
	theme: {
		extend: {
			fontFamily: {
				switzer: ["var(--font-switzer)", "system-ui", "sans-serif"],
				"clash-display": [
					"var(--font-clash-display)",
					"system-ui",
					"sans-serif",
				],
			},
			colors: {
				background: "var(--background)",
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
				sidebar: {
					DEFAULT: "var(--sidebar-background)",
					foreground: "hsl(var(--sidebar-foreground))",
					primary: "hsl(var(--sidebar-primary))",
					"primary-foreground":
						"hsl(var(--sidebar-primary-foreground))",
					accent: "hsl(var(--sidebar-accent))",
					"accent-foreground":
						"hsl(var(--sidebar-accent-foreground))",
					border: "hsl(var(--sidebar-border))",
					ring: "hsl(var(--sidebar-ring))",
				},
				// Skynet.io Brand Colors
				brand: {
					blue: {
						50: "hsl(var(--brand-blue-50))",
						100: "hsl(var(--brand-blue-100))",
						200: "hsl(var(--brand-blue-200))",
						300: "hsl(var(--brand-blue-300))",
						400: "hsl(var(--brand-blue-400))",
						500: "hsl(var(--brand-blue-500))", // #0ea5e9
						600: "hsl(var(--brand-blue-600))",
						700: "hsl(var(--brand-blue-700))",
						800: "hsl(var(--brand-blue-800))",
						900: "hsl(var(--brand-blue-900))",
						DEFAULT: "hsl(var(--brand-blue))",
					},
					purple: {
						50: "hsl(var(--brand-purple-50))",
						100: "hsl(var(--brand-purple-100))",
						200: "hsl(var(--brand-purple-200))",
						300: "hsl(var(--brand-purple-300))",
						400: "hsl(var(--brand-purple-400))",
						500: "hsl(var(--brand-purple-500))", // #a855f7
						600: "hsl(var(--brand-purple-600))",
						700: "hsl(var(--brand-purple-700))",
						800: "hsl(var(--brand-purple-800))",
						900: "hsl(var(--brand-purple-900))",
						DEFAULT: "hsl(var(--brand-purple))",
					},
					cyan: {
						50: "hsl(var(--brand-cyan-50))",
						100: "hsl(var(--brand-cyan-100))",
						200: "hsl(var(--brand-cyan-200))",
						300: "hsl(var(--brand-cyan-300))",
						400: "hsl(var(--brand-cyan-400))", // #22d3ee
						500: "hsl(var(--brand-cyan-500))",
						600: "hsl(var(--brand-cyan-600))",
						700: "hsl(var(--brand-cyan-700))",
						800: "hsl(var(--brand-cyan-800))",
						900: "hsl(var(--brand-cyan-900))",
						DEFAULT: "hsl(var(--brand-cyan))",
					},
					indigo: {
						50: "hsl(var(--brand-indigo-50))",
						100: "hsl(var(--brand-indigo-100))",
						200: "hsl(var(--brand-indigo-200))",
						300: "hsl(var(--brand-indigo-300))",
						400: "hsl(var(--brand-indigo-400))",
						500: "hsl(var(--brand-indigo-500))", // #6366f1
						600: "hsl(var(--brand-indigo-600))",
						700: "hsl(var(--brand-indigo-700))",
						800: "hsl(var(--brand-indigo-800))",
						900: "hsl(var(--brand-indigo-900))",
						DEFAULT: "hsl(var(--brand-indigo))",
					},
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			backgroundImage: {
				"brand-gradient": "var(--brand-gradient-primary)",
				"brand-gradient-secondary": "var(--brand-gradient-secondary)",
				"brand-gradient-hero": "var(--brand-gradient-hero)",
			},
			boxShadow: {
				"brand-blue": "var(--brand-shadow-blue)",
				"brand-purple": "var(--brand-shadow-purple)",
				"brand-cyan": "var(--brand-shadow-cyan)",
				"brand-indigo": "var(--brand-shadow-indigo)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
