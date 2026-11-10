/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        shield: {
          navy: '#101B3A',
          dark: '#0A0F1D',
          slate: '#16223F',
          card: '#14203B',
          cardBorder: '#233863',
          blue: '#1687F7',
          cyan: '#38D9E6',
          violet: '#7755DF',
          gold: '#F2B94B',
          cream: '#F7F5EF',
          muted: '#8E9BB5',
        },
      },
      fontFamily: {
        heading: ['Outfit', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(22, 135, 247, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(56, 217, 230, 0.4)',
        'glow-violet': '0 0 25px -5px rgba(119, 85, 223, 0.4)',
        'glow-gold': '0 0 25px -5px rgba(242, 185, 75, 0.4)',
      },
      backgroundImage: {
        'grid-pattern':
          'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.05) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};
