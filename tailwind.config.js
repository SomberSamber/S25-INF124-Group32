/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors based on the space/purple theme from the design
        'space-purple': {
          400: '#8878c3',
          600: '#6c5ce7',
          800: '#483D8B'
        }
      },
    },
  },
  plugins: [],
} 