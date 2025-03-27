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
        //Pale Turqoise, Tinted White, Black, 
        primary: {
          0: '#ffffff', // white
          1: '#ebecf0', // grey
          2: '#cdba96', // tan
          3: '#869ead', //Pale Turqoise
          4: '#587f76', //green
          5: '#243447' // dark purple
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config