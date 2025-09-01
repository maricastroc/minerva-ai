import type { Config } from "tailwindcss";
import scrollbar from "tailwind-scrollbar";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Bai Jamjuree", "sans-serif"], 
      },
      colors: {
        primary: {
          blue300: '#0810ea',
          blue400: '#1300ef',
          blue500: '#180dea',
          blue600: '#09006e',
          blue700: '#05003b',
          orange300: '#f8562f',
          orange400: '#f75739',
          gray100: '#f5f5f5',
          gray200: '#eeeeee',
          gray300: '#888888',
          gray400: '#1e1e1e',
          purple100: '#e0deff',
        }
      }
    },
  },
    plugins: [scrollbar],
} satisfies Config;
