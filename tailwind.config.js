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
          // Fortune Protocol G — Navy Blue palette
          'primary':   '#2563EB',
          'accent':    '#38BDF8',
          'soft':      '#60A5FA',
          'navy':      '#081426',
          'navy-secondary': '#0D1B35',
          'card':      '#0D1A2D',
          'border':    '#233653',
          // Legacy aliases kept for backward-compat
          'gold':      '#2563EB',
          'gold-light':'#60A5FA',
          'gold-dark': '#1D4ED8',
          'amber':     '#38BDF8',
          'yellow':    '#93C5FD',
          'dark':      '#060D19',
          'card-secondary': '#0A1628',
          'neon-blue': '#38BDF8',
          'neon-green':'#22C55E',
          'neon-purple':'#818CF8',
        },
        'surface': {
          'DEFAULT':   '#0D1A2D',
          'card':      '#0D1B35',
          'elevated':  '#152347',
          'darkest':   '#060D19',
        }
      },
      fontFamily: {
        'sans':        ['Inter', 'Poppins', 'sans-serif'],
        'display':     ['Inter', 'Poppins', 'sans-serif'],
        'montserrat':  ['Montserrat', 'sans-serif'],
        'mono':        ['Inter', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'blue-glow':    '0 0 25px rgba(37, 99, 235, 0.35)',
        'blue-glow-lg': '0 0 45px rgba(37, 99, 235, 0.55)',
        'accent-glow':  '0 0 25px rgba(56, 189, 248, 0.35)',
        'card-glow':    '0 10px 30px -10px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(37, 99, 235, 0.18)',
        // legacy alias
        'gold-glow':    '0 0 25px rgba(37, 99, 235, 0.35)',
        'gold-glow-lg': '0 0 45px rgba(37, 99, 235, 0.55)',
        'neon-blue':    '0 0 25px rgba(56, 189, 248, 0.35)',
      },
      backgroundImage: {
        'fpg-gradient':    'linear-gradient(135deg, #081426 0%, #12366A 50%, #2563EB 100%)',
        'blue-gradient':   'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
        'blue-gradient-hover': 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
        // legacy aliases
        'gold-gradient':       'linear-gradient(135deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)',
        'gold-gradient-hover': 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
        'dark-radial': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(37, 99, 235, 0.18), transparent 70%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(56, 189, 248, 0.1), transparent 60%), #060D19',
      }
    },
  },
  plugins: [],
}
