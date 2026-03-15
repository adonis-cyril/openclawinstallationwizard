import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0A0F1E',
          surface: '#111827',
          border: '#1F2937',
          accent: '#3B82F6',
          success: '#22C55E',
          warning: '#F59E0B',
          error: '#EF4444',
          text: '#F9FAFB',
          muted: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
};

export default config;
