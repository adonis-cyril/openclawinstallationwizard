import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#06080F',
          surface: '#0D1117',
          elevated: '#161B22',
          border: '#21262D',
          'border-subtle': '#161B22',
          accent: '#4F8FF7',
          purple: '#A855F7',
          success: '#2DD4BF',
          warning: '#FBBF24',
          error: '#F87171',
          text: '#E6EDF3',
          muted: '#7D8590',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(79, 143, 247, 0.15)',
        'glow-lg': '0 0 40px rgba(79, 143, 247, 0.2)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.15)',
      },
    },
  },
  plugins: [],
};

export default config;
