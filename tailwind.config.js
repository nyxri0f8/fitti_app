/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fitti: {
          bg: 'rgb(var(--fitti-bg) / <alpha-value>)',
          'bg-alt': 'rgb(var(--fitti-bg-alt) / <alpha-value>)',
          green: 'rgb(var(--fitti-green) / <alpha-value>)',
          'green-dark': 'rgb(var(--fitti-green-dark) / <alpha-value>)',
          'green-light': 'rgb(var(--fitti-green-light) / <alpha-value>)',
          orange: 'rgb(var(--fitti-orange) / <alpha-value>)',
          border: 'rgb(var(--fitti-border) / <alpha-value>)',
          text: 'rgb(var(--fitti-text) / <alpha-value>)',
          'text-muted': 'rgb(var(--fitti-text-muted) / <alpha-value>)',
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
      transitionTimingFunction: {
        'vanguard': 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
