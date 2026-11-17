/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Token names kept from the original theme so every page picks up the cozy palette.
        shield: {
          void: 'rgb(var(--shield-void) / <alpha-value>)',
          dark: 'rgb(var(--shield-dark) / <alpha-value>)',
          navy: 'rgb(var(--shield-navy) / <alpha-value>)',
          slate: 'rgb(var(--shield-slate) / <alpha-value>)',
          card: 'rgb(var(--shield-card) / <alpha-value>)',
          surface: 'rgb(var(--shield-surface) / <alpha-value>)',
          cardBorder: 'rgb(var(--shield-cardBorder) / <alpha-value>)',
          blue: 'rgb(var(--shield-blue) / <alpha-value>)',
          cyan: 'rgb(var(--shield-cyan) / <alpha-value>)',
          violet: 'rgb(var(--shield-violet) / <alpha-value>)',
          gold: 'rgb(var(--shield-gold) / <alpha-value>)',
          amber: 'rgb(var(--shield-amber) / <alpha-value>)',
          emerald: 'rgb(var(--shield-emerald) / <alpha-value>)',
          rose: 'rgb(var(--shield-rose) / <alpha-value>)',
          cream: 'rgb(var(--shield-cream) / <alpha-value>)',
          muted: 'rgb(var(--shield-muted) / <alpha-value>)',
          subtle: 'rgb(var(--shield-subtle) / <alpha-value>)',
          peach: 'rgb(var(--shield-peach) / <alpha-value>)',
          sky: 'rgb(var(--shield-sky) / <alpha-value>)',
        },
        district: {
          school: '#4E9BD6',
          schoolLight: '#6FB7E8',
          retail: '#E0A24A',
          retailLight: '#E8B75D',
          digi: '#159A9C',
          digiLight: '#4FC1B9',
          community: '#9A86D6',
          communityLight: '#B9A6E5',
        },
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
        drift: {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(110%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.35s ease-out both',
        bob: 'bob 2.8s ease-in-out infinite',
        drift: 'drift 60s linear infinite',
      },
      fontFamily: {
        heading: ['Fredoka', 'Nunito', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        // Pixel face for small quest labels / markers only; the old mono labels map here.
        mono: ['"Pixelify Sans"', 'ui-monospace', 'monospace'],
        pixel: ['"Pixelify Sans"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        // Old "glow" names now give a soft drop + tactile bottom lip instead of neon.
        'glow-blue': '0 4px 0 0 rgb(var(--shield-blue) / 0.45), 0 12px 24px -12px rgb(var(--shield-blue) / 0.6)',
        'glow-cyan': '0 4px 0 0 rgb(var(--shield-cyan) / 0.35), 0 12px 24px -12px rgb(var(--shield-cyan) / 0.5)',
        'glow-violet': '0 4px 0 0 rgb(var(--shield-violet) / 0.35), 0 12px 24px -12px rgb(var(--shield-violet) / 0.5)',
        'glow-gold': '0 4px 0 0 rgb(var(--shield-gold) / 0.4), 0 12px 24px -12px rgb(var(--shield-gold) / 0.5)',
        'glow-emerald': '0 4px 0 0 rgb(var(--shield-emerald) / 0.35), 0 12px 24px -12px rgb(var(--shield-emerald) / 0.5)',
        'glow-card': '0 3px 0 0 rgb(var(--shield-cardBorder) / 0.9), 0 18px 34px -20px rgb(var(--shield-shadow) / 0.55)',
        cozy: '0 3px 0 0 rgb(var(--shield-cardBorder) / 0.9), 0 18px 34px -20px rgb(var(--shield-shadow) / 0.55)',
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle at 1px 1px, rgb(var(--shield-cardBorder) / 0.35) 1px, transparent 0)',
        'hex-pattern': 'radial-gradient(circle at 1px 1px, rgb(var(--shield-cardBorder) / 0.3) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
