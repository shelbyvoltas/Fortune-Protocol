/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'brand': {
          'gold': '#FDB813',
          'gold-light': '#FFE066',
          'gold-dark': '#D97706',
          'amber': '#F59E0B',
          'yellow': '#FFD000',
          'dark': '#0B0B0E',
          'card': '#121318',
          'card-secondary': '#191A22',
          'border': 'rgba(253, 184, 19, 0.2)',
          'border-light': 'rgba(253, 184, 19, 0.4)',
          'neon-blue': '#22D3EE',
          'neon-green': '#10B981',
          'neon-purple': '#A855F7',
        },
        'surface': {
          'DEFAULT': '#121318',
          'card': '#181920',
          'elevated': '#20222B',
          'darkest': '#08080B'
        }
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
        'display': ['Poppins', 'sans-serif'],
        'montserrat': ['Montserrat', 'sans-serif'],
        'mono': ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(253, 184, 19, 0.35)',
        'gold-glow-lg': '0 0 45px rgba(253, 184, 19, 0.55)',
        'neon-blue': '0 0 25px rgba(34, 211, 238, 0.35)',
        'card-glow': '0 10px 30px -10px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(253, 184, 19, 0.15)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #FFE066 0%, #FDB813 50%, #D97706 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #FFF1B8 0%, #FFCA28 50%, #F59E0B 100%)',
        'dark-radial': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(253, 184, 19, 0.15), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(34, 211, 238, 0.08), transparent 60%), #08080B',
      }
    },
  },
  plugins: [],
}
