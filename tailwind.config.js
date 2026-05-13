/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fitti: {
          bg: '#FFFFFF',
          'bg-alt': '#F4FBEB',
          green: '#76B900',
          'green-dark': '#528100',
          'green-light': '#F4FBEB',
          orange: '#76B900',
          'orange-light': '#D1E5B2',
          white: '#FFFFFF',
          border: '#e2ead8',
          text: '#111111',
          'text-muted': '#6b7b68',
          'text-dark': '#111111',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        accent: ['"Playfair Display"', 'serif'],
      },
      letterSpacing: {
        widest: '0.15em',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'countPulse 2s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'spin-slow': 'spinSlow 8s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
