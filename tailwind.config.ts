import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
		"bg-red-500",
		"bg-green-500",
		"bg-pink-500",
		"bg-teal-500",
		"bg-amber-500",
		"bg-cyan-500",
		"bg-yellow-500",

		"bg-brand-blue",
		"bg-brand-purple",
		"bg-brand-indigo",
		"text-brand-blue",
		"text-brand-purple",
		"text-brand-indigo",
		"border-brand-blue",
		"border-brand-purple",
		"border-brand-indigo",
		"bg-brand-purple-700",
		"hover:bg-brand-blue/10",
		"hover:bg-brand-purple/10",
		"focus:bg-brand-blue/20",
		"focus:bg-brand-purple/20",
		"hover:text-brand-blue",
		"hover:text-brand-purple",
		"focus:border-brand-blue",
		"focus:border-brand-purple",
		"hover:border-brand-blue",
		"hover:border-brand-purple",
		"shadow-brand-blue",
		"shadow-brand-purple",
		"shadow-brand-indigo",
		"hover:shadow-brand-blue",
		"hover:shadow-brand-purple",
		"hover:shadow-brand-indigo",
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
					1: "hsl(var(--chart-1))",
					2: "hsl(var(--chart-2))",
					3: "hsl(var(--chart-3))",
					4: "hsl(var(--chart-4))",
					5: "hsl(var(--chart-5))",
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
				brand: {
					blue: createBrandColor("--brand-blue"),
					purple: createBrandColor("--brand-purple"),
					indigo: createBrandColor("--brand-indigo"),
				},
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			boxShadow: {
				"brand-blue": "var(--brand-shadow-blue)",
				"brand-purple": "var(--brand-shadow-purple)",
				"brand-indigo": "var(--brand-shadow-indigo)",
			},
		},
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;

function createBrandColor(varName: string) {
	return {
		50: `hsl(${varName}-50)`,
		100: `hsl(${varName}-100)`,
		200: `hsl(${varName}-200)`,
		300: `hsl(${varName}-300)`,
		400: `hsl(${varName}-400)`,
		500: `hsl(${varName}-500)`,
		600: `hsl(${varName}-600)`,
		700: `hsl(${varName}-700)`,
		800: `hsl(${varName}-800)`,
		900: `hsl(${varName}-900)`,
		DEFAULT: `hsl(${varName})`,
	};
}
