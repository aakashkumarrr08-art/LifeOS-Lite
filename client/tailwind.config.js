/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      boxShadow: {
        soft: '0 20px 60px -20px rgba(15, 23, 42, 0.45)',
      },
    },
  },
  plugins: [],
};

