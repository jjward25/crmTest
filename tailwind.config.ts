import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Clean, modern color scheme
        primary: {
          0: '#ffffff',    // Pure white
          1: '#f8fafc',    // Slate 50 - Very light background
          2: '#e2e8f0',    // Slate 200 - Light border/divider
          3: '#64748b',    // Slate 500 - Medium text/icons
          4: '#334155',    // Slate 700 - Dark text
          5: '#0f172a',    // Slate 900 - Darkest text/headers
        },
        accent: {
          light: '#dbeafe',  // Blue 100 - Light accent background
          DEFAULT: '#3b82f6', // Blue 500 - Primary accent
          dark: '#1e40af',   // Blue 700 - Dark accent
        },
        success: '#10b981',  // Emerald 500
        warning: '#f59e0b',  // Amber 500
        error: '#ef4444',    // Red 500
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config