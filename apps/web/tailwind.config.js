/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
        },
        district: {
          school: '#2563EB',
          schoolLight: '#60A5FA',
          retail: '#F59E0B',
          retailLight: '#FBBF24',
          digi: '#06B6D4',
          digiLight: '#38D9E6',
          community: '#8B5CF6',
          communityLight: '#A78BFA',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(22, 135, 247, 0.45)',
        'glow-cyan': '0 0 25px -5px rgba(56, 217, 230, 0.45)',
        'glow-violet': '0 0 25px -5px rgba(119, 85, 223, 0.45)',
        'glow-gold': '0 0 25px -5px rgba(242, 185, 75, 0.45)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.45)',
        'glow-card': '0 12px 35px -10px rgba(0, 0, 0, 0.65)',
      },
      backgroundImage: {
        'grid-pattern':
          'radial-gradient(circle at 1px 1px, rgba(56, 217, 230, 0.08) 1px, transparent 0)',
        'hex-pattern':
          'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
        'hero-gradient':
          'radial-gradient(circle at 75% 25%, rgba(22, 135, 247, 0.18) 0%, rgba(119, 85, 223, 0.12) 35%, transparent 70%)',
      },
    },
  },
  plugins: [],
};
