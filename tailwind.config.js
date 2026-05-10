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
          bg: '#F5F5F0',
          'bg-alt': '#EAF0EC',
          green: '#1B5E3B',
          'green-dark': '#0F3D25',
          'green-light': '#8BAF9A',
          orange: '#C84B00',
          'orange-light': '#E8651A',
          white: '#FFFFFF',
          border: '#D4E4DA',
          text: '#1B5E3B',
          'text-muted': '#8BAF9A',
          'text-dark': '#0A1F13',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.15em',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
