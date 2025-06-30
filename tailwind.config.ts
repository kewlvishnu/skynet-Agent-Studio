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

		// Brand Colors
		"bg-royal-blue",
		"bg-royal-blue-hover",
		"bg-royal-blue-active",
		"bg-royal-blue-dark",
		"bg-eerie-black",
		"bg-eerie-black-hover",
		"bg-anti-flash-white",
		"bg-anti-flash-white-hover",
		"text-royal-blue",
		"text-eerie-black",
		"text-anti-flash-white",
		"border-royal-blue",
		"border-eerie-black",
		"border-anti-flash-white",
		"hover:bg-royal-blue",
		"hover:bg-eerie-black",
		"hover:text-royal-blue",
		"hover:text-eerie-black",
		"hover:border-royal-blue",
		"hover:border-eerie-black",
		"active:bg-royal-blue",
		"active:bg-eerie-black",
		"focus:bg-royal-blue/20",
		"focus:bg-eerie-black/20",
		"focus:border-royal-blue",
		"focus:border-eerie-black",
		"shadow-royal-blue",
		"shadow-eerie-black",
		"hover:shadow-royal-blue",
		"hover:shadow-eerie-black",

		// Legacy brand classes
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
				// Brand Colors
				"royal-blue": {
					DEFAULT: "hsl(var(--royal-blue))",
					hover: "hsl(var(--royal-blue-hover))",
					active: "hsl(var(--royal-blue-active))",
					dark: "hsl(var(--royal-blue-dark))",
					"dark-hover": "hsl(var(--royal-blue-dark-hover))",
					"dark-active": "hsl(var(--royal-blue-dark-active))",
					darker: "hsl(var(--royal-blue-darker))",
				},
				"eerie-black": {
					DEFAULT: "hsl(var(--eerie-black))",
					hover: "hsl(var(--eerie-black-hover))",
					active: "hsl(var(--eerie-black-active))",
					darker: "hsl(var(--eerie-black-darker))",
					darkest: "hsl(var(--eerie-black-darkest))",
					ultra: "hsl(var(--eerie-black-ultra))",
					deepest: "hsl(var(--eerie-black-deepest))",
				},
				"anti-flash-white": {
					DEFAULT: "hsl(var(--anti-flash-white))",
					hover: "hsl(var(--anti-flash-white-hover))",
					active: "hsl(var(--anti-flash-white-active))",
					base: "hsl(var(--anti-flash-white-base))",
					medium: "hsl(var(--anti-flash-white-medium))",
					dark: "hsl(var(--anti-flash-white-dark))",
					darker: "hsl(var(--anti-flash-white-darker))",
				},
				// Gray Scale
				gray: {
					DEFAULT: "hsl(var(--gray))",
					dark: "hsl(var(--gray-dark))",
					darkest: "hsl(var(--gray-darkest))",
				},
				// Blue Accents
				"blue-accent": {
					light: "hsl(var(--blue-accent-light))",
					"light-hover": "hsl(var(--blue-accent-light-hover))",
					"light-active": "hsl(var(--blue-accent-light-active))",
				},
				// Secondary Gray Blues
				"secondary-gray-blue": {
					DEFAULT: "hsl(var(--secondary-gray-blue))",
					hover: "hsl(var(--secondary-gray-blue-hover))",
					active: "hsl(var(--secondary-gray-blue-active))",
				},

				// Legacy Theme Colors
				background: "hsl(var(--background))",
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
					DEFAULT: "hsl(var(--sidebar-background))",
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
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
		},
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
