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
        //Pale Turqoise, Tinted White, Dark Tan, Black, Dark Purple
        primary: {
          1: '#243447',
          2: '#cdba96',
          3: '#869ead',
          4: '#587f76',
          5: '#243447'
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config