import type { Config } from "tailwindcss";
import scrollbar from "tailwind-scrollbar";

export default {
content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Mais abrangente
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Se estiver em pasta components
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Bai Jamjuree", "sans-serif"], 
      },
      colors: {
        primary: {
          blue500: '#6185f6',
        }
      }
    },
  },
    plugins: [scrollbar],
} satisfies Config;
