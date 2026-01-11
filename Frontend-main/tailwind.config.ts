import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                mono: ["var(--font-mono)", "monospace"],
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                surface: {
                    1: "#12121a",
                    2: "#1a1a25",
                    3: "#232330",
                    4: "#2d2d3d",
                },
                primary: {
                    400: "#818cf8",
                    500: "#6366f1",
                    600: "#4f46e5",
                },
            },
        },
    },
    plugins: [],
};
export default config;
