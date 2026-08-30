import type { Config } from "tailwindcss";

const config: Config = {
  // Включаем темную тему через CSS-класс (на теге <html>)
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Акцентный primary — динамический через CSS-переменные (DesignTokensInjector)
        primary: {
          DEFAULT: "var(--color-primary)",
          50: "color-mix(in srgb, var(--color-primary) 5%, white)",
          100: "color-mix(in srgb, var(--color-primary) 10%, white)",
          200: "color-mix(in srgb, var(--color-primary) 20%, white)",
          300: "color-mix(in srgb, var(--color-primary) 40%, white)",
          400: "color-mix(in srgb, var(--color-primary) 60%, white)",
          500: "var(--color-primary)",
          600: "var(--color-primary)",
          700: "var(--color-secondary, color-mix(in srgb, var(--color-primary) 80%, black))",
          800: "color-mix(in srgb, var(--color-primary) 70%, black)",
          900: "color-mix(in srgb, var(--color-primary) 60%, black)",
          950: "color-mix(in srgb, var(--color-primary) 50%, black)",
        },
      },
      borderRadius: {
        theme: "var(--border-radius, 0.75rem)",
      },
      fontFamily: {
        theme: ["var(--font-family)", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
