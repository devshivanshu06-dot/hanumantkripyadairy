/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a',
          light: '#f0f4ff',
          dark: '#1e3a8a',
        },
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        'lg': '20px',
      }
    },
  },
  plugins: [],
};