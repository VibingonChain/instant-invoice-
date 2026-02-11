import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#22c55e',
          dark: '#0a0f1a',
          card: '#111827',
          border: '#1f2937',
        },
      },
    },
  },
  plugins: [],
};

export default config;
