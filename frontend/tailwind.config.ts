import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#15803d', // Tailwind green-700
          foreground: '#ffffff',
          light: '#dcfce7', // green-100
          hover: '#166534', // green-800
          dark: '#14532d', // green-900
          surface: '#f0fdf4', // green-50
        },
        emerald: {
          500: '#10b981',
          600: '#059669',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
          border: '#fecaca',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fffbeb',
          border: '#fde68a',
        },
        safe: {
          DEFAULT: '#16a34a',
          light: '#f0fdf4',
          dark: '#166534',
          border: '#bbf7d0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 24px -4px rgba(21, 128, 61, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.05)',
        float: '0 10px 30px -5px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
export default config;
