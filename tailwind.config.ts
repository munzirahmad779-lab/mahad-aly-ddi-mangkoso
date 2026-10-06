import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mahad: {
          green: "#116a37",       // Hijau utama
          "green-dark": "#0b4a25",// Hijau latar gelap
          gold: "#d4af37",        // Emas aksen
          "gold-light": "#f4e8c1",// Emas muda lembut
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-amiri)", "serif"],
        display: ["var(--font-cinzel)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;