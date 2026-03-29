import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#ecf5ff',
        'bg-soft': '#ddefff',
        'bg-shell': '#d6ebff',
        glass: {
          tint: 'rgba(255,255,255,0.84)',
          soft: 'rgba(255,255,255,0.74)',
          deep: 'rgba(255,255,255,0.64)',
          stroke: 'rgba(255,255,255,0.66)',
          edge: 'rgba(6,36,89,0.14)',
        },
        ink: {
          50: '#eef4ff',
          100: '#d7e6ff',
          200: '#b4cef8',
          300: '#86acd8',
          400: '#5f89b3',
          500: '#365f87',
          600: '#234567',
          700: '#18344d',
          800: '#102337',
          900: '#081423',
        },
        line: '#adc8e8',
        card: '#ffffff',
        primary: {
          50: '#e8f2ff',
          100: '#d4e7ff',
          200: '#afcffd',
          300: '#7fb0fa',
          400: '#4c90f4',
          500: '#2378eb',
          600: '#115fd0',
          700: '#0e4ca7',
          800: '#0f3f86',
          900: '#0d2b5a',
        },
        teal: {
          50: '#e7fff7',
          100: '#c7fced',
          200: '#98f3dc',
          300: '#61e7c7',
          400: '#2dd8ae',
          500: '#18be98',
          600: '#0b9f7f',
          700: '#088066',
          800: '#086551',
          900: '#08463a',
        },
        warm: {
          100: '#edfbff',
          200: '#c7f3ff',
          300: '#98e8ff',
          400: '#4dd3ff',
          500: '#26b6f4',
        },
        success: '#08946f',
        warning: '#d78309',
        danger: '#cc2f52',
      },
      borderRadius: {
        panel: '1rem',
        field: '0.875rem',
        button: '0.875rem',
      },
      boxShadow: {
        soft: '0 16px 34px -24px rgba(8,20,35,0.34)',
        float: '0 34px 80px -34px rgba(11,59,123,0.48)',
        glass: '0 24px 56px -30px rgba(9,42,88,0.36)',
        'glass-strong': '0 44px 92px -42px rgba(9,42,88,0.5)',
      },
      backdropBlur: {
        glass: '16px',
        'glass-sm': '11px',
        'glass-xs': '6px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionDuration: {
        120: '120ms',
        180: '180ms',
        240: '240ms',
        360: '360ms',
      },
    },
  },
  plugins: [],
};

export default config;
