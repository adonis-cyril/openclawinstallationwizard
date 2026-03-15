import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        brand: {
          bg: '#F5F0E8',
          surface: '#FFFDF9',
          elevated: '#FFFFFF',
          border: '#E0D9CE',
          'border-subtle': '#EDE8E0',
          accent: '#C67A25',
          'accent-hover': '#B06A1A',
          dark: '#1A1A1A',
          success: '#2D7A4E',
          warning: '#C67A25',
          error: '#B83B3B',
          text: '#1A1A1A',
          muted: '#7A7164',
          'muted-light': '#A39B8F',
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'elevated': '0 8px 24px rgba(0, 0, 0, 0.08)',
      },
    },
  },
  plugins: [],
};

export default config;
