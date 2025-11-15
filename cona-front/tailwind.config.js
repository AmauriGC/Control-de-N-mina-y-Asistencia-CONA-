/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        background: '#F9FAFA',
        foreground: '#090C0B',
        card: '#FFFFFF',
        'card-foreground': '#090C0B',
        popover: '#FFFFFF',
        'popover-foreground': '#090C0B',
        primary: {
          DEFAULT: '#709486',
          foreground: '#F9FAFA',
        },
        secondary: {
          DEFAULT: '#AFC2C3',
          foreground: '#090C0B',
        },
        muted: {
          DEFAULT: '#91A8AD',
          foreground: '#090C0B',
        },
        accent: {
          DEFAULT: '#709486',
          foreground: '#F9FAFA',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
        border: '#AFC2C3',
        input: '#AFC2C3',
        ring: '#709486',
      },
      borderRadius: {
        lg: '0.5rem',
      },
    },
  },
  plugins: [],
}
