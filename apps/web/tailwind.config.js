/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        shield: {
          void: '#070B16',
          dark: '#0A0F1D',
          navy: '#101B3A',
          slate: '#16223F',
          card: '#14203B',
          surface: '#182747',
          cardBorder: '#233863',
          blue: '#1687F7',
          cyan: '#38D9E6',
          violet: '#7755DF',
          gold: '#F2B94B',
          amber: '#F59E0B',
          emerald: '#10B981',
          rose: '#F43F5E',
          cream: '#F7F5EF',
          muted: '#8E9BB5',
          subtle: '#4B5563',
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
